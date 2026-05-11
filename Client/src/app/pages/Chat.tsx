import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { Send, Bot, User as UserIcon, AlertCircle, Coins, Plus, History, X, Calendar, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
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
  const { user, isLoading: authLoading, updateTokens, logout } = useAuth();
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
    if (showHistory && authToken) {
      void loadChatHistory();
    }
  }, [showHistory, authToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || isLoading || !authToken) return;

    if (user.tokensRemaining < 1) {
      navigate('/pricing');
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
      setChatHistory((prev) => [
        {
          id: `${Date.now()}`,
          user_id: user.id,
          prompt: currentInput,
          response: response.response,
          tokens_used: 1,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      updateTokens(-1);
      void loadChatHistory();
    } catch (error) {
      if (error instanceof ApiError && error.status === 402) {
        navigate('/pricing');
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

  const confirmLogout = () => {
    logout();
    setShowSidebar(true);
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const startNewConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I\'m VitalLM, your AI assistant. How can I help you today?',
        created_at: new Date().toISOString(),
      },
    ]);
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-slate-50 overflow-hidden">
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Confirm logout</h3>
            <p className="text-sm text-slate-600 mb-4">Are you sure you want to log out?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={confirmLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 transition-colors">Logout</button>
            </div>
          </div>
        </div>
      )}
      <aside className={`border-b lg:border-b-0 lg:border-r border-slate-200 bg-white flex flex-col overflow-hidden transition-all duration-300 ${showSidebar ? 'w-full lg:w-80 lg:shrink-0' : 'w-full lg:w-16 lg:shrink-0'}`}>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          {showSidebar ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-slate-900 truncate">VitalLM Chat</h1>
                <p className="text-sm text-slate-500 truncate">Powered by VitalLM 50M</p>
              </div>
            </div>
          ) : (
            <div />
          )}
          <button
            onClick={() => setShowSidebar((current) => !current)}
            className="p-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            aria-label={showSidebar ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
        </div>

        {showSidebar && (
          <div className="p-4 space-y-4 overflow-y-auto">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Balance</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{user.tokensRemaining.toLocaleString()}</p>
              </div>
              <Coins className="w-10 h-10 text-blue-600" />
            </div>
            <p className="mt-2 text-sm text-slate-500">prompts remaining</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900">Current plan</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.subscriptionTier === 'free'
                  ? 'bg-slate-100 text-slate-700'
                  : user.subscriptionTier === 'starter'
                  ? 'bg-blue-100 text-blue-700'
                  : user.subscriptionTier === 'pro'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {user.subscriptionTier.charAt(0).toUpperCase() + user.subscriptionTier.slice(1)}
              </span>
              {user.subscriptionRenewDate && user.subscriptionTier !== 'free' && (
                <span className="text-xs text-slate-500">Renews {new Date(user.subscriptionRenewDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={startNewConversation}
              className="px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Conversation
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              View plans
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-900">Recent history</p>
              <button onClick={() => setShowHistory(true)} className="text-xs text-blue-600 hover:underline">View all</button>
            </div>
            {chatHistory.slice(0, 3).length === 0 ? (
              <p className="text-sm text-slate-500">No history yet.</p>
            ) : (
              <div className="space-y-2">
                {chatHistory.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setMessages([
                        {
                          role: 'user',
                          content: item.prompt,
                          created_at: item.created_at,
                          tokens: Math.ceil(item.prompt.length / 4),
                        },
                        {
                          role: 'assistant',
                          content: item.response,
                          created_at: item.created_at,
                          tokens: Math.ceil(item.response.length / 4),
                        },
                      ]);
                    }}
                    className="w-full text-left rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-slate-900 truncate">{item.prompt}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user.subscriptionTier === 'free' && (
            <Link to="/pricing" className="block rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 hover:bg-blue-100 transition-colors">
              Upgrade to a subscription plan for higher limits and monthly prompt resets.
            </Link>
          )}
          </div>
        )}

        {showSidebar && (
          <div className="mt-auto border-t border-slate-200 p-4">
            <Link to="/settings" className="flex items-center gap-3 mb-4 rounded-xl p-2 hover:bg-slate-50 transition-colors">
              <img
                src={user.profileImageUrl ?? `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </Link>
            <button
              onClick={() => {
                setShowLogoutConfirm(true);
              }}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Chat</p>
              <h2 className="text-lg font-semibold text-slate-900">Ask something new</h2>
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              View plans
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => {
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
                      <p className="text-xs opacity-70">{message.tokens} prompts</p>
                    </div>
                  )}
                  {message.created_at && (
                    <div className="mt-1 text-xs opacity-60">
                      {new Date(message.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
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

        {user.tokensRemaining < 100 && (
          <div className="px-4 py-3 bg-orange-50 border-t border-orange-200">
            <div className="flex items-start gap-3 max-w-4xl mx-auto">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-orange-900">
                  <span className="font-semibold">Low prompt balance:</span> You have {user.tokensRemaining} prompts remaining.
                  Upgrade to a plan to continue chatting without interruption.
                </p>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition-colors"
              >
                Upgrade
              </button>
            </div>
          </div>
        )}

        <div className="bg-white border-t border-slate-200 p-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={user.tokensRemaining > 0 ? 'Type your message...' : 'Upgrade to a plan to continue chatting'}
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
        </div>
      </main>

      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-slate-950/70 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-full sm:max-w-xl bg-white shadow-2xl flex flex-col rounded-none sm:rounded-3xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Chat History</h2>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                      <div key={date} className="border border-slate-200 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => {
                            const dateConversations: Message[] = [];
                            const sortedItems = [...items].sort((a, b) =>
                              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                            );

                            sortedItems.forEach((item, index) => {
                              dateConversations.push({
                                role: 'user',
                                content: item.prompt,
                                created_at: item.created_at,
                                tokens: Math.ceil(item.prompt.length / 4),
                              });

                              dateConversations.push({
                                role: 'assistant',
                                content: item.response,
                                created_at: item.created_at,
                                tokens: Math.ceil(item.response.length / 4),
                              });

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
                          className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-slate-600" />
                            <div>
                              <h3 className="font-semibold text-slate-900">{date}</h3>
                              <p className="text-sm text-slate-600">
                                {items.length} conversation{items.length !== 1 ? 's' : ''} • {totalTokens} prompts used
                              </p>
                              <p className="text-xs text-blue-600 font-medium">Click to load full conversation</p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            {items.length}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50">
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

    </div>
  );
}


