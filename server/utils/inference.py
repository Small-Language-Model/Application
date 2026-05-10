import importlib.util
import os
from pathlib import Path
from types import ModuleType

import torch
import torch.nn.functional as F
from dotenv import load_dotenv
from huggingface_hub import hf_hub_download
from tokenizers import ByteLevelBPETokenizer
from transformers import PreTrainedTokenizerFast

from schemas.inference import GenerateRequest

load_dotenv()


def _to_absolute_path(path_value: str, base_dir: Path) -> Path:
    path = Path(path_value)
    return path if path.is_absolute() else base_dir / path


class InferenceService:
    def __init__(self) -> None:
        self._model = None
        self._tokenizer: PreTrainedTokenizerFast | None = None
        self._device = "cpu"
        self._block_size = 256
        self._loaded = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded and self._model is not None and self._tokenizer is not None

    @property
    def device(self) -> str:
        return self._device

    def _import_model_module(self, model_py_path: Path) -> ModuleType:
        spec = importlib.util.spec_from_file_location("vitallm_model_module", model_py_path)
        if spec is None or spec.loader is None:
            raise RuntimeError(f"Unable to load model module from: {model_py_path}")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

    def load(self) -> None:
        if self.is_loaded:
            return

        requested_device = os.getenv("VITALLM_DEVICE", "auto").lower()
        if requested_device == "cuda":
            self._device = "cuda"
        elif requested_device == "cpu":
            self._device = "cpu"
        else:
            self._device = "cuda" if torch.cuda.is_available() else "cpu"

        hf_model_id = os.getenv("VITALLM_HF_MODEL_ID", "").strip()
        if hf_model_id:
            self._load_hf_model(hf_model_id)
            return

        base_dir = Path(__file__).resolve().parents[1]
        model_py_path = _to_absolute_path(os.getenv("VITALLM_MODEL_PY_PATH", "model.py"), base_dir)
        weights_path = _to_absolute_path(os.getenv("VITALLM_WEIGHTS_PATH", "VitalLM_SFT_Best.pt"), base_dir)
        vocab_path = _to_absolute_path(os.getenv("VITALLM_VOCAB_PATH", "vocab_50m.json"), base_dir)
        merges_path = _to_absolute_path(os.getenv("VITALLM_MERGES_PATH", "merges_50m.txt"), base_dir)

        required_files = [model_py_path, weights_path, vocab_path, merges_path]
        missing_files = [str(file_path) for file_path in required_files if not file_path.exists()]
        if missing_files:
            raise RuntimeError(
                "Missing required inference files: " + ", ".join(missing_files)
            )

        module = self._import_model_module(model_py_path)
        if not hasattr(module, "SLM") or not hasattr(module, "SLMConfig"):
            raise RuntimeError("model.py must expose SLM and SLMConfig")

        config = module.SLMConfig(
            vocab_size=16384,
            n_layer=10,
            n_head=8,
            n_embd=512,
            block_size=256,
            dropout=0.0,
        )
        self._block_size = config.block_size
        model = module.SLM(config)

        state_dict = torch.load(weights_path, map_location=self._device)
        model.load_state_dict(state_dict)
        model.to(self._device)
        model.eval()
        self._model = model

        base_tokenizer = ByteLevelBPETokenizer(
            vocab=str(vocab_path),
            merges=str(merges_path),
        )
        self._tokenizer = PreTrainedTokenizerFast(
            tokenizer_object=base_tokenizer,
            eos_token="<|endoftext|>",
            bos_token="<|endoftext|>",
            unk_token="<|endoftext|>",
            pad_token="<|endoftext|>",
        )
        self._loaded = True

    def _load_hf_model(self, model_id: str) -> None:
        model_py_path = hf_hub_download(repo_id=model_id, filename="model.py", repo_type="model")
        weights_path = hf_hub_download(repo_id=model_id, filename="VitalLM_SFT_Best.pt", repo_type="model")
        vocab_path = hf_hub_download(repo_id=model_id, filename="vocab_50m.json", repo_type="model")
        merges_path = hf_hub_download(repo_id=model_id, filename="merges_50m.txt", repo_type="model")

        module = self._import_model_module(Path(model_py_path))
        if not hasattr(module, "SLM") or not hasattr(module, "SLMConfig"):
            raise RuntimeError("model.py must expose SLM and SLMConfig")

        config = module.SLMConfig(
            vocab_size=16384,
            n_layer=10,
            n_head=8,
            n_embd=512,
            block_size=256,
            dropout=0.0,
        )
        self._block_size = config.block_size
        model = module.SLM(config)

        state_dict = torch.load(weights_path, map_location=self._device)
        model.load_state_dict(state_dict)
        model.to(self._device)
        model.eval()
        self._model = model

        base_tokenizer = ByteLevelBPETokenizer(
            vocab=str(vocab_path),
            merges=str(merges_path),
        )
        self._tokenizer = PreTrainedTokenizerFast(
            tokenizer_object=base_tokenizer,
            eos_token="<|endoftext|>",
            bos_token="<|endoftext|>",
            unk_token="<|endoftext|>",
            pad_token="<|endoftext|>",
        )
        self._loaded = True

    def generate(self, request: GenerateRequest) -> str:
        if not self.is_loaded:
            raise RuntimeError("Inference model is not loaded")

        assert self._model is not None
        assert self._tokenizer is not None

        prompt = request.prompt.strip()
        if not prompt:
            raise ValueError("Prompt cannot be empty")

        encoded = self._tokenizer.encode(prompt)
        input_tokens = encoded if isinstance(encoded, list) else encoded.ids
        if not input_tokens:
            raise ValueError("Prompt could not be tokenized")

        input_ids = torch.tensor(input_tokens, dtype=torch.long).unsqueeze(0).to(self._device)

        with torch.no_grad():
            for _ in range(request.max_new_tokens):
                input_ids_cond = input_ids[:, -self._block_size:]
                if input_ids_cond.size(1) == 0:
                    break

                logits, _ = self._model(input_ids_cond)
                logits = logits[:, -1, :]
                logits = logits / max(request.temperature, 1e-5)

                for token in set(input_ids[0].tolist()):
                    if logits[0, token] > 0:
                        logits[0, token] /= request.repetition_penalty
                    else:
                        logits[0, token] *= request.repetition_penalty

                sorted_logits, sorted_indices = torch.sort(logits, descending=True)
                cumulative_probs = torch.cumsum(F.softmax(sorted_logits, dim=-1), dim=-1)
                sorted_indices_to_remove = cumulative_probs > request.top_p
                sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
                sorted_indices_to_remove[..., 0] = 0
                logits[0, sorted_indices[sorted_indices_to_remove]] = -float("Inf")

                top_k = min(request.top_k, logits.size(-1))
                values, _ = torch.topk(logits, top_k)
                logits[logits < values[:, [-1]]] = -float("Inf")

                next_token = torch.multinomial(F.softmax(logits, dim=-1), num_samples=1)
                input_ids = torch.cat((input_ids, next_token), dim=1)

                if next_token.item() == self._tokenizer.eos_token_id:
                    break

        return self._tokenizer.decode(input_ids[0].tolist(), skip_special_tokens=True)


inference_service = InferenceService()
