import { useState } from 'react';
import { Download, Scale, Settings, Shield, ChevronDown, ChevronUp, BookOpen, Terminal, Code, Server } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function Guide() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "What are the system requirements for running VitalLM?",
      answer: "VitalLM requires a minimum of 12GB RAM (16GB recommended), 10GB disk space, and either a GPU with 12GB+ VRAM (NVIDIA RTX 3080 or better) or a modern multi-core CPU. Python 3.8+ is required."
    },
    {
      question: "Can I use VitalLM for commercial purposes?",
      answer: "Yes! VitalLM is licensed under MIT, allowing commercial use. You can use it in your products, fine-tune it, and deploy it on your infrastructure without restrictions."
    },
    {
      question: "How does token-based pricing work?",
      answer: "Free accounts receive 1,000 tokens daily. Each token represents approximately 4 characters of text. Additional tokens can be purchased at $10 per 100,000 tokens. Self-hosted deployments have no token limits."
    },
    {
      question: "What's the difference between the cloud API and self-hosted deployment?",
      answer: "The cloud API is managed by us with instant access and pay-per-use pricing. Self-hosted deployment gives you complete control, runs on your infrastructure, and has no usage limits but requires setup and maintenance."
    },
    {
      question: "How long does fine-tuning take?",
      answer: "Fine-tuning time depends on your dataset size and hardware. A typical fine-tuning run on 10,000 examples takes 2-4 hours on a single RTX 3090. Larger datasets or multi-GPU setups will vary accordingly."
    },
    {
      question: "Is my data safe when using the cloud API?",
      answer: "Yes. We don't store your prompts or responses beyond the session. For maximum security and compliance requirements, consider self-hosting on your infrastructure."
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Documentation & FAQ
            </h1>
            <p className="text-lg md:text-xl text-green-100">
              Everything you need to download, deploy, scale, and fine-tune VitalLM
            </p>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-12 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="#download"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Download className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-slate-900">Download</span>
            </a>
            <a
              href="#scale"
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Scale className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-slate-900">Scale</span>
            </a>
            <a
              href="#finetune"
              className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <Settings className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-slate-900">Fine-tune</span>
            </a>
            <a
              href="#onpremise"
              className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-medium text-slate-900">On-Premise</span>
            </a>
          </div>
        </div>
      </section>

      {/* Download Guide */}
      <section id="download" className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">How to Download VitalLM</h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Install Prerequisites</h3>
                </div>
                <div className="ml-11">
                  <p className="text-slate-700 mb-3">
                    Ensure you have Python 3.8+ and pip installed on your system.
                  </p>
                  <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div>python --version</div>
                    <div>pip --version</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Install VitalLM Package</h3>
                </div>
                <div className="ml-11">
                  <p className="text-slate-700 mb-3">
                    Use pip to install the official VitalLM package:
                  </p>
                  <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    pip install vitallm
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Download Model Weights</h3>
                </div>
                <div className="ml-11">
                  <p className="text-slate-700 mb-3">
                    Download the pre-trained model weights (approximately 3GB):
                  </p>
                  <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div>vitallm download --model base-1.5b</div>
                    <div className="text-slate-500"># Downloads to ~/.vitallm/models/</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                    4
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Test Your Installation</h3>
                </div>
                <div className="ml-11">
                  <p className="text-slate-700 mb-3">
                    Run a quick test to verify the installation:
                  </p>
                  <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div>python -c "import vitallm; print(vitallm.__version__)"</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scaling Guide */}
      <section id="scale" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">How to Scale VitalLM</h2>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Depth Upscaling</h3>
                <p className="text-slate-700 mb-4">
                  Scale the model by adding more layers for improved performance on complex tasks:
                </p>
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-3">
                  <div>from vitallm import VitalLM, ScalingConfig</div>
                  <div className="mt-2">config = ScalingConfig(</div>
                  <div>    num_layers=36,  # Increase from 24 to 36</div>
                  <div>    hidden_size=2048,</div>
                  <div>    num_attention_heads=12</div>
                  <div>)</div>
                  <div className="mt-2">model = VitalLM.from_pretrained(</div>
                  <div>    "base-1.5b",</div>
                  <div>    scaling_config=config</div>
                  <div>)</div>
                </div>
                <p className="text-sm text-slate-600">
                  Note: Scaling increases memory requirements. A 36-layer model requires ~18GB VRAM.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Width Scaling</h3>
                <p className="text-slate-700 mb-4">
                  Increase hidden dimensions for better representation capacity:
                </p>
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div>config = ScalingConfig(</div>
                  <div>    num_layers=24,</div>
                  <div>    hidden_size=3072,  # Increase from 2048</div>
                  <div>    num_attention_heads=16</div>
                  <div>)</div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Multi-GPU Scaling</h3>
                <p className="text-slate-700 mb-4">
                  Distribute the model across multiple GPUs:
                </p>
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div>model = VitalLM.from_pretrained(</div>
                  <div>    "base-1.5b",</div>
                  <div>    device_map="auto",  # Automatic GPU distribution</div>
                  <div>    max_memory={"{0: '24GB', 1: '24GB'}"}</div>
                  <div>)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fine-tuning Guide */}
      <section id="finetune" className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">How to Fine-Tune VitalLM</h2>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Prepare Your Dataset</h3>
                </div>
                <div className="ml-11">
                  <p className="text-slate-700 mb-3">
                    Format your data as JSONL with prompt-response pairs:
                  </p>
                  <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div>{`{"prompt": "What is AI?", "response": "AI is..."}`}</div>
                    <div>{`{"prompt": "Explain ML", "response": "ML is..."}`}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Configure Training</h3>
                </div>
                <div className="ml-11">
                  <p className="text-slate-700 mb-3">
                    Set up training parameters:
                  </p>
                  <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div>from vitallm import Trainer, TrainingConfig</div>
                    <div className="mt-2">config = TrainingConfig(</div>
                    <div>    learning_rate=2e-5,</div>
                    <div>    batch_size=8,</div>
                    <div>    num_epochs=3,</div>
                    <div>    warmup_steps=100,</div>
                    <div>    output_dir="./finetuned-model"</div>
                    <div>)</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Run Fine-Tuning</h3>
                </div>
                <div className="ml-11">
                  <p className="text-slate-700 mb-3">
                    Start the training process:
                  </p>
                  <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div>model = VitalLM.from_pretrained("base-1.5b")</div>
                    <div>trainer = Trainer(model, config)</div>
                    <div>trainer.train("path/to/dataset.jsonl")</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center font-bold text-orange-600">
                    4
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">Evaluate & Deploy</h3>
                </div>
                <div className="ml-11">
                  <p className="text-slate-700 mb-3">
                    Test your fine-tuned model:
                  </p>
                  <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <div>model = VitalLM.from_pretrained("./finetuned-model")</div>
                    <div>response = model.generate("Your test prompt")</div>
                    <div>print(response)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* On-Premise Deployment */}
      <section id="onpremise" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">On-Premise Deployment</h2>
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Security Benefits</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Complete data sovereignty - no data leaves your infrastructure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>HIPAA, GDPR, and SOC 2 compliance ready</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Air-gapped deployment support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>Full control over model versions and updates</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Docker Deployment</h3>
                <p className="text-slate-700 mb-4">
                  Deploy VitalLM using Docker for easy containerization:
                </p>
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-3">
                  <div># Pull the official image</div>
                  <div>docker pull vitallm/base:1.5b</div>
                  <div className="mt-2"># Run the container</div>
                  <div>docker run -d \</div>
                  <div>  --gpus all \</div>
                  <div>  -p 8000:8000 \</div>
                  <div>  -v /path/to/models:/models \</div>
                  <div>  vitallm/base:1.5b</div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Kubernetes Deployment</h3>
                <p className="text-slate-700 mb-4">
                  For production scale, deploy on Kubernetes:
                </p>
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div>kubectl apply -f vitallm-deployment.yaml</div>
                  <div>kubectl apply -f vitallm-service.yaml</div>
                  <div>kubectl apply -f vitallm-ingress.yaml</div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Network Configuration</h3>
                <p className="text-slate-700 mb-3">
                  Configure your firewall and network settings:
                </p>
                <ul className="space-y-2 text-slate-700 text-sm">
                  <li>• Expose port 8000 for API access (or configure custom port)</li>
                  <li>• Enable HTTPS with your SSL certificates</li>
                  <li>• Set up VPN access for remote team members</li>
                  <li>• Configure load balancing for high availability</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Monitoring & Maintenance</h3>
                <p className="text-slate-700 mb-3">
                  Set up monitoring for production deployments:
                </p>
                <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div># Install monitoring tools</div>
                  <div>pip install vitallm[monitoring]</div>
                  <div className="mt-2"># Enable metrics endpoint</div>
                  <div>vitallm serve --enable-metrics --metrics-port 9090</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4 text-slate-700">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Additional Resources
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="#"
              className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg transition-shadow border border-blue-100"
            >
              <Terminal className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">API Documentation</h3>
              <p className="text-sm text-slate-600">
                Complete API reference and integration guides
              </p>
            </a>

            <a
              href="#"
              className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-lg transition-shadow border border-purple-100"
            >
              <Code className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Code Examples</h3>
              <p className="text-sm text-slate-600">
                Sample projects and implementation patterns
              </p>
            </a>

            <a
              href="#"
              className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-lg transition-shadow border border-green-100"
            >
              <Server className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">GitHub Repository</h3>
              <p className="text-sm text-slate-600">
                Source code, issues, and community contributions
              </p>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
