import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const weeklyData = [
  { day: 'Mon', habits: 4 },
  { day: 'Tue', habits: 5 },
  { day: 'Wed', habits: 3 },
  { day: 'Thu', habits: 5 },
  { day: 'Fri', habits: 4 },
  { day: 'Sat', habits: 5 },
  { day: 'Sun', habits: 4 },
];

export function WeeklyHabitsChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <XAxis
          key="weekly-x"
          dataKey="day"
          stroke="rgba(255,255,255,0.5)"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          key="weekly-y"
          stroke="rgba(255,255,255,0.5)"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          domain={[0, 5]}
          tickCount={6}
          allowDecimals={false}
        />
        <Bar
          key="weekly-bar"
          dataKey="habits"
          radius={[8, 8, 0, 0]}
          fill="#3b82f6"
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
