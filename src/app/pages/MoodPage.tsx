import { useState } from 'react';
import { motion } from 'motion/react';
import { AppLayout } from '../components/layout/AppLayout';
import { Heart, TrendingUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const moods = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😌', label: 'Calm', value: 'calm' },
  { emoji: '💪', label: 'Motivated', value: 'motivated' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' },
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '😰', label: 'Stressed', value: 'stressed' },
  { emoji: '😟', label: 'Anxious', value: 'anxious' },
  { emoji: '😢', label: 'Sad', value: 'sad' },
  { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
  { emoji: '😵', label: 'Overwhelmed', value: 'overwhelmed' },
];

const mockChartData = [
  { day: 'Mon', mood: 7 },
  { day: 'Tue', mood: 8 },
  { day: 'Wed', mood: 6 },
  { day: 'Thu', mood: 7 },
  { day: 'Fri', mood: 9 },
  { day: 'Sat', mood: 8 },
  { day: 'Sun', mood: 8 },
];

export function MoodPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [sliders, setSliders] = useState({
    energy: 50,
    stress: 30,
    confidence: 60,
    anxiety: 20,
    motivation: 70,
    focus: 65,
  });
  const [reflection, setReflection] = useState('');
  const [showAIResponse, setShowAIResponse] = useState(false);

  const handleSave = () => {
    setShowAIResponse(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Mood Check-In</h1>
          <p className="text-white/60 text-lg">How are you feeling right now?</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Check-in Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Emotion Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl"
            >
              <h3 className="font-semibold text-lg mb-4">Select Your Mood</h3>
              <div className="grid grid-cols-5 gap-3">
                {moods.map((mood) => (
                  <motion.button
                    key={mood.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedMood === mood.value
                        ? 'bg-gradient-to-br from-blue-500/20 to-violet-500/20 border-blue-500'
                        : 'bg-white/5 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-4xl mb-2">{mood.emoji}</div>
                    <p className="text-xs text-white/80">{mood.label}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Sliders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl"
            >
              <h3 className="font-semibold text-lg mb-4">How do you feel?</h3>
              <div className="space-y-4">
                {Object.entries(sliders).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-white/80 capitalize">{key}</label>
                      <span className="text-sm font-semibold">{value}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) =>
                        setSliders({ ...sliders, [key]: parseInt(e.target.value) })
                      }
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Reflection Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl"
            >
              <h3 className="font-semibold text-lg mb-4">Reflection (Optional)</h3>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What made you feel this way today? What do you need most right now?"
                className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm resize-none"
              />
              <button
                onClick={handleSave}
                disabled={!selectedMood}
                className="mt-4 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/25"
              >
                Save Check-In
              </button>
            </motion.div>

            {/* AI Support Response */}
            {showAIResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/30 to-purple-900/20 border border-violet-500/30 backdrop-blur-xl"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                    <Heart size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">AI Coach Response</h3>
                    <p className="text-white/80 leading-relaxed mb-3">
                      You seem mentally energized and motivated today! Your stress levels are low, 
                      which is great. To maintain this positive state, consider protecting your evening 
                      routine and getting quality sleep tonight.
                    </p>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-sm text-blue-300">
                        <span className="font-semibold">Recommendation:</span> Your mood usually 
                        improves after movement. Keep up the good work! 💪
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Mood History Sidebar */}
          <div className="space-y-6">
            {/* 7-Day Trend */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">7-Day Trend</h3>
                <TrendingUp size={18} className="text-emerald-400" />
              </div>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.6)" fontSize={12} domain={[0, 10]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(24, 24, 27, 0.9)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="url(#moodGradient)"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                    />
                    <defs>
                      <linearGradient id="moodGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">This Week</h3>
                <Calendar size={18} className="text-blue-400" />
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-white/60 text-xs mb-1">Most Common</p>
                  <p className="text-lg font-semibold flex items-center space-x-2">
                    <span>😊</span>
                    <span>Motivated</span>
                  </p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-white/60 text-xs mb-1">Check-In Streak</p>
                  <p className="text-lg font-semibold">7 days</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-white/60 text-xs mb-1">Average Energy</p>
                  <p className="text-lg font-semibold text-emerald-400">High</p>
                </div>
              </div>
            </motion.div>

            {/* Patterns */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-blue-900/20 to-violet-900/10 border border-blue-500/20 backdrop-blur-xl"
            >
              <h3 className="font-semibold mb-3">Patterns</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-400">•</span>
                  <span>Mood improves after workouts</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400">•</span>
                  <span>Best mood: Morning hours</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-yellow-400">•</span>
                  <span>Stress peaks: Evenings</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
