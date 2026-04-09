import { useState } from 'react';
import { motion } from 'motion/react';
import { AppLayout } from '../components/layout/AppLayout';
import { Calendar, Zap, Battery, HeartPulse, Plus, Check, Clock } from 'lucide-react';

type PlannerMode = 'normal' | 'low-energy' | 'recovery';

const mockTasks = {
  morning: [
    { id: '1', title: 'Morning Run', completed: true, time: '6:00 AM', energy: 'high' },
    { id: '2', title: 'Meditation', completed: true, time: '7:00 AM', energy: 'low' },
    { id: '3', title: 'Breakfast', completed: true, time: '7:30 AM', energy: 'low' },
  ],
  afternoon: [
    { id: '4', title: 'Work Focus Block', completed: false, time: '9:00 AM', energy: 'high' },
    { id: '5', title: 'Lunch & Walk', completed: false, time: '12:30 PM', energy: 'medium' },
    { id: '6', title: 'Study Session', completed: false, time: '2:00 PM', energy: 'high' },
  ],
  evening: [
    { id: '7', title: 'Workout', completed: false, time: '6:00 PM', energy: 'high' },
    { id: '8', title: 'Dinner', completed: false, time: '7:30 PM', energy: 'low' },
    { id: '9', title: 'Journal', completed: false, time: '9:00 PM', energy: 'low' },
  ],
  night: [
    { id: '10', title: 'Reading', completed: false, time: '10:00 PM', energy: 'low' },
    { id: '11', title: 'Sleep Prep', completed: false, time: '10:30 PM', energy: 'low' },
  ],
};

export function PlannerPage() {
  const [mode, setMode] = useState<PlannerMode>('normal');
  const [tasks, setTasks] = useState(mockTasks);

  const modes = [
    { value: 'normal', label: 'Normal Mode', icon: Zap, color: 'from-blue-500 to-violet-500' },
    { value: 'low-energy', label: 'Low Energy Mode', icon: Battery, color: 'from-yellow-500 to-orange-500' },
    { value: 'recovery', label: 'Recovery Mode', icon: HeartPulse, color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Daily Planner</h1>
            <p className="text-white/60">Plan realistically, not ideally</p>
          </div>
          <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25">
            <Plus size={20} />
            <span>Add Task</span>
          </button>
        </div>

        {/* AI Planning Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/30 to-purple-900/20 border border-violet-500/30 backdrop-blur-xl"
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
              <Zap size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Today's AI Focus</h3>
              <p className="text-white/80 text-sm mb-3">
                You have high energy today. Focus on one physical goal, one mental challenge, and maintain your emotional balance.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <p className="text-xs text-orange-300 mb-1">Physical</p>
                  <p className="text-sm font-semibold">Complete morning run</p>
                </div>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-blue-300 mb-1">Mental</p>
                  <p className="text-sm font-semibold">2-hour focus block</p>
                </div>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-xs text-emerald-300 mb-1">Emotional</p>
                  <p className="text-sm font-semibold">Journal tonight</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mode Selector */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-2">
          {modes.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.value}
                onClick={() => setMode(m.value as PlannerMode)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all flex-shrink-0 ${
                  mode === m.value
                    ? `bg-gradient-to-r ${m.color} shadow-lg`
                    : 'bg-white/5 hover:bg-white/10 text-white/60'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Time Blocks */}
        <div className="space-y-6">
          {Object.entries(tasks).map(([period, periodTasks], index) => (
            <motion.div
              key={period}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl"
            >
              <h3 className="font-semibold text-lg mb-4 capitalize">{period}</h3>
              <div className="space-y-3">
                {periodTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      task.completed
                        ? 'bg-emerald-900/20 border border-emerald-500/30'
                        : 'bg-white/5 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <button
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-white/30 hover:border-blue-500'
                        }`}
                      >
                        {task.completed && <Check size={14} className="text-white" />}
                      </button>
                      <div className="flex-1">
                        <p className={`font-medium ${task.completed ? 'text-white/60 line-through' : 'text-white'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center space-x-3 mt-1">
                          <div className="flex items-center space-x-1 text-xs text-white/60">
                            <Clock size={12} />
                            <span>{task.time}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            task.energy === 'high'
                              ? 'bg-red-500/20 text-red-400'
                              : task.energy === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {task.energy} energy
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
