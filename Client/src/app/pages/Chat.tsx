import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Send, Bot, User as UserIcon, AlertCircle, Coins, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
}

export default function Chat() {
  const { user, isLoading: authLoading, updateTokens, purchaseTokens } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m VitalLM, your AI assistant. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const estimateTokens = (text: string): number => {
    return Math.ceil(text.length / 4);
  };

  const handleSend = async () => {
    if (!input.trim() || !user || isLoading) return;

    const userTokens = estimateTokens(input);

    if (user.tokensRemaining < userTokens) {
      setShowPurchase(true);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      tokens: userTokens,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    updateTokens(-userTokens);

    setTimeout(() => {
      const responses = [
        "That's a great question! Based on your query, I can help you understand this topic better. VitalLM is designed to provide accurate and helpful responses.",
        "I understand what you're asking. Let me provide you with a detailed explanation that should help clarify things.",
        "Excellent point! Here's what you need to know about that...",
        "I'd be happy to help with that. Here's a comprehensive answer to your question.",
        "That's an interesting topic. Let me break this down for you in a clear and concise way.",
      ];

      const assistantContent = responses[Math.floor(Math.random() * responses.length)];
      const assistantTokens = estimateTokens(assistantContent);

      if (user.tokensRemaining - userTokens < assistantTokens) {
        setShowPurchase(true);
        setIsLoading(false);
        return;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent,
        tokens: assistantTokens,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      updateTokens(-assistantTokens);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePurchase = (amount: number, price: number) => {
    purchaseTokens(amount);
    setShowPurchase(false);
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-50">
      {/* Header with Token Display */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">VitalLM Chat</h1>
              <p className="text-sm text-slate-500">Powered by VitalLM 1.5B</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <Coins className="w-5 h-5 text-blue-600" />
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">
                  {user.tokensRemaining.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">tokens left</div>
              </div>
            </div>
            {user.tokensRemaining < 100 && (
              <button
                onClick={() => setShowPurchase(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Buy Tokens
              </button>
            )}
          </div>
        </div>

        {/* Subscription Status Bar */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              user.subscriptionTier === 'free'
                ? 'bg-slate-100 text-slate-700'
                : user.subscriptionTier === 'starter'
                ? 'bg-blue-100 text-blue-700'
                : user.subscriptionTier === 'pro'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)} Plan
            </span>
            {user.subscriptionTier === 'free' && (
              <Link to="/pricing" className="text-blue-600 hover:underline text-xs">
                Upgrade for more tokens
              </Link>
            )}
          </div>
          {user.subscriptionRenewDate && user.subscriptionTier !== 'free' && (
            <span className="text-xs text-slate-500">
              Renews {new Date(user.subscriptionRenewDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.tokens && (
                <div className="mt-2 pt-2 border-t border-opacity-20 border-current">
                  <p className="text-xs opacity-70">{message.tokens} tokens</p>
                </div>
              )}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Token Warning */}
      {user.tokensRemaining < 100 && !showPurchase && (
        <div className="px-4 py-3 bg-orange-50 border-t border-orange-200">
          <div className="flex items-start gap-3 max-w-4xl mx-auto">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-orange-900">
                <span className="font-semibold">Low token balance:</span> You have {user.tokensRemaining} tokens remaining.
                Purchase more to continue chatting without interruption.
              </p>
            </div>
            <button
              onClick={() => setShowPurchase(true)}
              className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors"
            >
              Buy Now
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={user.tokensRemaining > 0 ? "Type your message..." : "Purchase tokens to continue chatting"}
            disabled={isLoading || user.tokensRemaining === 0}
            className="flex-1 resize-none border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || user.tokensRemaining === 0}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-500 text-center mt-2">
          Estimated: ~{estimateTokens(input)} tokens for this message
        </p>
      </div>

      {/* Purchase Modal */}
      {showPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Coins className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Purchase Tokens</h2>
              <p className="text-slate-600">Choose a token package to continue chatting</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-500 transition-colors cursor-pointer">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-1">10K</div>
                  <div className="text-sm text-slate-500 mb-4">tokens</div>
                  <div className="text-2xl font-bold text-blue-600 mb-4">$1</div>
                  <button
                    onClick={() => handlePurchase(10000, 1)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Purchase
                  </button>
                </div>
              </div>

              <div className="border-2 border-blue-500 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs px-3 py-1 rounded-bl-lg font-semibold">
                  Popular
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-1">100K</div>
                  <div className="text-sm text-slate-500 mb-4">tokens</div>
                  <div className="text-2xl font-bold text-blue-600 mb-4">$10</div>
                  <button
                    onClick={() => handlePurchase(100000, 10)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Purchase
                  </button>
                </div>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-500 transition-colors cursor-pointer">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-1">500K</div>
                  <div className="text-sm text-slate-500 mb-4">tokens</div>
                  <div className="text-2xl font-bold text-blue-600 mb-4">$45</div>
                  <button
                    onClick={() => handlePurchase(500000, 45)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Purchase
                  </button>
                  <div className="text-xs text-green-600 font-medium mt-2">Save 10%</div>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">
                      Save with a subscription
                    </h3>
                    <p className="text-sm text-blue-800 mb-2">
                      Get more tokens for less with our monthly plans starting at $19/month.
                    </p>
                    <Link
                      to="/pricing"
                      className="inline-block text-sm text-blue-600 hover:underline font-medium"
                    >
                      View pricing plans â†’
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-1">
                      Want unlimited tokens?
                    </h3>
                    <p className="text-sm text-purple-800">
                      Deploy VitalLM on your own infrastructure for unlimited usage.{' '}
                      <Link to="/guide#onpremise" className="underline font-medium">
                        Learn more
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPurchase(false)}
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


