import React from 'react';
import { DollarSign, Filter, Search } from 'lucide-react';
import { StatCard } from './StatCard';

const adminFinancials = [
    { id: 'ev1', promoter: 'SoundWave Events', event: 'Summer Vibes Fest', gross: 85000, fees: 4250, costs: 3750, payout: 77000, status: 'PENDING' },
    { id: 'ev2', promoter: 'SoundWave Events', event: 'Neon Run', gross: 32000, fees: 1600, costs: 1410, payout: 28990, status: 'PAID' },
    { id: 'ev3', promoter: 'Comedy Central', event: 'Live at the Park', gross: 15000, fees: 750, costs: 450, payout: 13800, status: 'PENDING' },
];

export const AdminFinance: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Global Finance</h1>
        <p className="text-slate-500">Manage payouts and monitor platform revenue.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-900">All Events Payouts</h3>
            </div>
            <div className="flex gap-2">
                <button className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 border border-slate-200">
                    <Filter className="w-4 h-4 mr-2" /> Filter: Pending
                </button>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Promoter</th>
                <th className="px-6 py-3">Event</th>
                <th className="px-6 py-3 text-right">Gross</th>
                <th className="px-6 py-3 text-right">Svc Fees</th>
                <th className="px-6 py-3 text-right">Costs (API/Pay)</th>
                <th className="px-6 py-3 text-right">Payout Amt</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adminFinancials.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{item.promoter}</td>
                  <td className="px-6 py-4">{item.event}</td>
                  <td className="px-6 py-4 text-right">R {item.gross.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-green-600 font-medium">+ R {item.fees.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-slate-500">R {item.costs.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold">R {item.payout.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold
                        ${item.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.status === 'PENDING' && (
                        <button className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-800 transition-colors">
                            Process Payout
                        </button>
                    )}
                    {item.status === 'PAID' && (
                        <span className="text-xs text-slate-400">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};