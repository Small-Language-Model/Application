import { Link } from 'react-router';
import { Brain, Code, Shield, Zap, Download, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Open Source • Scalable • Secure</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Your Own Small Language Model,
              <br />
              <span className="text-blue-200">On Your Terms</span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              VitalLM is an open-source small language model designed for flexibility.
              Use it via our API, or download and train it on your own infrastructure for maximum security and control.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/chat"
                  className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Start Chatting
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
                >
                  Get Started Free
                </Link>
              )}
              <Link
                to="/guide"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Why Choose VitalLM?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A powerful small language model that adapts to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Efficient & Fast
              </h3>
              <p className="text-slate-600">
                Small language model optimized for speed without sacrificing quality. Perfect for real-time applications.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Open Source
              </h3>
              <p className="text-slate-600">
                Download our base model, inspect the architecture, and customize it for your specific use case.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                On-Premise Security
              </h3>
              <p className="text-slate-600">
                Deploy on your own servers. Your data never leaves your infrastructure, ensuring complete privacy.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Fine-Tunable
              </h3>
              <p className="text-slate-600">
                Train the model on your domain-specific data for superior performance in your industry.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl">
              <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Easy Download
              </h3>
              <p className="text-slate-600">
                Get started quickly with our pre-trained models. Download, install, and run in minutes.
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl">
              <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Flexible Pricing
              </h3>
              <p className="text-slate-600">
                Start free with daily token limits. Scale with pay-as-you-go tokens or deploy your own instance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Two Ways to Use VitalLM
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cloud Option */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-blue-100">
              <div className="text-center mb-6">
                <div className="inline-flex px-4 py-2 bg-blue-600 text-white rounded-full font-semibold mb-4">
                  Cloud API
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Use Our Hosted Service
                </h3>
                <p className="text-slate-600">
                  Quick start with our managed infrastructure
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">1</span>
                  </div>
                  <span className="text-slate-700">Sign up for a free account</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">2</span>
                  </div>
                  <span className="text-slate-700">Get 1,000 free tokens daily</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-bold">3</span>
                  </div>
                  <span className="text-slate-700">Purchase additional tokens as needed</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full block text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Self-Hosted Option */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-100">
              <div className="text-center mb-6">
                <div className="inline-flex px-4 py-2 bg-purple-600 text-white rounded-full font-semibold mb-4">
                  Self-Hosted
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Deploy On Your Infrastructure
                </h3>
                <p className="text-slate-600">
                  Maximum control and security
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="purple-blue-600 text-sm font-bold">1</span>
                  </div>
                  <span className="text-slate-700">Download the base model</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-sm font-bold">2</span>
                  </div>
                  <span className="text-slate-700">Fine-tune on your dataset</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 text-sm font-bold">3</span>
                  </div>
                  <span className="text-slate-700">Deploy on-premise for complete privacy</span>
                </li>
              </ul>
              <Link
                to="/guide"
                className="w-full block text-center px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of developers using VitalLM for their AI applications
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={user ? "/chat" : "/register"}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              {user ? "Go to Chat" : "Start Free Trial"}
            </Link>
            <Link
              to="/model"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
