
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Clock, AlertTriangle, Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { CheckInLog, GateStat } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface EventLiveMonitorProps {
  eventId: string;
  onBack: () => void;
}

// Mock Data Generators
const generateLogs = (): CheckInLog[] => [
  { id: 'L-1', timestamp: 'Just now', gate: 'Main Gate A', ticketType: 'General', status: 'SUCCESS', scannedBy: 'Scanner 1' },
  { id: 'L-2', timestamp: '2s ago', gate: 'VIP Entrance', ticketType: 'VIP', status: 'SUCCESS', scannedBy: 'Scanner 3' },
  { id: 'L-3', timestamp: '5s ago', gate: 'Main Gate A', ticketType: 'General', status: 'DENIED', scannedBy: 'Scanner 2' },
  { id: 'L-4', timestamp: '12s ago', gate: 'Main Gate B', ticketType: 'General', status: 'SUCCESS', scannedBy: 'Scanner 4' },
  { id: 'L-5', timestamp: '15s ago', gate: 'Main Gate A', ticketType: 'Early Bird', status: 'DUPLICATE', scannedBy: 'Scanner 1' },
];

const velocityData = [
  { time: '14:00', count: 12 },
  { time: '14:15', count: 45 },
  { time: '14:30', count: 120 },
  { time: '14:45', count: 250 },
  { time: '15:00', count: 380 },
  { time: '15:15', count: 410 },
  { time: '15:30', count: 290 },
];

export const EventLiveMonitor: React.FC<EventLiveMonitorProps> = ({ eventId, onBack }) => {
  const [logs, setLogs] = useState<CheckInLog[]>(generateLogs());
  const [totalCheckIns, setTotalCheckIns] = useState(1450);
  const [capacity] = useState(2500);
  
  // Simulate live data
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalCheckIns(prev => prev + Math.floor(Math.random() * 3));
      // In a real app, we'd append new logs here
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-500 font-mono text-sm font-bold tracking-wider uppercase">Live Connection</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Mission Control: Summer Vibes Fest</h1>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div>
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Current Time</p>
            <p className="font-mono text-xl">15:42:30</p>
          </div>
        </div>
      </div>

      {/* Big Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.2)]">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-400 font-medium">Total Check-ins</p>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-5xl font-black text-white tabular-nums">{totalCheckIns.toLocaleString()}</p>
          <div className="mt-4 w-full bg-slate-800 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${(totalCheckIns / capacity) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex justify-between">
            <span>{Math.round((totalCheckIns / capacity) * 100)}% Capacity</span>
            <span>Target: {capacity}</span>
          </p>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-400 font-medium">Ingress Velocity</p>
            <Activity className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-5xl font-black text-green-500 tabular-nums">42</p>
          <p className="text-sm text-green-700 font-medium mt-1">people / min</p>
          <p className="text-xs text-slate-500 mt-4">Peak: 65 ppm at 15:15</p>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-400 font-medium">Remaining</p>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-5xl font-black text-white tabular-nums">1,050</p>
          <p className="text-sm text-slate-500 mt-1">expected arrivals</p>
          <p className="text-xs text-amber-500/60 mt-4 font-medium">Est. Queue Time: 15 mins</p>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-400 font-medium">Failed Scans</p>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-5xl font-black text-red-500 tabular-nums">12</p>
          <p className="text-sm text-red-800 font-medium mt-1">requires attention</p>
          <p className="text-xs text-slate-500 mt-4">Most common: Duplicate</p>
        </div>
      </div>

      {/* Charts & Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px] min-w-0">
        
        {/* Chart */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6 min-w-0">
          <h3 className="text-lg font-bold text-white mb-6">Ingress Flow (Last 2 Hours)</h3>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={velocityData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#475569" axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Feed */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Live Feed</h3>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
            {logs.map((log) => (
              <div key={log.id} className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 flex items-center justify-between animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3">
                  {log.status === 'SUCCESS' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {log.status === 'DENIED' && <XCircle className="w-5 h-5 text-red-500" />}
                  {log.status === 'DUPLICATE' && <RefreshCw className="w-5 h-5 text-amber-500" />}
                  <div>
                    <p className="text-sm font-medium text-white">{log.ticketType}</p>
                    <p className="text-xs text-slate-500">{log.gate} • {log.scannedBy}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded
                    ${log.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : 
                      log.status === 'DENIED' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {log.status}
                  </span>
                  <p className="text-[10px] text-slate-600 mt-1">{log.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gate Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
         <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase">Main Gate A</p>
              <p className="text-white font-bold text-lg mt-1">Active • 4 Scanners</p>
            </div>
            <div className="text-right">
               <p className="text-green-500 font-bold text-xl">22 ppm</p>
            </div>
         </div>
         <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase">Main Gate B</p>
              <p className="text-white font-bold text-lg mt-1">Active • 3 Scanners</p>
            </div>
            <div className="text-right">
               <p className="text-green-500 font-bold text-xl">15 ppm</p>
            </div>
         </div>
         <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase">VIP Entrance</p>
              <p className="text-white font-bold text-lg mt-1">Active • 1 Scanner</p>
            </div>
            <div className="text-right">
               <p className="text-green-500 font-bold text-xl">5 ppm</p>
            </div>
         </div>
      </div>
    </div>
  );
};
