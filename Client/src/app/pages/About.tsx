import { Link } from 'react-router';
import { Brain, Sparkles, Shield, Zap, Users, Image as ImageIcon, ArrowRight } from 'lucide-react';

const repositoryUrl = 'https://github.com/Small-Language-Model/Application';

const contributors = [
  {
    name: 'Onkar Jondhale',
    username: 'OnkarJondhale',
    avatar: 'https://github.com/OnkarJondhale.png?size=240',
  },
  {
    name: 'Rushikesh Hiray',
    username: 'Rushi992145',
    avatar: 'https://github.com/Rushi992145.png?size=240',
  },
  {
    name: 'Aman Jain',
    username: 'Aman041902',
    avatar: 'https://github.com/Aman041902.png?size=240',
  },
  {
    name: 'Brijmohan Gour',
    username: 'brijmohan17',
    avatar: 'https://github.com/brijmohan17.png?size=240',
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">About VitalLM</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Built for teams that want control, speed, and clarity.
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl">
              VitalLM is a small language model platform focused on simple usage, clean UI, and flexible deployment.
              It is maintained in the public repository below.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors shadow-lg"
              >
                View GitHub Repository
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/guide"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-white/10 backdrop-blur-sm text-white font-semibold hover:bg-white/20 transition-colors border border-white/20"
              >
                Read the Guide
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Simple by design</h2>
              <p className="text-slate-600 text-sm">
                The app keeps the interface focused so people can chat, upgrade, and manage their account without friction.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Flexible deployment</h2>
              <p className="text-slate-600 text-sm">
                Run it in the cloud or self-host it. The same codebase supports both paths with minimal setup.
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Built for people</h2>
              <p className="text-slate-600 text-sm">
                Prompt-based usage, straightforward billing, and a layout that stays out of the way while you work.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              What VitalLM does
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">A practical small language model platform</h2>
            <p className="text-slate-600 mb-6">
              The goal is not to overwhelm users with complexity. It is to give a clean, fast interface for chat,
              prompt usage, plan upgrades, and account management with enough flexibility for real products.
            </p>
            <div className="space-y-3 text-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-2" />
                <p>Cloud chat for quick access.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-2" />
                <p>Subscription plans with prompt balances.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-2" />
                <p>Self-hosting support for full control.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 min-h-40 flex flex-col justify-between shadow-lg">
              <span className="text-sm uppercase tracking-wide text-white/80">Foundation</span>
              <p className="text-xl font-semibold">Built around a simple prompt flow.</p>
            </div>
            <div className="rounded-3xl bg-white border border-slate-200 p-6 min-h-40 flex flex-col justify-between shadow-sm">
              <span className="text-sm uppercase tracking-wide text-slate-400">Balance</span>
              <p className="text-xl font-semibold text-slate-900">Prompt counts stay visible.</p>
            </div>
            <div className="rounded-3xl bg-white border border-slate-200 p-6 min-h-40 flex flex-col justify-between shadow-sm">
              <span className="text-sm uppercase tracking-wide text-slate-400">Security</span>
              <p className="text-xl font-semibold text-slate-900">Authentication and billing stay separate.</p>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white p-6 min-h-40 flex flex-col justify-between shadow-lg">
              <span className="text-sm uppercase tracking-wide text-white/80">Delivery</span>
              <p className="text-xl font-semibold">Cloud or on-premise deployment.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-4">
                <ImageIcon className="w-4 h-4" />
                Contributors
              </div>
              <h2 className="text-3xl font-bold text-slate-900">People who worked on this</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {contributors.map((contributor) => (
              <a
                key={contributor.username}
                href={`https://github.com/${contributor.username}`}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6 flex items-center gap-4">
                  <img
                    src={contributor.avatar}
                    alt={contributor.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-200 bg-white"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{contributor.name}</h3>
                    <p className="text-sm text-slate-500">@{contributor.username}</p>
                    <p className="text-sm text-slate-600 mt-2">GitHub contributor</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to explore VitalLM?</h2>
          <p className="text-slate-600 mb-8">
            Start chatting, compare plans, or read the guide depending on what you need next.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/chat" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
              Go to Chat
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/pricing" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-white transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
