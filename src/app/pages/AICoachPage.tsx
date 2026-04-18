import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AppLayout } from '../components/layout/AppLayout';
import { CoachActionButtons } from '../components/CoachActionButtons';
import { Send, Sparkles, Target, Heart, Calendar, Ban, Mic, RotateCcw } from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import type {
  AIAgentAction,
  AIActionResponse,
  AIChatResponse,
  AIContext,
  AIConversationMessage,
  AIConversationStateResponse,
} from '@/lib/types';

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

function mapMessages(messages: AIConversationMessage[]): Message[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: new Date(message.createdAt),
  }));
}

function getInitialWelcomeMessage(): Message {
  return {
    id: 'welcome',
    role: 'ai',
    content:
      "Hi! I'm your AI Coach. I can help with motivation, cravings, mood support, planning, and progress review using your app context and saved conversation memory. Tell me what you're dealing with right now.",
    timestamp: new Date(),
  };
}

export function AICoachPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([getInitialWelcomeMessage()]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'local'>('local');
  const [coachContext, setCoachContext] = useState<AIContext | null>(null);
  const [suggestedActions, setSuggestedActions] = useState<AIAgentAction[]>([]);
  const [busyActionId, setBusyActionId] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadConversation() {
      try {
        const response = await apiFetch<AIConversationStateResponse>('/ai/conversation');

        if (isCancelled) {
          return;
        }

        setConversationId(response.conversationId);
        setCoachContext(response.context);
        setProvider(response.provider);
        setMessages(response.messages.length > 0 ? mapMessages(response.messages) : [getInitialWelcomeMessage()]);
        setSuggestedActions([]);
      } catch (requestError) {
        if (isCancelled) {
          return;
        }

        if (requestError instanceof ApiError) {
          setError(requestError.message);
        } else {
          setError('Unable to load your saved coach conversation right now.');
        }
      }
    }

    void loadConversation();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleSend = async (messageOverride?: string) => {
    const nextMessage = (messageOverride ?? input).trim();

    if (!nextMessage || isTyping) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: nextMessage,
      timestamp: new Date(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setError('');
    setIsTyping(true);
    setSuggestedActions([]);

    try {
      const response = await apiFetch<AIChatResponse>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: nextMessage, conversationId }),
      });

      setConversationId(response.conversationId);
      setProvider(response.provider);
      setCoachContext(response.context);
      setMessages(mapMessages(response.messages));
      setSuggestedActions(response.suggestedActions);
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to reach your AI coach right now.');
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetConversation = async () => {
    setError('');

    try {
      const response = await apiFetch<AIConversationStateResponse>('/ai/conversation/reset', {
        method: 'POST',
      });

      setConversationId(response.conversationId);
      setProvider(response.provider);
      setCoachContext(response.context);
      setMessages([getInitialWelcomeMessage()]);
      setSuggestedActions([]);
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to reset your coach conversation right now.');
      }
    }
  };

  const handleRunAction = async (actionId: string) => {
    if (!conversationId || busyActionId) {
      return;
    }

    setBusyActionId(actionId);
    setError('');

    try {
      const response = await apiFetch<AIActionResponse>('/ai/action', {
        method: 'POST',
        body: JSON.stringify({ actionId, conversationId }),
      });

      setConversationId(response.conversationId);
      setProvider(response.provider);
      setCoachContext(response.context);
      setMessages(mapMessages(response.messages));
      setSuggestedActions(response.suggestedActions);
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.message);
      } else {
        setError('Unable to complete that coach action right now.');
      }
    } finally {
      setBusyActionId(null);
    }
  };

  const providerLabel =
    provider === 'openai'
      ? 'GPT-style coaching with memory'
      : provider === 'gemini'
        ? 'Gemini coaching with memory'
        : 'Safe local fallback';

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          <div className="lg:col-span-3 flex flex-col h-full">
            <div className="mb-6">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 flex items-center justify-center">
                    <Sparkles size={24} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">AI Coach</h1>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <p className="text-white/60 text-sm">{providerLabel}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    void handleResetConversation();
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <RotateCcw size={16} />
                  New chat
                </button>
              </div>

              {error ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}
            </div>

            <div className="flex-1 flex flex-col rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start space-x-3 max-w-[80%] ${
                        message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'ai'
                            ? 'bg-gradient-to-br from-blue-500 to-violet-500'
                            : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                        }`}
                      >
                        {message.role === 'ai' ? (
                          <Sparkles size={18} className="text-white" />
                        ) : (
                          <span className="text-sm font-semibold">Y</span>
                        )}
                      </div>
                      <div>
                        <div
                          className={`p-4 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/20 border border-blue-500/30 rounded-tr-sm'
                              : 'bg-white/5 border border-white/10 rounded-tl-sm'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <p className="text-xs text-white/40 mt-1 px-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isTyping ? (
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
                        <div
                          className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                          style={{ animationDelay: '0.4s' }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </div>

              <div className="px-6">
                <CoachActionButtons
                  actions={suggestedActions}
                  busyActionId={busyActionId}
                  onRun={(actionId) => {
                    void handleRunAction(actionId);
                  }}
                />
              </div>

              {messages.length === 1 ? (
                <div className="px-6 py-4 border-t border-white/10">
                  <p className="text-xs text-white/60 mb-3">Quick actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((prompt) => {
                      const Icon = prompt.icon;
                      return (
                        <button
                          key={prompt.label}
                          onClick={() => {
                            void handleSend(prompt.label);
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm transition-colors border border-white/10"
                        >
                          <Icon size={14} className={`bg-gradient-to-r ${prompt.color} bg-clip-text text-transparent`} />
                          <span>{prompt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="p-4 border-t border-white/10">
                <div className="flex items-end space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        void handleSend();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                  />
                  <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10">
                    <Mic size={18} className="text-white/60" />
                  </button>
                  <button
                    onClick={() => {
                      void handleSend();
                    }}
                    disabled={!input.trim() || isTyping}
                    className="p-3 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    <Send size={18} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>

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
                  <span className="font-semibold">
                    {coachContext ? `${coachContext.habits.streakDays} days` : 'Ask the coach'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/60">Mood</span>
                  <span className="font-semibold capitalize">
                    {coachContext?.mood.current ?? 'Waiting for context'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/60">Habits Today</span>
                  <span className="font-semibold">
                    {coachContext
                      ? `${coachContext.habits.completedToday}/${coachContext.habits.total}`
                      : '--/--'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white/60">Mode</span>
                  <span className="font-semibold text-blue-400 capitalize">
                    {coachContext?.planner.mode ?? 'normal'}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-violet-900/10 border border-blue-500/20 backdrop-blur-xl"
            >
              <h3 className="font-semibold mb-3">Coach Signals</h3>
              <div className="space-y-3 text-sm">
                <div className="rounded-lg bg-white/5 px-3 py-2">
                  <div className="text-white/50 text-xs mb-1">Mood Trend</div>
                  <div className="capitalize">{coachContext?.mood.direction ?? 'Waiting for context'}</div>
                </div>
                <div className="rounded-lg bg-white/5 px-3 py-2">
                  <div className="text-white/50 text-xs mb-1">Top Trigger</div>
                  <div>{coachContext?.cravings.topTrigger ?? 'No trigger pattern yet'}</div>
                </div>
                <div className="rounded-lg bg-white/5 px-3 py-2">
                  <div className="text-white/50 text-xs mb-1">Next Task</div>
                  <div>
                    {coachContext?.planner.pendingTasks[0]
                      ? `${coachContext.planner.pendingTasks[0].title} (${coachContext.planner.pendingTasks[0].period})`
                      : 'No pending task loaded'}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
