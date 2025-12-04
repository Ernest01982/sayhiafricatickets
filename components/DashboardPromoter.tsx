import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Ticket, Users, DollarSign, Activity, Loader2 } from 'lucide-react';
import { StatCard } from './StatCard';
import { supabase } from '../services/supabaseClient';
import { Event } from '../types';

export const DashboardPromoter: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    ticketsSold: 0,
    activeEvents: 0,
    waitlist: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch Events Stats for CURRENT USER
        const { data: events, error: eventError } = await supabase
            .from('events')
            .select('id, revenue, tickets_sold, status, title')
            .eq('promoter_id', user.id);

        if (eventError) {
             console.warn("Could not fetch dashboard events:", eventError);
        }

        if (events) {
            const totalRev = events.reduce((sum, e) => sum + (e.revenue || 0), 0);
            const totalTix = events.reduce((sum, e) => sum + (e.tickets_sold || 0), 0);
            const active = events.filter(e => e.status === 'PUBLISHED').length;
            
            setStats({
                revenue: totalRev,
                ticketsSold: totalTix,
                activeEvents: active,
                waitlist: 245 // Mock for now
            });

            // 2. Fetch Recent Orders for THESE events
            const eventIds = events.map(e => e.id);
            if (eventIds.length > 0) {
                const { data: orders, error: orderError } = await supabase
                    .from('orders')
                    .select('*')
                    .in('event_id', eventIds)
                    .order('created_at', { ascending: false })
                    .limit(5);
                
                if (orderError) {
                    console.warn("Could not fetch orders:", orderError);
                }
                
                if (orders) setRecentOrders(orders);
            }
        }

        // 3. Mock Chart Data (since we don't have daily logs in this simple schema yet)
        setSalesData([
            { name: 'Mon', revenue: 4000 },
            { name: 'Tue', revenue: 3000 },
            { name: 'Wed', revenue: 2000 },
            { name: 'Thu', revenue: 2780 },
            { name: 'Fri', revenue: 1890 },
            { name: 'Sat', revenue: 2390 },
            { name: 'Sun', revenue: 3490 },
        ]);

    } catch (error) {
        console.error("Dashboard error:", error);
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
      return (
          <div className="flex justify-center items-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="text-slate-500">Welcome back, here's what's happening with your events.</p>
        </div>
        <button className="mt-4 md:mt-0 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
          Create New Event
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Revenue" 
          value={`R ${stats.revenue.toLocaleString()}`} 
          icon={DollarSign} 
          trend={12} 
          trendLabel="vs last month"
        />
        <StatCard 
          title="Tickets Sold" 
          value={stats.ticketsSold} 
          icon={Ticket} 
          trend={8} 
          trendLabel="vs last month"
        />
        <StatCard 
          title="Active Events" 
          value={stats.activeEvents} 
          icon={Activity} 
        />
        <StatCard 
          title="Waitlist Signups" 
          value={stats.waitlist} 
          icon={Users} 
          trend={-2} 
          trendLabel="vs last month"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue Trends</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `R${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(value: number) => [`R ${value}`, 'Revenue']}
                />
                <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={2} dot={{r: 4, fill: '#16a34a'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Breakdown - Mock Data for Visual */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales by Ticket Type</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                  { name: 'Early Bird', sales: 45 },
                  { name: 'General', sales: 80 },
                  { name: 'VIP', sales: 20 },
                  { name: 'Backstage', sales: 5 },
              ]} layout="vertical" margin={{ left: 0, right: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="sales" fill="#334155" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-w-0">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-medium text-slate-500">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium">#{order.id.slice(0,8)}</td>
                  <td className="px-6 py-4">{order.customer_name}</td>
                  <td className="px-6 py-4">R {order.total_amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium 
                        ${order.status === 'PAID' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
