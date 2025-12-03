import React from 'react';
import { DollarSign, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { StatCard } from './StatCard';
import { EventFinance } from '../types';

const mockFinancials: EventFinance[] = [
    {
        eventId: '1',
        eventName: 'Summer Vibes Festival',
        grossSales: 85000,
        serviceFees: 4250, // 5%
        paymentFees: 2550, // 3%
        messagingCosts: 1200,
        netPayout: 77000,
        status: 'PENDING'
    },
    {
        eventId: '2',
        eventName: 'Neon Night Run',
        grossSales: 32000,
        serviceFees: 1600,
        paymentFees: 960,
        messagingCosts: 450,
        netPayout: 28990,
        status: 'PAID'
    }
];

export const PromoterFinance: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financials & Payouts</h1>
          <p className="text-slate-500">Track your earnings, fees, and withdrawals.</p>
        </div>
        <button className="flex items-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard 
            title="Total Net Earnings" 
            value="R 105,990" 
            icon={DollarSign} 
            colorClass="bg-emerald-50 border-emerald-100"
        />
        <StatCard 
            title="Pending Payout" 
            value="R 77,000" 
            icon={AlertCircle} 
            colorClass="bg-amber-50 border-amber-100"
        />
        <StatCard 
            title="Total Fees Paid" 
            value="R 9,360" 
            icon={CheckCircle} 
        />
      </div>

      {/* Payout Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">Event Payout Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Event</th>
                <th className="px-6 py-3 text-right">Gross Sales</th>
                <th className="px-6 py-3 text-right">Platform Fees (5%)</th>
                <th className="px-6 py-3 text-right">Payfast (3%)</th>
                <th className="px-6 py-3 text-right">WhatsApp Costs</th>
                <th className="px-6 py-3 text-right">Net Payout</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockFinancials.map((item) => (
                <tr key={item.eventId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{item.eventName}</td>
                  <td className="px-6 py-4 text-right">R {item.grossSales.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-red-600">- R {item.serviceFees.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-red-600">- R {item.paymentFees.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-amber-600">- R {item.messagingCosts.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-emerald-700">R {item.netPayout.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold
                        ${item.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
            * Payouts are processed every Tuesday. Messaging costs are deducted from gross revenue.
        </div>
      </div>
    </div>
  );
};