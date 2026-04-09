import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const moodData = [
  { day: 'Mon', mood: 7 },
  { day: 'Tue', mood: 6 },
  { day: 'Wed', mood: 8 },
  { day: 'Thu', mood: 7 },
  { day: 'Fri', mood: 9 },
  { day: 'Sat', mood: 8 },
  { day: 'Sun', mood: 8 },
];

const renderDot = (props: any) => {
  const { cx, cy, index } = props;
  return (
    <circle
      key={`mood-dot-${index}`}
      cx={cx}
      cy={cy}
      r={5}
      fill="#8b5cf6"
      stroke="none"
    />
  );
};

export function MoodTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={moodData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <XAxis
          key="mood-x"
          dataKey="day"
          stroke="rgba(255,255,255,0.5)"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
        />
        <YAxis
          key="mood-y"
          stroke="rgba(255,255,255,0.5)"
          domain={[0, 10]}
          tickCount={6}
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
        />
        <Line
          key="mood-line"
          type="monotone"
          dataKey="mood"
          stroke="#8b5cf6"
          strokeWidth={3}
          dot={renderDot}
          activeDot={{ r: 7, fill: '#8b5cf6' }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
