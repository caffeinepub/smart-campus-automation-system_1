import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SensorReading } from '../backend';
import { format } from 'date-fns';

interface SensorChartProps {
  data: SensorReading[];
  title?: string;
}

export default function SensorChart({ data, title }: SensorChartProps) {
  const chartData = data.map((reading) => ({
    timestamp: format(new Date(Number(reading.timestamp) / 1000000), 'HH:mm'),
    value: reading.value,
    unit: reading.unit,
  }));

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis 
            dataKey="timestamp" 
            className="text-xs"
            stroke="oklch(var(--muted-foreground))"
          />
          <YAxis 
            className="text-xs"
            stroke="oklch(var(--muted-foreground))"
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'oklch(var(--card))',
              border: '1px solid oklch(var(--border))',
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="oklch(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'oklch(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
