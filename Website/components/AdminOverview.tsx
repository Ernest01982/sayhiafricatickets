import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { DollarSign, ShieldAlert, Smartphone, TrendingUp } from 'lucide-react';
import { StatCard } from './StatCard';

const platformRevenue = [
  { month: 'Jan', fees: 12000, costs: 4000 },
  { month: 'Feb', fees: 15000, costs: 4500 },
  { month: 'Mar', fees: 18000, costs: 5000 },
  { month: 'Apr', fees: 16000, costs: 4800 },
  { month: 'May', fees: 21000, costs: 6000 },
  { month: 'Jun', fees: 25000, costs: 7000 },
];

export const AdminOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Platform Admin</h1>
        <p className="text-slate-500">Monitoring system-wide performance and financial health.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Platform Net Profit" 
          value="R 85,400" 
          icon={TrendingUp} 
          trend={15} 
          colorClass="bg-emerald-50 border-emerald-100"
        />
        <StatCard 
          title="Total Gross Sales" 
          value="R 1.2M" 
          icon={DollarSign} 
        />
        <StatCard 
          title="Msg & AI Costs" 
          value="R 12,300" 
          icon={Smartphone} 
          trend={-5}
          trendLabel="lower than exp."
        />
        <StatCard 
          title="Fraud Alerts" 
          value="3" 
          icon={ShieldAlert} 
          colorClass="bg-red-50 border-red-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit vs Costs */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Service Fees vs. Tech Costs</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformRevenue}>
                <defs>
                  <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis hide />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip />
                <Area type="monotone" dataKey="fees" stroke="#10b981" fillOpacity={1} fill="url(#colorFees)" name="Service Fees" />
                <Area type="monotone" dataKey="costs" stroke="#64748b" fillOpacity={1} fill="url(#colorCosts)" name="API Costs" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Payouts */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Pending Promoter Payouts</h3>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-4 py-2">Promoter</th>
                  <th className="px-4 py-2">Event</th>
                  <th className="px-4 py-2 text-right">Net Amount</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3 font-medium">SoundWave Events</td>
                  <td className="px-4 py-3">Neon Run</td>
                  <td className="px-4 py-3 text-right font-bold">R 28,400</td>
                  <td className="px-4 py-3">
                    <button className="text-xs bg-slate-900 text-white px-2 py-1 rounded hover:bg-slate-800">Pay</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Comedy Central</td>
                  <td className="px-4 py-3">Live at the Park</td>
                  <td className="px-4 py-3 text-right font-bold">R 12,100</td>
                  <td className="px-4 py-3">
                    <button className="text-xs bg-slate-900 text-white px-2 py-1 rounded hover:bg-slate-800">Pay</button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Jazz Foundation</td>
                  <td className="px-4 py-3">Winter Gala</td>
                  <td className="px-4 py-3 text-right font-bold">R 8,900</td>
                  <td className="px-4 py-3">
                    <button className="text-xs bg-slate-900 text-white px-2 py-1 rounded hover:bg-slate-800">Pay</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};