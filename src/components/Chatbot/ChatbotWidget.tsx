import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sword, User, Minimize2, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';

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
          description: sub.description || null,
          cost: sub.cost,
          currency: sub.currency,
          billingCycle: sub.billingCycle,
          nextBilling: sub.nextBilling,
          category: sub.category || 'Uncategorized',
          status: sub.status,
          color: sub.color || '#8B5CF6',
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
      
      // Create a simple initialization message that just sets up the context without overwhelming the user
      const contextMessage = `You are Swordie, a helpful AI assistant for managing subscriptions in SubSlayer. 

IMPORTANT: When the user first opens the chat, simply greet them with: "Hey, I'm Swordie, your AI Assistant. How can I help you today?"

Do NOT immediately provide subscription details or analysis unless specifically asked.

You have access to the user's subscription data:
- Total subscriptions: ${subscriptionContext.subscriptions.total}
- Active: ${subscriptionContext.subscriptions.active}
- Monthly spending: ${subscriptionContext.spending.formattedMonthlyTotal}
- Upcoming renewals: ${subscriptionContext.upcomingRenewals.length}

FULL SUBSCRIPTION DATA (use only when asked):
${JSON.stringify(subscriptionContext, null, 2)}

Remember: Start with a simple greeting, then help based on what they ask for.`;

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
        content: 'Hey, I\'m Swordie, your AI Assistant. How can I help you today?',
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
      
      const response = await fetch(`https://agents.toolhouse.ai/60e3c85c-95f3-40bb-b607-ed83d1d07d40/${runId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: message.trim()
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
        <div className={`fixed bottom-4 right-4 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 transition-all duration-300 ${
          isMinimized ? 'w-64 sm:w-80 h-16' : 'w-[calc(100vw-2rem)] sm:w-96 h-[500px] sm:h-[600px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-3xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center shadow-lg">
                <Sword className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Chat with Swordie</h3>
                <p className="text-xs text-gray-500">
                  {subscriptions.length > 0 
                    ? `Managing ${subscriptions.filter(s => s.status === 'active').length} active subscriptions`
                    : 'Your subscription assistant'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMinimize}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4 text-gray-500" /> : <Minimize2 className="w-4 h-4 text-gray-500" />}
              </button>
              <button
                onClick={closeWidget}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[480px] bg-gray-50">
                {messages.length === 0 && isLoading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <div className="w-4 h-4 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                      <span>Starting conversation...</span>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-3 ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg' 
                        : 'bg-white border-2 border-gray-200 text-gray-600 shadow-sm'
                    }`}>
                      {message.type === 'user' ? <User className="w-4 h-4" /> : <Sword className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[280px] p-4 rounded-2xl shadow-sm ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-100'
                    }`}>
                      {message.type === 'assistant' ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0 text-gray-700">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-gray-700">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-gray-700">{children}</ol>,
                              li: ({ children }) => <li className="mb-1 text-gray-700">{children}</li>,
                              code: ({ children }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm text-purple-600">{children}</code>,
                              pre: ({ children }) => <pre className="bg-gray-100 p-3 rounded-lg text-sm overflow-x-auto">{children}</pre>,
                              strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                              em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                          {message.isStreaming && (
                            <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-1 rounded" />
                          )}
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-gray-100 rounded-b-3xl">
                <form onSubmit={handleSubmit} className="flex items-center space-x-3">
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
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm placeholder-gray-500"
                    disabled={isLoading || !runId}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading || !runId}
                    className="p-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-2xl hover:from-purple-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Action Button - Simple purple circle with sword */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button 
            onClick={toggleWidget}
            className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 border-4 border-white"
          >
            <Sword className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </button>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;