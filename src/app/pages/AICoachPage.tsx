import { useState } from 'react';
import { motion } from 'motion/react';
import { AppLayout } from '../components/layout/AppLayout';
import { Send, Sparkles, Target, Heart, Calendar, Ban, Mic } from 'lucide-react';

const quickPrompts = [
  { icon: Sparkles, label: 'Motivate me', color: 'from-yellow-500 to-orange-500' },
  { icon: Ban, label: 'Help with cravings', color: 'from-red-500 to-pink-500' },
  { icon: Calendar, label: 'Plan my day', color: 'from-blue-500 to-violet-500' },
  { icon: Heart, label: 'I feel low', color: 'from-emerald-500 to-teal-500' },
  { icon: Target, label: 'Review my progress', color: 'from-violet-500 to-purple-500' },
  { icon: Sparkles, label: 'Help me recover', color: 'from-orange-500 to-amber-500' },
];

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'ai',
    content: "Hi Shree! 👋 I'm your AI Coach, here to support your journey to becoming the best version of yourself. I can help you with motivation, planning, cravings, mood support, and more. What would you like to talk about today?",
    timestamp: new Date(),
  },
];

export function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: "That's a great question! Based on your progress this week, you're doing really well. You've maintained a 7-day streak and your consistency is at 87%. I'd recommend focusing on protecting your evening routine, as that's when you typically face the most challenges. Would you like me to help you create a plan for tonight?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Main Chat Area */}
          <div className="lg:col-span-3 flex flex-col h-full">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 flex items-center justify-center">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">AI Coach</h1>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <p className="text-white/60 text-sm">Online & Ready</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Container */}
            <div className="flex-1 flex flex-col rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'ai'
                          ? 'bg-gradient-to-br from-blue-500 to-violet-500'
                          : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                      }`}>
                        {message.role === 'ai' ? (
                          <Sparkles size={18} className="text-white" />
                        ) : (
                          <span className="text-sm font-semibold">S</span>
                        )}
                      </div>
                      <div>
                        <div className={`p-4 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 rounded-tr-sm'
                            : 'bg-white/5 border border-white/10 rounded-tl-sm'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <p className="text-xs text-white/40 mt-1 px-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
                      <Sparkles size={18} className="text-white" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Quick Prompts */}
              {messages.length === 1 && (
                <div className="px-6 py-4 border-t border-white/10">
                  <p className="text-xs text-white/60 mb-3">Quick actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((prompt, index) => {
                      const Icon = prompt.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => handlePromptClick(prompt.label)}
                          className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors border border-white/10"
                        >
                          <Icon size={14} className={`bg-gradient-to-r ${prompt.color} bg-clip-text text-transparent`} />
                          <span>{prompt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-end space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                  />
                  <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10">
                    <Mic size={18} className="text-white/60" />
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-3 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    <Send size={18} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Context Sidebar */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl"
            >
              <h3 className="font-semibold mb-4">Your Context</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/60">Streak</span>
                  <span className="font-semibold">7 days</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/60">Mood</span>
                  <span className="font-semibold">😊 Motivated</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/60">Habits Today</span>
                  <span className="font-semibold">2/5</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/60">Mode</span>
                  <span className="font-semibold text-blue-400">Normal</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-violet-900/10 border border-blue-500/20 backdrop-blur-xl"
            >
              <h3 className="font-semibold mb-3">AI Modes</h3>
              <div className="space-y-2">
                {['Coach', 'Calm Support', 'Planner', 'Recovery Guide', 'Reflection Helper'].map((mode, index) => (
                  <button
                    key={mode}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      index === 0
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
