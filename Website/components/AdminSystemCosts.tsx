import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Smartphone, Cpu, DollarSign } from 'lucide-react';
import { StatCard } from './StatCard';

const costData = [
  { date: 'Mon', whatsapp: 120, ai: 45 },
  { date: 'Tue', whatsapp: 150, ai: 55 },
  { date: 'Wed', whatsapp: 180, ai: 60 },
  { date: 'Thu', whatsapp: 140, ai: 40 },
  { date: 'Fri', whatsapp: 250, ai: 90 },
  { date: 'Sat', whatsapp: 300, ai: 110 },
  { date: 'Sun', whatsapp: 220, ai: 80 },
];

export const AdminSystemCosts: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">System Costs</h1>
        <p className="text-slate-500">Breakdown of API usage and operational costs.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard 
          title="Total WhatsApp Cost" 
          value="R 4,250" 
          icon={Smartphone} 
          trend={12}
          trendLabel="vs last week"
        />
        <StatCard 
          title="Total AI Token Cost" 
          value="R 1,890" 
          icon={Cpu} 
          trend={5}
        />
        <StatCard 
          title="Platform Net Margin" 
          value="72%" 
          icon={DollarSign} 
          colorClass="bg-indigo-50 border-indigo-100"
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Cost Analysis (Daily)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R${val}`} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="whatsapp" stroke="#22c55e" name="WhatsApp Cost" strokeWidth={2} />
              <Line type="monotone" dataKey="ai" stroke="#6366f1" name="AI Agent Cost" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};