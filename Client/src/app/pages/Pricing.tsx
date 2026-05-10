import { Check, Zap, Crown, Building2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { createBillingOrder, verifyBillingPayment } from '../lib/api';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Pricing() {
  const { user, setAuthToken } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  const handleSubscribe = async (subscriptionPlan: 'starter' | 'pro' | 'enterprise') => {
    if (!user) {
      navigate('/register');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/login');
      return;
    }

    setBillingError(null);
    setIsProcessing(true);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setBillingError('Unable to load Razorpay checkout. Please try again.');
        return;
      }

      const order = await createBillingOrder({
        payment_type: 'subscription',
        subscription_plan: subscriptionPlan,
      }, token);

      const options = {
        key: order.razorpay_key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'VitalLM',
        description: `Subscribe to ${subscriptionPlan.charAt(0).toUpperCase() + subscriptionPlan.slice(1)} Plan`,
        order_id: order.order_id,
        handler: async (response: any) => {
          try {
            await verifyBillingPayment(
              {
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                payment_type: 'subscription',
                subscription_plan: subscriptionPlan,
              },
              token,
            );
            await setAuthToken(token);
            navigate('/chat');
          } catch (verifyError) {
            setBillingError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#2563eb',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      setBillingError('Unable to create billing order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const tiers = [
    {
      name: 'Free',
      id: 'free' as const,
      icon: Zap,
      price: 0,
      description: 'Perfect for trying out VitalLM',
      features: [
        '1,000 prompts per day',
        'Access to chat interface',
        'Model documentation',
        'Community support',
        'Basic rate limits',
      ],
      limitations: [
        'Daily prompt reset',
        'No priority support',
        'Standard response time',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Starter',
      id: 'starter' as const,
      icon: Zap,
      price: 19,
      description: 'Great for individuals and small projects',
      features: [
        '50,000 prompts per month',
        'Priority chat access',
        'Email support',
        'API access',
        'Usage analytics',
        'No daily limits',
      ],
      cta: 'Purchase',
      highlighted: false,
    },
    {
      name: 'Pro',
      id: 'pro' as const,
      icon: Crown,
      price: 49,
      description: 'Best for professionals and growing teams',
      features: [
        '200,000 prompts per month',
        'Priority support 24/7',
        'Advanced API features',
        'Custom fine-tuning assistance',
        'Team collaboration (up to 5 users)',
        'Detailed analytics dashboard',
        'SLA guarantee',
      ],
      cta: 'Purchase',
      highlighted: true,
      popular: true,
    },
    {
      name: 'Enterprise',
      id: 'enterprise' as const,
      icon: Building2,
      price: 199,
      description: 'For large organizations with custom needs',
      features: [
        '1,000,000 prompts per month',
        'Dedicated account manager',
        'Custom model training',
        'On-premise deployment support',
        'Unlimited team members',
        'SSO and advanced security',
        'Custom SLA',
        'Priority feature requests',
      ],
      cta: 'Purchase',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            Start free with 1,000 daily prompts, then scale with flexible subscription plans
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              const isCurrentPlan = user?.subscriptionTier === tier.id;

              return (
                <div
                  key={tier.id}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all h-full flex flex-col ${
                    tier.highlighted
                      ? 'border-blue-600 scale-105'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        tier.highlighted ? 'bg-blue-600' : 'bg-slate-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${tier.highlighted ? 'text-white' : 'text-slate-600'}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-slate-900">
                          ${tier.price}
                        </span>
                        {tier.price > 0 && (
                          <span className="text-slate-500">/month</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 mt-2">{tier.description}</p>
                    </div>

                    <ul className="space-y-3 mb-6 flex-1">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {tier.limitations && (
                      <ul className="space-y-2 mb-6 pt-4 border-t border-slate-200">
                        {tier.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-slate-400 text-sm">•</span>
                            <span className="text-xs text-slate-500">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-auto pt-6">
                      {tier.id === 'free' ? (
                      <Link
                        to={user ? '/chat' : '/register'}
                        className={`w-full block text-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                          tier.highlighted
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {tier.cta}
                      </Link>
                    ) : isCurrentPlan ? (
                      <button
                        disabled
                        className="w-full px-6 py-3 bg-green-100 text-green-700 rounded-lg font-semibold cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(tier.id)}
                        disabled={isProcessing}
                        className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                          tier.highlighted
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {tier.cta}
                      </button>
                      )}

                      {isCurrentPlan && user?.subscriptionRenewDate && (
                        <p className="text-xs text-center text-slate-500 mt-2">
                          Renews on {new Date(user.subscriptionRenewDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {billingError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
            {billingError}
          </div>
        </div>
      )}

      {/* FAQ */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Pricing FAQs
          </h2>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">
                What happens when I run out of prompts?
              </h3>
              <p className="text-slate-600 text-sm">
                Free tier users receive 1,000 prompts daily. Subscription users get their monthly allocation upfront.
                When you run out, you can purchase additional prompts or upgrade your plan.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">
                Do unused prompts roll over?
              </h3>
              <p className="text-slate-600 text-sm">
                Free tier prompts reset daily. Subscription prompts reset monthly but don't roll over.
                One-time prompt purchases never expire.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-slate-600 text-sm">
                Yes! You can cancel anytime and continue using your plan until the end of the billing period.
                You'll automatically revert to the free tier after cancellation.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">
                What about self-hosted deployments?
              </h3>
              <p className="text-slate-600 text-sm">
                Self-hosted deployments have no prompt limits! Download VitalLM and run it on your infrastructure
                for unlimited usage. Check our{' '}
                <Link to="/guide" className="text-blue-600 hover:underline">deployment guide</Link> to learn more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Start with 1,000 free prompts today. No credit card required.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
