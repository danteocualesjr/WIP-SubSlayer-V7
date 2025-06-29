import React, { useState, useEffect, useRef } from 'react';
import { Send, Sword, User, Sparkles, MessageCircle, Zap, Brain, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SparklesCore } from '../ui/sparkles';
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

const SwordiePage: React.FC = () => {
  const { user } = useAuth();
  const { subscriptions } = useSubscriptions();
  const { settings, formatCurrency } = useSettings();
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
    if (!hasInitialized) {
      initializeChat();
    }
  }, [hasInitialized]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

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

  // Quick action suggestions
  const quickActions = [
    {
      icon: TrendingUp,
      title: "Analyze my spending",
      description: "Get insights on your subscription costs",
      prompt: "Can you analyze my subscription spending and give me insights?"
    },
    {
      icon: Calendar,
      title: "Upcoming renewals",
      description: "Show me what's renewing soon",
      prompt: "What subscriptions are renewing in the next 30 days?"
    },
    {
      icon: DollarSign,
      title: "Find savings",
      description: "Help me reduce my monthly costs",
      prompt: "How can I reduce my monthly subscription costs? What suggestions do you have?"
    },
    {
      icon: Brain,
      title: "Subscription advice",
      description: "Get personalized recommendations",
      prompt: "Based on my subscriptions, what advice do you have for better management?"
    }
  ];

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
    sendMessage(prompt);
  };

  // Calculate stats for the hero section
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
  const totalMonthlySpend = activeSubscriptions.reduce((sum, sub) => {
    return sum + (sub.billingCycle === 'monthly' ? sub.cost : sub.cost / 12);
  }, 0);

  const upcomingRenewalsCount = activeSubscriptions.filter(sub => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const renewalDate = new Date(sub.nextBilling);
    return renewalDate >= now && renewalDate <= thirtyDaysFromNow;
  }).length;

  return (
    <div className="space-y-8 h-full flex flex-col">
      {/* Enhanced Hero Section with Sparkles */}
      <div className="relative bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white overflow-hidden">
        {/* Sparkles Background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="swordie-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#ffffff"
            speed={1.0}
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/30 to-violet-400/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-r from-violet-400/30 to-purple-400/30 rounded-full blur-3xl"></div>
        </div>

        {/* Radial gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-900/50 via-violet-800/50 to-purple-700/50 [mask-image:radial-gradient(800px_400px_at_center,transparent_20%,white)]"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div>
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300" />
                <h1 className="text-2xl sm:text-4xl font-bold">Swordie AI</h1>
              </div>
              <p className="text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl">
                Your intelligent subscription management companion. Ask me anything about your subscriptions, spending, or get personalized recommendations.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Active Subs</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">{activeSubscriptions.length}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-green-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Monthly</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">${totalMonthlySpend.toFixed(2)}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 col-span-2 sm:col-span-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-blue-300" />
                <p className="text-white/80 text-xs sm:text-sm font-medium">Upcoming</p>
              </div>
              <p className="text-lg sm:text-3xl font-bold">{upcomingRenewalsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-violet-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center shadow-lg">
              <Sword className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Swordie</h3>
              <p className="text-sm text-gray-600">
                {subscriptions.length > 0 
                  ? `Analyzing ${activeSubscriptions.length} active subscriptions`
                  : 'Ready to help with subscription management'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 min-h-0">
          {messages.length === 0 && isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center space-x-3 text-gray-500">
                <div className="w-6 h-6 border-2 border-purple-600/30 border-t-purple-600 rounded-full animate-spin" />
                <span className="text-lg">Initializing Swordie...</span>
              </div>
            </div>
          )}

          {/* Quick Actions - Show when no messages */}
          {messages.length === 0 && !isLoading && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">What can I help you with?</h3>
                <p className="text-gray-600">Choose a quick action or ask me anything about your subscriptions</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 text-left group"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-violet-100 rounded-xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-violet-200 transition-colors">
                          <Icon className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-4 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white' 
                  : 'bg-white border-2 border-purple-200 text-purple-600'
              }`}>
                {message.type === 'user' ? <User className="w-5 h-5" /> : <Sword className="w-5 h-5" />}
              </div>
              <div className={`max-w-3xl p-6 rounded-2xl shadow-sm ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-100'
              }`}>
                {message.type === 'assistant' ? (
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-3 last:mb-0 text-gray-700 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-3 text-gray-700 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 text-gray-700 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-gray-700">{children}</li>,
                        code: ({ children }) => <code className="bg-purple-100 px-2 py-1 rounded text-sm text-purple-700 font-mono">{children}</code>,
                        pre: ({ children }) => <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto font-mono">{children}</pre>,
                        strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                        em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                        h1: ({ children }) => <h1 className="text-xl font-bold text-gray-900 mb-3">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-semibold text-gray-900 mb-2">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-semibold text-gray-900 mb-2">{children}</h3>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                    {message.isStreaming && (
                      <span className="inline-block w-3 h-5 bg-purple-400 animate-pulse ml-1 rounded" />
                    )}
                  </div>
                ) : (
                  <p className="text-lg leading-relaxed">{message.content}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-100">
          <form onSubmit={handleSubmit} className="flex items-center space-x-4">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={subscriptions.length > 0 
                ? "Ask about your subscriptions, spending, renewals, or get recommendations..." 
                : "Ask me anything about subscription management..."
              }
              className="flex-1 px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg placeholder-gray-500"
              disabled={isLoading || !runId}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading || !runId}
              className="p-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-2xl hover:from-purple-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
            </button>
          </form>
          
          {/* Status indicator */}
          <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
            {isLoading ? (
              <span>Swordie is thinking...</span>
            ) : runId ? (
              <span>Ready to help • Press Enter to send</span>
            ) : (
              <span>Connecting to Swordie...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwordiePage;