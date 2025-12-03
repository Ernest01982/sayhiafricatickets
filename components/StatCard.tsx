import React from 'react';
import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  colorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, trendLabel, colorClass = "bg-white" }) => {
  const isPositive = trend && trend > 0;

  return (
    <div className={`${colorClass} rounded-xl border border-slate-200 p-6 shadow-sm transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className="rounded-full bg-slate-100 p-3">
          <Icon className="h-6 w-6 text-slate-600" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`flex items-center font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpRight className="mr-1 h-4 w-4" /> : <ArrowDownRight className="mr-1 h-4 w-4" />}
            {Math.abs(trend)}%
          </span>
          <span className="ml-2 text-slate-500">{trendLabel}</span>
        </div>
      )}
    </div>
  );
};