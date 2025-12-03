
import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, Search, Lock, UserX, CheckCircle, Activity } from 'lucide-react';
import { RiskAlert } from '../types';
import { StatCard } from './StatCard';

const initialAlerts: RiskAlert[] = [
    { id: 'R-101', severity: 'HIGH', type: 'PAYMENT_VELOCITY', description: '5 failed attempts in 1 min from same card.', user: 'John Doe (Guest)', timestamp: '10 mins ago', status: 'OPEN' },
    { id: 'R-102', severity: 'MEDIUM', type: 'DUPLICATE_SCANS', description: 'Ticket QR scanned at 2 different gates simultaneously.', user: 'Mike Smith', timestamp: '1 hour ago', status: 'OPEN' },
    { id: 'R-103', severity: 'LOW', type: 'MULTIPLE_ACCOUNTS', description: 'Same IP used for 3 different account signups.', user: 'Unknown', timestamp: '2 days ago', status: 'RESOLVED' },
];

export const AdminRisk: React.FC = () => {
  const [alerts, setAlerts] = useState<RiskAlert[]>(initialAlerts);

  const handleResolve = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fraud & Risk Monitoring</h1>
        <p className="text-slate-500">Real-time alerts for suspicious payment and check-in activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard 
            title="Active High Risks" 
            value={alerts.filter(a => a.severity === 'HIGH' && a.status === 'OPEN').length} 
            icon={ShieldAlert} 
            colorClass="bg-red-50 border-red-100"
        />
        <StatCard 
            title="Payment Blocks (24h)" 
            value="12" 
            icon={Lock} 
        />
        <StatCard 
            title="System Health" 
            value="99.9%" 
            icon={Activity} 
            colorClass="bg-green-50 border-green-100"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
             <h3 className="text-lg font-semibold text-slate-900">Recent Alerts</h3>
             <div className="flex gap-2">
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                    <input type="text" placeholder="Search user or IP..." className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-sm" />
                 </div>
             </div>
        </div>
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                    <th className="px-6 py-3">Severity</th>
                    <th className="px-6 py-3">Alert Type</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">User Context</th>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {alerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold
                                ${alert.severity === 'HIGH' ? 'bg-red-100 text-red-700' : 
                                  alert.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                {alert.severity}
                            </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">{alert.type.replace('_', ' ')}</td>
                        <td className="px-6 py-4 text-slate-600">{alert.description}</td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{alert.user}</td>
                        <td className="px-6 py-4 text-slate-500">{alert.timestamp}</td>
                        <td className="px-6 py-4">
                             <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium
                                ${alert.status === 'OPEN' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                {alert.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                            {alert.status === 'OPEN' && (
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => handleResolve(alert.id)}
                                        className="p-1 text-green-600 hover:bg-green-50 rounded" 
                                        title="Mark Resolved"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 text-red-600 hover:bg-red-50 rounded" title="Ban User">
                                        <UserX className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};
