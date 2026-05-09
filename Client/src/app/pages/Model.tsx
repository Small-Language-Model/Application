import { Brain, Cpu, Zap, Database, Code2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';

export default function Model() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              VitalLM: Small Language Model Architecture
            </h1>
            <p className="text-lg md:text-xl text-purple-100 mb-8">
              A compact, efficient language model designed for real-world applications.
              Open-source, customizable, and deployment-ready.
            </p>
            <Link
              to="/guide"
              className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Technical Specifications
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <Cpu className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Parameters</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">1.5B</p>
              <p className="text-sm text-slate-600">
                Optimized parameter count for efficiency without sacrificing performance
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <Zap className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Inference Speed</h3>
              <p className="text-3xl font-bold text-green-600 mb-2">45 ms</p>
              <p className="text-sm text-slate-600">
                Average latency per token on standard hardware (RTX 3090)
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <Database className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Context Window</h3>
              <p className="text-3xl font-bold text-purple-600 mb-2">8K</p>
              <p className="text-sm text-slate-600">
                Tokens of context support for long-form conversations
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <Brain className="w-8 h-8 text-orange-600 mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Architecture</h3>
              <p className="text-xl font-bold text-orange-600 mb-2">Transformer</p>
              <p className="text-sm text-slate-600">
                24-layer decoder with multi-head attention
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <Code2 className="w-8 h-8 text-pink-600 mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Training Data</h3>
              <p className="text-3xl font-bold text-pink-600 mb-2">500B</p>
              <p className="text-sm text-slate-600">
                Tokens from diverse, curated datasets
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
              <TrendingUp className="w-8 h-8 text-cyan-600 mb-3" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Benchmark Score</h3>
              <p className="text-3xl font-bold text-cyan-600 mb-2">82%</p>
              <p className="text-sm text-slate-600">
                Average performance across MMLU benchmarks
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Model Capabilities */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
            What VitalLM Can Do
          </h2>
          <p className="text-lg text-slate-600 mb-12 text-center max-w-2xl mx-auto">
            Designed for practical applications across industries
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Natural Language Understanding
              </h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Sentiment analysis and text classification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Named entity recognition (NER)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Question answering and information retrieval</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Intent detection for chatbots</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Text Generation
              </h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Content creation and copywriting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Code generation and completion</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Summarization of long documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Creative writing assistance</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Conversational AI
              </h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Multi-turn dialogue management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Context-aware responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Customer support automation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Personalized recommendations</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Domain Specialization
              </h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Fine-tuning on custom datasets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Industry-specific language adaptation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Multi-language support (50+ languages)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Transfer learning capabilities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Details */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
            Architecture Overview
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border-2 border-blue-200">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Model Structure</h3>
                  <p className="text-slate-700">
                    VitalLM uses a decoder-only transformer architecture with 24 layers,
                    12 attention heads per layer, and a hidden dimension of 2048. The model
                    employs rotary positional embeddings (RoPE) for better position encoding.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Tokenization</h3>
                  <p className="text-slate-700">
                    Uses byte-pair encoding (BPE) with a vocabulary size of 50,000 tokens,
                    optimized for multilingual performance and code understanding.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Training Approach</h3>
                  <p className="text-slate-700">
                    Trained using causal language modeling on 500B tokens from web text,
                    books, code repositories, and scientific papers. Includes instruction
                    fine-tuning and RLHF for improved alignment.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Optimization</h3>
                  <p className="text-slate-700">
                    Supports 8-bit and 4-bit quantization for reduced memory footprint.
                    Compatible with FlashAttention for faster inference. Can run on consumer
                    GPUs (12GB+ VRAM) or CPUs with acceptable performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">
            Real-World Use Cases
          </h2>
          <p className="text-lg text-slate-600 mb-12 text-center max-w-2xl mx-auto">
            See how organizations are using VitalLM
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Healthcare</h3>
              <p className="text-slate-600 text-sm">
                Medical record summarization and patient interaction automation while
                maintaining HIPAA compliance through on-premise deployment.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Code2 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Software Development</h3>
              <p className="text-slate-600 text-sm">
                Code completion, documentation generation, and bug detection fine-tuned
                on proprietary codebases.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Financial Services</h3>
              <p className="text-slate-600 text-sm">
                Sentiment analysis of market news, customer service automation, and
                compliance document processing in secure environments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Deploy VitalLM?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Access our model through the cloud or deploy on your infrastructure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/chat"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Try the Chat
            </Link>
            <Link
              to="/guide"
              className="px-8 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20"
            >
              Download Model
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
