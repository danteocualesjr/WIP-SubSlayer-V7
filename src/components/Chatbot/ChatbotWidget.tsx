import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Sparkles, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';
import { SparklesCore } from '../ui/sparkles';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const ChatbotWidget: React.FC = () => {
  const { user } = useAuth();
  const { subscriptions } = useSubscriptions();
  const { settings, formatCurrency } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !hasInitialized) {
      initializeChat();
    }
  }, [isOpen, hasInitialized]);

  // Generate comprehensive subscription context for the AI
  const generateSubscriptionContext = () => {
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    const pausedSubscriptions = subscriptions.filter(sub => sub.status === 'paused');
    const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'cancelled');
    
    const totalMonthlySpend = activeSubscriptions.reduce((sum, sub) => {
      return sum + (sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12);
    }, 0);
    
    const totalAnnualSpend = totalMonthlySpend * 12;
    
    // Get upcoming renewals in next 30 days
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingRenewals = activeSubscriptions.filter(sub => {
      const renewalDate = new Date(sub.nextBilling);
      return renewalDate >= now && renewalDate <= thirtyDaysFromNow;
    }).map(sub => {
      const renewalDate = new Date(sub.nextBilling);
      const daysUntil = Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...sub,
        daysUntil
      };
    });

    // Group by category
    const subscriptionsByCategory = subscriptions.reduce((acc, sub) => {
      const category = sub.category || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(sub);
      return acc;
    }, {} as Record<string, typeof subscriptions>);

    // Calculate category spending
    const categoryBreakdown = Object.entries(subscriptionsByCategory).map(([category, subs]) => {
      const activeSubs = subs.filter(s => s.status === 'active');
      const monthlyTotal = activeSubs.reduce((sum, s) => 
        sum + (s.billingCycle === 'monthly' ? s.cost : s.cost / 12), 0
      );
      return {
        category,
        count: subs.length,
        activeCount: activeSubs.length,
        monthlyTotal,
        annualTotal: monthlyTotal * 12,
        subscriptions: activeSubs.map(s => ({
          name: s.name,
          cost: s.cost,
          billingCycle: s.billingCycle,
          nextBilling: s.nextBilling
        }))
      };
    });

    return {
      user: {
        email: user?.email,
        currency: settings.currency,
        reminderDays: settings.reminderDays,
        dateFormat: settings.dateFormat,
        theme: settings.theme
      },
      subscriptions: {
        total: subscriptions.length,
        active: activeSubscriptions.length,
        paused: pausedSubscriptions.length,
        cancelled: cancelledSubscriptions.length,
        allSubscriptions: subscriptions.map(sub => ({
          id: sub.id,
          name: sub.name,
          description: sub.description,
          cost: sub.cost,
          currency: sub.currency,
          billingCycle: sub.billingCycle,
          nextBilling: sub.nextBilling,
          category: sub.category || 'Uncategorized',
          status: sub.status,
          color: sub.color,
          createdAt: sub.createdAt,
          daysUntilRenewal: sub.status === 'active' ? Math.ceil((new Date(sub.nextBilling).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
        }))
      },
      spending: {
        monthlyTotal: totalMonthlySpend,
        annualTotal: totalAnnualSpend,
        averagePerSubscription: activeSubscriptions.length > 0 ? totalMonthlySpend / activeSubscriptions.length : 0,
        formattedMonthlyTotal: formatCurrency(totalMonthlySpend),
        formattedAnnualTotal: formatCurrency(totalAnnualSpend)
      },
      upcomingRenewals: upcomingRenewals.map(sub => ({
        name: sub.name,
        cost: sub.cost,
        formattedCost: formatCurrency(sub.cost),
        nextBilling: sub.nextBilling,
        daysUntil: sub.daysUntil,
        category: sub.category || 'Uncategorized',
        isUrgent: sub.daysUntil <= 3,
        isWarning: sub.daysUntil <= 7 && sub.daysUntil > 3
      })),
      categories: Object.keys(subscriptionsByCategory),
      categoryBreakdown: categoryBreakdown.sort((a, b) => b.monthlyTotal - a.monthlyTotal)
    };
  };

  const initializeChat = async () => {
    if (hasInitialized) return;
    
    setIsLoading(true);
    setHasInitialized(true);

    try {
      abortControllerRef.current = new AbortController();
      
      const subscriptionContext = generateSubscriptionContext();
      
      // Create a comprehensive context message
      const contextMessage = `You are SubSlayer AI, a helpful assistant for managing subscriptions. You have COMPLETE ACCESS to the user's subscription data:

SUBSCRIPTION OVERVIEW:
- Total subscriptions: ${subscriptionContext.subscriptions.total}
- Active: ${subscriptionContext.subscriptions.active}
- Paused: ${subscriptionContext.subscriptions.paused}
- Cancelled: ${subscriptionContext.subscriptions.cancelled}

SPENDING SUMMARY:
- Monthly total: ${subscriptionContext.spending.formattedMonthlyTotal}
- Annual total: ${subscriptionContext.spending.formattedAnnualTotal}
- Average per subscription: ${formatCurrency(subscriptionContext.spending.averagePerSubscription)}

UPCOMING RENEWALS (Next 30 days): ${subscriptionContext.upcomingRenewals.length} subscriptions
${subscriptionContext.upcomingRenewals.map(r => `- ${r.name}: ${r.formattedCost} in ${r.daysUntil} days (${r.nextBilling})`).join('\n')}

CATEGORIES:
${subscriptionContext.categoryBreakdown.map(cat => `- ${cat.category}: ${cat.activeCount} active subscriptions, ${formatCurrency(cat.monthlyTotal)}/month`).join('\n')}

ALL SUBSCRIPTIONS:
${subscriptionContext.subscriptions.allSubscriptions.map(sub => 
  `- ${sub.name} (${sub.status}): ${formatCurrency(sub.cost)}/${sub.billingCycle}, Category: ${sub.category}, Next billing: ${sub.nextBilling}${sub.daysUntilRenewal ? ` (${sub.daysUntilRenewal} days)` : ''}`
).join('\n')}

USER SETTINGS:
- Currency: ${subscriptionContext.user.currency}
- Reminder days: ${subscriptionContext.user.reminderDays}
- Date format: ${subscriptionContext.user.dateFormat}

You can answer questions about their subscriptions, spending patterns, upcoming renewals, suggest optimizations, and help them manage their subscription portfolio. Be helpful, friendly, and provide actionable insights based on their actual data.`;

      const response = await fetch('https://agents.toolhouse.ai/60e3c85c-95f3-40bb-b607-ed83d1d07d40', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: contextMessage
        }),
        signal: abortControllerRef.current.signal,
      });

      const extractedRunId = response.headers.get('X-Toolhouse-Run-ID');
      if (extractedRunId) {
        setRunId(extractedRunId);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Create initial assistant message
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages([assistantMessage]);

      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        // Update the streaming message
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: accumulatedContent }
            : msg
        ));
      }

      // Mark streaming as complete
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, isStreaming: false }
          : msg
      ));

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled
      }
      
      console.error('Error initializing chat:', error);
      setMessages([{
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while starting our conversation. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !runId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      
      // Include updated subscription context with each message
      const subscriptionContext = generateSubscriptionContext();
      
      // Prepend context to user message
      const messageWithContext = `CURRENT SUBSCRIPTION DATA:
${JSON.stringify(subscriptionContext, null, 2)}

USER QUESTION: ${message.trim()}`;
      
      const response = await fetch(`https://agents.toolhouse.ai/60e3c85c-95f3-40bb-b607-ed83d1d07d40/${runId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageWithContext
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Create assistant response message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);

      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        // Update the streaming message
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content: accumulatedContent }
            : msg
        ));
      }

      // Mark streaming as complete
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, isStreaming: false }
          : msg
      ));

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled
      }
      
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const closeWidget = () => {
    setIsOpen(false);
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Reset initialization when subscriptions change significantly
  useEffect(() => {
    if (hasInitialized && isOpen) {
      // Reset if the user's subscription count changes significantly
      setHasInitialized(false);
    }
  }, [subscriptions.length]);

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className={`fixed bottom-4 right-4 bg-white rounded-3xl shadow-2xl border border-purple-100/50 z-50 transition-all duration-500 ease-out transform ${
          isMinimized ? 'w-80 h-20 scale-95' : 'w-[420px] h-[650px] scale-100'
        } backdrop-blur-xl`}>
          {/* Enhanced Header with Sparkles */}
          <div className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 text-white rounded-t-3xl overflow-hidden">
            {/* Sparkles Background */}
            <div className="absolute inset-0 w-full h-full">
              <SparklesCore
                id="chatbot-sparkles"
                background="transparent"
                minSize={0.3}
                maxSize={1.0}
                particleDensity={40}
                className="w-full h-full"
                particleColor="#ffffff"
                speed={0.5}
              />
            </div>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-1/3 w-32 h-32 bg-gradient-to-r from-purple-400/30 to-violet-400/30 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-1/3 w-24 h-24 bg-gradient-to-r from-violet-400/30 to-purple-400/30 rounded-full blur-2xl"></div>
            </div>

            <div className="relative z-10 flex items-center justify-between p-5">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">SubSlayer AI</h3>
                  <p className="text-sm text-white/90 flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>
                      {subscriptions.length > 0 
                        ? `Managing ${subscriptions.filter(s => s.status === 'active').length} active subscriptions`
                        : 'Your intelligent subscription assistant'
                      }
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMinimize}
                  className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={closeWidget}
                  className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Enhanced Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 h-[520px] bg-gradient-to-b from-gray-50/50 to-white">
                {messages.length === 0 && isLoading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                      <p className="text-gray-600 font-medium">Analyzing your subscriptions...</p>
                      <p className="text-sm text-gray-500 mt-1">This may take a moment</p>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-4 ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white' 
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-200'
                    }`}>
                      {message.type === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>
                    <div className={`max-w-[300px] p-4 rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white border-purple-200'
                        : 'bg-white text-gray-900 border-gray-200'
                    }`}>
                      {message.type === 'assistant' ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="text-sm">{children}</li>,
                              code: ({ children }) => <code className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-sm font-mono">{children}</code>,
                              pre: ({ children }) => <pre className="bg-gray-100 p-3 rounded-xl text-sm overflow-x-auto border">{children}</pre>,
                              strong: ({ children }) => <strong className="font-semibold text-purple-700">{children}</strong>,
                              em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                              h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-gray-900">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-gray-800">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-sm font-medium mb-1 text-gray-700">{children}</h3>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                          {message.isStreaming && (
                            <div className="flex items-center space-x-1 mt-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Input Area */}
              <div className="p-6 border-t border-gray-100 bg-white rounded-b-3xl">
                <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={subscriptions.length > 0 
                        ? "Ask about your subscriptions, spending, or renewals..." 
                        : "Ask me anything about subscription management..."
                      }
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50 hover:bg-white transition-all duration-200 placeholder-gray-500"
                      disabled={isLoading || !runId}
                    />
                    {inputValue && (
                      <button
                        type="button"
                        onClick={() => setInputValue('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading || !runId}
                    className="p-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </form>
                
                {/* Status Indicator */}
                <div className="flex items-center justify-center mt-3">
                  <div className={`flex items-center space-x-2 text-xs ${
                    runId ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      runId ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                    }`}></div>
                    <span>{runId ? 'Connected' : 'Connecting...'}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Enhanced Floating Action Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={toggleWidget}
            className="relative w-16 h-16 bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 hover:from-purple-700 hover:via-violet-700 hover:to-purple-800 text-white rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center justify-center group transform hover:scale-110 active:scale-95"
          >
            {/* Animated Background */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/20 to-violet-400/20 animate-pulse"></div>
            
            {/* Icon */}
            <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform duration-200 relative z-10" />
            
            {/* AI Badge */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            
            {/* Pulse Ring */}
            <div className="absolute inset-0 rounded-2xl border-2 border-purple-400/50 animate-ping"></div>
            
            {/* Hover Tooltip */}
            <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              Chat with SubSlayer AI
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </button>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;