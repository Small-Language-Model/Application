import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Send, Bot, User as UserIcon, AlertCircle, Coins, Plus, Sparkles, History, X, Calendar } from 'lucide-react';
import { Link } from 'react-router';
import { generateInference, ApiError, getChatHistory } from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
  created_at?: string;
}

interface ChatHistoryItem {
  id: string;
  user_id: string;
  prompt: string;
  response: string;
  tokens_used: number;
  created_at: string;
}

export default function Chat() {
  const { user, isLoading: authLoading, updateTokens } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m VitalLM, your AI assistant. How can I help you today?',
      created_at: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const estimateTokens = (text: string): number => {
    // Simple approximation: roughly 4 characters per token
    return Math.ceil(text.length / 4);
  };

  const loadChatHistory = async () => {
    if (!authToken) return;

    setIsLoadingHistory(true);
    try {
      const response = await getChatHistory(authToken);
      setChatHistory(response.history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const groupHistoryByDate = (history: ChatHistoryItem[]) => {
    const groups: { [key: string]: ChatHistoryItem[] } = {};

    history.forEach(item => {
      const date = new Date(item.created_at);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey: string;
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    // Sort dates: Today, Yesterday, then other dates in descending order
    const sortedGroups: { [key: string]: ChatHistoryItem[] } = {};
    const dateOrder = ['Today', 'Yesterday'];

    // Add Today and Yesterday first
    dateOrder.forEach(dateKey => {
      if (groups[dateKey]) {
        sortedGroups[dateKey] = groups[dateKey];
      }
    });

    // Add remaining dates sorted by most recent first
    Object.keys(groups)
      .filter(dateKey => !dateOrder.includes(dateKey))
      .sort((a, b) => {
        // Parse dates and sort in descending order
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateB.getTime() - dateA.getTime();
      })
      .forEach(dateKey => {
        sortedGroups[dateKey] = groups[dateKey];
      });

    return sortedGroups;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    const token = localStorage.getItem('auth_token');
    setAuthToken(token);
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (authToken) {
      loadChatHistory();
    }
  }, [authToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || isLoading || !authToken) return;

    if (user.tokensRemaining < 1) {
      setShowPurchase(true);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      tokens: 1,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateInference(
        {
          prompt: currentInput,
          max_new_tokens: 130,
          temperature: 0.25,
          top_k: 30,
          top_p: 0.9,
          repetition_penalty: 1.25,
        },
        authToken
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        tokens: 1,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      updateTokens(-1);
    } catch (error) {
      if (error instanceof ApiError && error.status === 402) {
        setShowPurchase(true);
        setMessages((prev) => prev.filter((msg) => msg !== userMessage));
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: `Error: ${error instanceof ApiError ? error.detail || error.message : 'Failed to generate response'}`,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
            <button
              onClick={() => setShowHistory(true)}
              className="px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2 text-sm"
              title="Chat History"
            >
              <History className="w-4 h-4" />
              History
            </button>
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
        {messages.map((message, index) => {
          // Handle conversation separators
          if (message.content.startsWith('--- Conversation') && message.content.endsWith(' ---')) {
            return (
              <div key={index} className="flex justify-center">
                <div className="bg-slate-100 border border-slate-300 rounded-full px-4 py-2 text-xs text-slate-600 font-medium">
                  {message.content.replace('--- ', '').replace(' ---', '')}
                </div>
              </div>
            );
          }

          return (
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
                {message.tokens && message.tokens > 0 && (
                  <div className="mt-2 pt-2 border-t border-opacity-20 border-current">
                    <p className="text-xs opacity-70">{message.tokens} tokens</p>
                  </div>
                )}
                {message.created_at && (
                  <div className="mt-1 text-xs opacity-60">
                    {new Date(message.created_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          );
        })}

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

      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex z-50">
          <div className="ml-auto w-full max-w-md bg-white shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Chat History</h2>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* History Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : chatHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No chat history yet</p>
                  <p className="text-sm">Start a conversation to see your history here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupHistoryByDate(chatHistory)).map(([date, items]) => {
                    const totalTokens = items.reduce((sum, item) => sum + item.tokens_used, 0);

                    return (
                      <div key={date} className="border border-slate-200 rounded-lg overflow-hidden">
                        {/* Date Header */}
                        <button
                          onClick={() => {
                            // Load all conversations from this date
                            const dateConversations: Message[] = [];
                            const sortedItems = [...items].sort((a, b) =>
                              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                            );

                            sortedItems.forEach((item, index) => {
                              // Add user message
                              dateConversations.push({
                                role: 'user',
                                content: item.prompt,
                                created_at: item.created_at,
                                tokens: Math.ceil(item.prompt.length / 4),
                              });

                              // Add assistant response
                              dateConversations.push({
                                role: 'assistant',
                                content: item.response,
                                created_at: item.created_at,
                                tokens: Math.ceil(item.response.length / 4),
                              });

                              // Add a separator between conversations (except for the last one)
                              if (index < sortedItems.length - 1) {
                                dateConversations.push({
                                  role: 'assistant',
                                  content: `--- Conversation ${index + 2} ---`,
                                  created_at: item.created_at,
                                  tokens: 0,
                                });
                              }
                            });

                            setMessages(dateConversations);
                            setShowHistory(false);
                          }}
                          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-slate-600" />
                            <div>
                              <h3 className="font-semibold text-slate-900">{date}</h3>
                              <p className="text-sm text-slate-600">
                                {items.length} conversation{items.length !== 1 ? 's' : ''} • {totalTokens} tokens used
                              </p>
                              <p className="text-xs text-blue-600 font-medium">Click to load full conversation</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border">
                              {items.length}
                            </span>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setMessages([
                    {
                      role: 'assistant',
                      content: 'Hello! I\'m VitalLM, your AI assistant. How can I help you today?',
                      created_at: new Date().toISOString(),
                    },
                  ]);
                  setShowHistory(false);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Start New Conversation
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <Link
                    to="/pricing"
                    className="w-full inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Purchase
                  </Link>
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
                  <Link
                    to="/pricing"
                    className="w-full inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Purchase
                  </Link>
                </div>
              </div>

              <div className="border-2 border-slate-200 rounded-xl p-6 hover:border-blue-500 transition-colors cursor-pointer">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-1">500K</div>
                  <div className="text-sm text-slate-500 mb-4">tokens</div>
                  <div className="text-2xl font-bold text-blue-600 mb-4">$45</div>
                  <Link
                    to="/pricing"
                    className="w-full inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Purchase
                  </Link>
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


