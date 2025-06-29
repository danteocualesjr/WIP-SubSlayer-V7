import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { SparklesCore } from '../ui/sparkles';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize the chatbot when component mounts
    initializeChatbot();
    
    return () => {
      // Cleanup: abort any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const initializeChatbot = async () => {
    if (isInitialized) return;
    
    try {
      setIsLoading(true);
      
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();
      
      const response = await fetch('https://agents.toolhouse.ai/60e3c85c-95f3-40bb-b607-ed83d1d07d40', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the run ID from headers
      const runIdFromHeader = response.headers.get('X-Toolhouse-Run-ID');
      if (runIdFromHeader) {
        setRunId(runIdFromHeader);
      }

      // Create initial assistant message
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages([assistantMessage]);

      // Handle streaming response
      await handleStreamingResponse(response, assistantMessage.id);
      
      setIsInitialized(true);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      console.error('Error initializing chatbot:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while initializing. Please refresh the page to try again.',
        timestamp: new Date(),
      };
      
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamingResponse = async (response: Response, messageId: string) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Mark streaming as complete
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, isStreaming: false }
              : msg
          ));
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        
        // Update the message content with the new chunk
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: msg.content + chunk }
            : msg
        ));
      }
    } finally {
      reader.releaseLock();
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !runId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Create abort controller for this request
      abortControllerRef.current = new AbortController();
      
      const response = await fetch(`https://agents.toolhouse.ai/60e3c85c-95f3-40bb-b607-ed83d1d07d40/${runId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create assistant message for streaming response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle streaming response
      await handleStreamingResponse(response, assistantMessage.id);
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-purple-900 via-violet-800 to-purple-700 p-6 text-white overflow-hidden">
        {/* Sparkles Background */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="chatbot-sparkles"
            background="transparent"
            minSize={0.3}
            maxSize={1.0}
            particleDensity={60}
            className="w-full h-full"
            particleColor="#ffffff"
            speed={0.8}
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-gradient-to-r from-purple-400/30 to-violet-400/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-r from-violet-400/30 to-purple-400/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-4">
            <MessageSquare className="w-8 h-8 text-yellow-300" />
            <h1 className="text-3xl font-bold">AI Assistant</h1>
          </div>
          <p className="text-lg text-white/90">
            Your intelligent conversation partner powered by advanced AI
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Initializing AI Assistant...
              </h3>
              <p className="text-gray-500">
                Please wait while I get ready to help you.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                } space-x-3`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 ml-3'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 mr-3'
                  }`}
                >
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                  }`}
                >
                  <div className="prose prose-sm max-w-none">
                    {message.type === 'user' ? (
                      <p className="text-white m-0">{message.content}</p>
                    ) : (
                      <div className="text-gray-900">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="m-0 mb-2 last:mb-0">{children}</p>,
                            h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            code: ({ children }) => (
                              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
                                {children}
                              </pre>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-gray-300 pl-4 italic">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                        {message.isStreaming && (
                          <div className="flex items-center space-x-1 mt-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Timestamp */}
                  <div
                    className={`text-xs mt-2 ${
                      message.type === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && messages.length === 0 && (
            <div className="flex justify-start">
              <div className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-gray-600">Initializing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  !isInitialized 
                    ? "Please wait for initialization..." 
                    : "Type your message here... (Press Enter to send, Shift+Enter for new line)"
                }
                disabled={isLoading || !isInitialized}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-h-[50px] max-h-32 disabled:bg-gray-100 disabled:cursor-not-allowed"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '50px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading || !isInitialized}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          
          {/* Status indicator */}
          <div className="mt-2 text-xs text-gray-500 flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isInitialized ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span>
              {!isInitialized 
                ? 'Initializing...' 
                : isLoading 
                  ? 'Sending...' 
                  : 'Ready to chat'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;