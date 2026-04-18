import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Zap,
  RotateCcw,
  ChevronDown,
  Bot,
} from 'lucide-react';
import { apiFetch, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { CoachActionButtons } from './CoachActionButtons';
import type {
  AIAgentAction,
  AIActionResponse,
  AIChatResponse,
  AIConversationMessage,
  AIConversationStateResponse,
} from '@/lib/types';

type Role = 'user' | 'ai';
type Status = 'idle' | 'sending' | 'typing' | 'error';
type CoachProvider = 'guest' | 'local' | 'openai' | 'gemini';

interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isError?: boolean;
}

const GUEST_REPLIES: Record<string, string> = {
  default:
    "I'm your RiseUp coach. Sign in for app-aware coaching, or ask me about habits, mood, stress, or recovery.",
  fitness:
    'Great choice focusing on fitness. Start with 3 sessions per week, progressively overload your lifts, and prioritize sleep and protein. Consistency beats perfection.',
  habit:
    "Building habits? Use the 2-minute rule: make it so easy you can't say no. Stack new habits onto existing ones and track your streak. Small wins compound.",
  mood:
    'Your mental health matters. Try journaling for 5 minutes, taking a short walk outside, and limiting screen time before bed. Progress often starts quietly.',
  motivat:
    "Remember why you started. Every rep, healthy meal, and good night's sleep is a vote for the person you're becoming.",
  stress:
    'Deep breaths first. Try box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s. Then break the problem into the smallest possible next step.',
  sleep:
    'Sleep is your superpower. Aim for a consistent bedtime, keep your room cool and dark, and avoid caffeine after 2pm. Better sleep changes everything.',
  smoke:
    'Quitting is hard but worth it. Identify your triggers, replace the habit with something physical like gum or a short walk, and celebrate each smoke-free day.',
};

const QUICK_PROMPTS = [
  { label: 'Fitness tips', value: 'Give me fitness tips to get started' },
  { label: 'Build habits', value: 'How do I build better habits?' },
  { label: 'Manage stress', value: 'Help me manage stress better' },
  { label: 'Quit smoking', value: 'I want to quit smoking, where do I start?' },
  { label: 'Better sleep', value: 'How can I improve my sleep?' },
  { label: 'Motivate me', value: 'I need some motivation right now' },
];

function getGuestResponse(message: string): string {
  const lower = message.toLowerCase();

  for (const [key, reply] of Object.entries(GUEST_REPLIES)) {
    if (key !== 'default' && lower.includes(key)) return reply;
  }

  return GUEST_REPLIES.default;
}

function createWelcomeMessage(useBackend: boolean, variant: 'default' | 'fresh' = 'default'): Message {
  const text = useBackend
    ? variant === 'fresh'
      ? 'Fresh start. Your conversation memory is reset. What do you want help with right now?'
      : "Hey! I'm your RiseUp coach. I can use your app data and saved chat history to help with habits, mood, cravings, planning, and progress. What are you working on today?"
    : variant === 'fresh'
      ? 'Fresh start. Ask me about habits, mood, stress, or recovery.'
      : 'Hey! I’m your RiseUp coach. I can help with habits, mood, stress, and recovery. Sign in if you want personalized coaching with memory from your app data.';

  return {
    id: `welcome-${variant}`,
    role: 'ai',
    text,
    timestamp: new Date(),
  };
}

function mapConversationMessages(messages: AIConversationMessage[]): Message[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    text: message.content,
    timestamp: new Date(message.createdAt),
  }));
}

async function getCoachReply(
  message: string,
  useBackend: boolean,
  conversationId?: string | null,
): Promise<{
  reply: string;
  provider: CoachProvider;
  conversationId?: string;
  messages?: Message[];
  suggestedActions: AIAgentAction[];
}> {
  if (!useBackend) {
    return {
      reply: getGuestResponse(message),
      provider: 'guest',
      suggestedActions: [],
    };
  }

  try {
    const response = await apiFetch<AIChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    });

    return {
      reply: response.message,
      provider: response.provider,
      conversationId: response.conversationId,
      messages: mapConversationMessages(response.messages),
      suggestedActions: response.suggestedActions,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return {
        reply: getGuestResponse(message),
        provider: 'guest',
        suggestedActions: [],
      };
    }

    throw error;
  }
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-end gap-2"
    >
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/30">
        <Bot size={13} className="text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white/5 border border-white/10 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-blue-400"
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function MessageBubble({ msg, index }: { msg: Message; index: number }) {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24, delay: Math.min(index * 0.05, 0.2) }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/30">
          <Bot size={13} className="text-white" />
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <motion.div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-br from-blue-500 to-violet-600 text-white rounded-br-sm shadow-lg shadow-blue-500/25'
              : msg.isError
                ? 'bg-red-500/10 border border-red-500/30 text-red-300 rounded-bl-sm'
                : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm'
          }`}
        >
          {msg.text}
        </motion.div>
        <span className="text-[10px] text-white/30 px-1">
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

export function Chatbot() {
  const { status: authStatus } = useAuth();
  const useBackend = authStatus === 'authenticated';
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([createWelcomeMessage(false)]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [provider, setProvider] = useState<CoachProvider>('guest');
  const [suggestedActions, setSuggestedActions] = useState<AIAgentAction[]>([]);
  const [busyActionId, setBusyActionId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadConversation() {
      if (!useBackend) {
        setConversationId(null);
        setProvider('guest');
        setMessages([createWelcomeMessage(false)]);
        setSuggestedActions([]);
        return;
      }

      try {
        const response = await apiFetch<AIConversationStateResponse>('/ai/conversation');

        if (isCancelled) {
          return;
        }

        setConversationId(response.conversationId);
        setProvider(response.provider);
        setMessages(
          response.messages.length > 0 ? mapConversationMessages(response.messages) : [createWelcomeMessage(true)],
        );
        setSuggestedActions([]);
      } catch {
        if (isCancelled) {
          return;
        }

        setConversationId(null);
        setProvider('local');
        setMessages([createWelcomeMessage(true)]);
        setSuggestedActions([]);
      }
    }

    void loadConversation();

    return () => {
      isCancelled = true;
    };
  }, [useBackend]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => scrollToBottom(false), 100);
      setUnreadCount(0);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    } else if (messages[messages.length - 1]?.role === 'ai') {
      setUnreadCount((count) => count + 1);
    }
  }, [messages, isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  const handleScroll = () => {
    const element = messagesContainerRef.current;

    if (!element) {
      return;
    }

    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    setShowScrollBtn(distanceFromBottom > 80);
  };

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();

      if (!trimmed || status === 'sending' || status === 'typing') {
        return;
      }

      const userMessage: Message = {
        id: `user_${Date.now()}`,
        role: 'user',
        text: trimmed,
        timestamp: new Date(),
      };

      setMessages((current) => [...current, userMessage]);
      setInputValue('');
      setStatus('sending');
      setSuggestedActions([]);

      await new Promise((resolve) => setTimeout(resolve, 400));
      setStatus('typing');

      try {
        const result = await getCoachReply(trimmed, useBackend, conversationId);
        setProvider(result.provider);
        setSuggestedActions(result.suggestedActions);

        if (result.conversationId) {
          setConversationId(result.conversationId);
        }

        if (result.messages && result.messages.length > 0) {
          setMessages(result.messages);
        } else {
          setMessages((current) => [
            ...current,
            { id: `ai_${Date.now()}`, role: 'ai', text: result.reply, timestamp: new Date() },
          ]);
        }
      } catch (error) {
        setSuggestedActions([]);
        setMessages((current) => [
          ...current,
          {
            id: `err_${Date.now()}`,
            role: 'ai',
            text: (error as Error).message ?? 'Something went wrong. Please try again.',
            timestamp: new Date(),
            isError: true,
          },
        ]);
        setStatus('error');
        return;
      }

      setStatus('idle');
    },
    [conversationId, status, useBackend],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(inputValue);
    }
  };

  const clearChat = useCallback(async () => {
    setStatus('idle');

    if (!useBackend) {
      setConversationId(null);
      setProvider('guest');
      setMessages([createWelcomeMessage(false, 'fresh')]);
      setSuggestedActions([]);
      return;
    }

    try {
      const response = await apiFetch<AIConversationStateResponse>('/ai/conversation/reset', {
        method: 'POST',
      });

      setConversationId(response.conversationId);
      setProvider(response.provider);
      setMessages([createWelcomeMessage(true, 'fresh')]);
      setSuggestedActions([]);
    } catch {
      setConversationId(null);
      setProvider('local');
      setMessages([createWelcomeMessage(true, 'fresh')]);
      setSuggestedActions([]);
    }
  }, [useBackend]);

  const runSuggestedAction = useCallback(
    async (actionId: string) => {
      if (!useBackend || !conversationId || busyActionId) {
        return;
      }

      setBusyActionId(actionId);

      try {
        const response = await apiFetch<AIActionResponse>('/ai/action', {
          method: 'POST',
          body: JSON.stringify({ actionId, conversationId }),
        });

        setConversationId(response.conversationId);
        setProvider(response.provider);
        setMessages(mapConversationMessages(response.messages));
        setSuggestedActions(response.suggestedActions);
        setStatus('idle');
      } catch (error) {
        setMessages((current) => [
          ...current,
          {
            id: `err_${Date.now()}`,
            role: 'ai',
            text: (error as Error).message ?? 'I could not complete that action right now.',
            timestamp: new Date(),
            isError: true,
          },
        ]);
      } finally {
        setBusyActionId(null);
      }
    },
    [busyActionId, conversationId, useBackend],
  );

  const chatWidth = isExpanded ? 'w-[480px]' : 'w-[380px]';
  const chatHeight = isExpanded ? 'h-[680px]' : 'h-[560px]';
  const providerLabel =
    provider === 'openai'
      ? 'GPT-style live coach'
      : provider === 'gemini'
        ? 'Gemini live coach'
        : provider === 'local'
          ? 'Local fallback'
          : 'Guest demo';
  const providerNote =
    provider === 'openai'
      ? 'Replies use OpenAI with your saved conversation, live app context, and approved coach actions.'
      : provider === 'gemini'
        ? 'Replies use Gemini with your saved conversation, live app context, and approved coach actions.'
      : provider === 'local'
        ? 'Replies are using the built-in safe fallback while direct AI is unavailable.'
        : 'Sign in for personalized coaching with memory from your app data.';

  return (
    <>
      <motion.div
        className="fixed bottom-7 right-7 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 20 }}
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-full"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-full border-2 border-transparent"
                style={{
                  background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #10b981, #3b82f6) border-box',
                  WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'destination-out',
                  maskComposite: 'exclude',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            setIsOpen((current) => !current);
            setUnreadCount(0);
          }}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 shadow-2xl shadow-blue-500/40 flex items-center justify-center text-white transition-shadow hover:shadow-blue-500/60"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <X size={26} />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <MessageCircle size={26} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {!isOpen && unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg"
              >
                {unreadCount}
              </motion.span>
            )}
          </AnimatePresence>

          {!isOpen && (
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-zinc-950 animate-pulse" />
          )}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 30, scale: 0.88, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className={`fixed bottom-28 right-7 z-50 ${chatWidth} ${chatHeight} max-w-[calc(100vw-2rem)] max-h-[calc(100vh-9rem)] flex flex-col rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10`}
            style={{ background: 'linear-gradient(145deg, rgba(15,15,26,0.97) 0%, rgba(20,20,40,0.97) 100%)' }}
          >
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

            <div className="relative flex-shrink-0 px-5 py-4 border-b border-white/8 bg-gradient-to-r from-blue-500/8 via-violet-500/8 to-emerald-500/8 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <motion.div
                      animate={{ boxShadow: ['0 0 8px #3b82f6aa', '0 0 18px #8b5cf6aa', '0 0 8px #10b981aa'] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 via-violet-500 to-emerald-500 flex items-center justify-center shadow-lg"
                    >
                      <Sparkles size={18} className="text-white" />
                    </motion.div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-zinc-950 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-white text-sm font-semibold">EvolveAI Coach</h3>
                    <div className="flex items-center gap-1.5">
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
                      />
                      <span className="text-[11px] text-white/50">
                        {status === 'typing' ? 'Typing...' : 'Online - coach chat'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/8">
                    <Zap size={10} className="text-violet-400" />
                    <span className="text-[10px] text-white/40 font-medium">{providerLabel}</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      void clearChat();
                    }}
                    title="Clear chat"
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
                  >
                    <RotateCcw size={14} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsExpanded((current) => !current)}
                    title={isExpanded ? 'Compact' : 'Expand'}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
                  >
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300 }}>
                      <ChevronDown size={14} />
                    </motion.div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(239,68,68,0.15)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </motion.button>
                </div>
              </div>
            </div>

            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scroll-smooth"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.08) transparent' }}
            >
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <MessageBubble key={message.id} msg={message} index={index} />
                ))}

                {status === 'typing' && (
                  <AnimatePresence>
                    <TypingIndicator key="typing" />
                  </AnimatePresence>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <div className="flex-shrink-0 px-4">
              <CoachActionButtons
                actions={suggestedActions}
                busyActionId={busyActionId}
                onRun={(actionId) => {
                  void runSuggestedAction(actionId);
                }}
              />
            </div>

            <AnimatePresence>
              {showScrollBtn && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => scrollToBottom()}
                  className="absolute bottom-[130px] right-5 w-8 h-8 rounded-full bg-blue-500/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-white hover:bg-blue-500 transition-colors"
                >
                  <ChevronDown size={16} />
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {messages.length <= 2 && status === 'idle' && suggestedActions.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-shrink-0 px-4 pb-2"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((prompt, index) => (
                      <motion.button
                        key={prompt.value}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + index * 0.06, type: 'spring', stiffness: 300 }}
                        whileHover={{ scale: 1.04, backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          void sendMessage(prompt.value);
                        }}
                        className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] hover:text-white hover:border-blue-500/40 transition-all"
                      >
                        {prompt.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-white/8">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask your AI coach..."
                    disabled={status === 'sending' || status === 'typing'}
                    maxLength={500}
                    className="w-full px-4 py-3 pr-10 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all disabled:opacity-50"
                  />
                  {inputValue.length > 400 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/30">
                      {500 - inputValue.length}
                    </span>
                  )}
                </div>

                <motion.button
                  whileHover={status === 'idle' && inputValue.trim() ? { scale: 1.08 } : {}}
                  whileTap={status === 'idle' && inputValue.trim() ? { scale: 0.92 } : {}}
                  onClick={() => {
                    void sendMessage(inputValue);
                  }}
                  disabled={!inputValue.trim() || status === 'sending' || status === 'typing'}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all shadow-lg ${
                    inputValue.trim() && status === 'idle'
                      ? 'bg-gradient-to-br from-blue-500 to-violet-600 shadow-blue-500/30 hover:shadow-blue-500/50'
                      : 'bg-white/5 border border-white/10 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {status === 'sending' || status === 'typing' ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                      />
                    ) : (
                      <motion.div key="send" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }}>
                        <Send size={16} className="text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              <div className="flex items-center justify-center gap-1.5 mt-2">
                <Zap size={9} className="text-violet-400/60" />
                <span className="text-[10px] text-white/25">{providerNote}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
