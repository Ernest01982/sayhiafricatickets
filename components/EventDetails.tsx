
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Ticket, Users, DollarSign, Search, Filter, Download, Send, RefreshCw, QrCode, Undo2, AlertTriangle, X, PlusCircle, Save, Calendar, Clock, MapPin, Activity, FileSpreadsheet, FileText, ChevronDown, CreditCard, Check } from 'lucide-react';
import { Event, Order, Ticket as TicketModel, TicketType } from '../types';
import { StatCard } from './StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../services/supabaseClient';

interface EventDetailsProps {
  eventId: string;
  onBack: () => void;
  onLaunchScanner: () => void;
  onLaunchLive: () => void;
}

export const EventDetails: React.FC<EventDetailsProps> = ({ eventId, onBack, onLaunchScanner, onLaunchLive }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'tickets'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [eventData, setEventData] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Orders & Refunds State
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<TicketModel[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('Customer Request');

  // Export State
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Box Office / POS State
  const [isBoxOfficeOpen, setIsBoxOfficeOpen] = useState(false);
  const [posForm, setPosForm] = useState({ 
    customerName: '', 
    customerEmail: '', 
    ticketTypeId: '', 
    quantity: 1 
  });
  const [createdTicketQr, setCreatedTicketQr] = useState<string | null>(null);

  // Edit Event State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Event>>({});

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    setIsLoading(true);
    try {
        // 1. Fetch Event
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (eventError) throw eventError;

        // 2. Fetch Ticket Types
        const { data: ticketTypes, error: typesError } = await supabase
            .from('ticket_types')
            .select('*')
            .eq('event_id', eventId);

        if (typesError) throw typesError;

        // 3. Fetch Orders
        const { data: orderData, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        // 4. Fetch Tickets
        const { data: ticketData, error: ticketError } = await supabase
            .from('tickets')
            .select('*, orders(event_id)') // simple join to filter if needed, though we rely on order list
            .in('order_id', orderData?.map(o => o.id) || []);

        if (ticketError) throw ticketError;

        // Transform data to match frontend types
        const formattedEvent: Event = {
            id: event.id,
            title: event.title,
            date: event.date,
            time: event.time,
            venue: event.venue,
            status: event.status,
            revenue: event.revenue,
            ticketsSold: event.tickets_sold,
            totalCapacity: event.total_capacity,
            ticketTypes: ticketTypes || [],
            imageUrl: event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80',
            description: event.description
        };

        const mappedTickets: TicketModel[] = (ticketData || []).map((t: any) => {
            const typeInfo = ticketTypes?.find(tt => tt.id === t.ticket_type_id);
            return {
                id: t.id,
                code: t.qr_code,
                qr_code: t.qr_code,
                status: t.status,
                holderName: t.holder_name,
                type: typeInfo ? typeInfo.name : 'Standard',
                orderId: t.order_id
            };
        });

        setEventData(formattedEvent);
        setOrders(orderData || []);
        setTickets(mappedTickets);
        
        // Set default ticket type for POS
        if (ticketTypes && ticketTypes.length > 0) {
            setPosForm(prev => ({ ...prev, ticketTypeId: ticketTypes[0].id }));
        }

    } catch (error) {
        console.error("Error loading event:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleOpenRefund = (order: Order) => {
    setSelectedOrder(order);
    setIsRefundModalOpen(true);
  };

  const processRefund = async () => {
    if (!selectedOrder) return;
    
    // In a real app, you'd call Supabase to update status
    const { error } = await supabase
        .from('orders')
        .update({ status: 'REFUNDED' })
        .eq('id', selectedOrder.id);
    
    if (!error) {
        setOrders(orders.map(o => o.id === selectedOrder.id ? { ...o, status: 'REFUNDED' as const } : o));
        setIsRefundModalOpen(false);
        setSelectedOrder(null);
    }
  };

  const handleSellTicket = async () => {
    if (!eventData || !posForm.ticketTypeId) return;

    try {
        const ticketType = eventData.ticketTypes.find(t => t.id === posForm.ticketTypeId);
        const totalAmount = (ticketType?.price || 0) * posForm.quantity;

        // 1. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                event_id: eventId,
                customer_name: posForm.customerName || 'Walk-in Customer',
                customer_email: posForm.customerEmail || 'walkin@venue.com',
                customer_phone: 'N/A',
                total_amount: totalAmount,
                status: 'PAID',
                channel: 'DOOR'
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Generate Tickets
        const newTickets = [];
        for (let i = 0; i < posForm.quantity; i++) {
            const qrCode = `${eventId.substring(0,4)}-${Date.now()}-${i}`; // Simple unique string
            newTickets.push({
                order_id: order.id,
                ticket_type_id: posForm.ticketTypeId,
                qr_code: qrCode,
                holder_name: posForm.customerName || 'Walk-in',
                status: 'VALID'
            });
        }

        const { data: createdTickets, error: ticketError } = await supabase
            .from('tickets')
            .insert(newTickets)
            .select();

        if (ticketError) throw ticketError;

        // 3. Update Local State
        setCreatedTicketQr(newTickets[0].qr_code); // Show the first one for scanning
        fetchEventDetails(); // Refresh stats
        
        // Reset form but keep modal open to show QR
        setPosForm(prev => ({ ...prev, customerName: '', customerEmail: '' }));

    } catch (error) {
        console.error("POS Error:", error);
        alert("Failed to create ticket.");
    }
  };

  const handleDownload = (format: 'csv' | 'excel') => {
    const headers = ['Ticket ID', 'QR Code', 'Holder Name', 'Type', 'Status'];
    const rows = tickets.map(t => [t.id, t.qr_code, t.holderName, t.type, t.status]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tickets_${eventId}.${format === 'excel' ? 'xls' : 'csv'}`;
    link.click();
  };

  if (isLoading || !eventData) {
    return (
        <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
        </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{eventData.title}</h1>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>{eventData.date}</span>
                    <span>•</span>
                    <span>{eventData.venue}</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {eventData.status}
                    </span>
                </div>
            </div>
        </div>
        <div className="flex flex-wrap gap-3">
            <button 
                onClick={onLaunchLive}
                className="flex items-center px-3 py-2 bg-slate-900 text-white border border-slate-900 rounded-lg text-sm font-bold hover:bg-slate-800 shadow-sm"
            >
                <Activity className="w-4 h-4 mr-2" />
                Live Console
            </button>
            <button 
                onClick={onLaunchScanner}
                className="flex items-center px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
                <QrCode className="w-4 h-4 mr-2" />
                Gate Scanner
            </button>
            <button 
                onClick={() => setIsBoxOfficeOpen(true)}
                className="flex items-center px-3 py-2 bg-green-600 border border-green-600 rounded-lg text-sm font-medium text-white hover:bg-green-700"
            >
                <DollarSign className="w-4 h-4 mr-2" />
                Box Office (POS)
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('orders')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'orders' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Orders
            </button>
            <button 
                onClick={() => setActiveTab('tickets')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tickets' ? 'border-green-500 text-green-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Tickets & Check-in
            </button>
        </nav>
      </div>

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
        {activeTab === 'overview' && (
            <div className="space-y-6">
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard title="Gross Revenue" value={`R ${eventData.revenue.toLocaleString()}`} icon={DollarSign} />
                    <StatCard title="Tickets Sold" value={`${eventData.ticketsSold}/${eventData.totalCapacity}`} icon={Ticket} />
                    <StatCard title="Remaining" value={eventData.totalCapacity - eventData.ticketsSold} icon={Users} colorClass="bg-slate-50" />
                    <StatCard title="Avg. Order" value="R 350" icon={DollarSign} />
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales by Ticket Type</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={eventData.ticketTypes} layout="vertical" margin={{ left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                                    <Tooltip />
                                    <Bar dataKey="sold" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={20} name="Sold" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                 </div>
            </div>
        )}

        {activeTab === 'orders' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-w-0">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search orders..." 
                            className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3">Channel</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{order.id.slice(0,8)}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium">{order.customerName}</div>
                                        <div className="text-xs text-slate-500">{order.customerPhone}</div>
                                    </td>
                                    <td className="px-6 py-4 font-medium">R {order.total}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">{order.channel}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                            ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'tickets' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-w-0">
                 <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex gap-2">
                        {/* Export Button with Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                            >
                                <Download className="w-4 h-4 mr-2" /> 
                                Export
                                <ChevronDown className="w-3 h-3 ml-2" />
                            </button>
                            
                            {isExportMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20">
                                    <button onClick={() => handleDownload('csv')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Download CSV</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3">QR Code</th>
                                <th className="px-6 py-3">Holder</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{ticket.qr_code}</td>
                                    <td className="px-6 py-4">{ticket.holderName}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                            ${ticket.status === 'VALID' ? 'bg-green-100 text-green-700' : 
                                              ticket.status === 'USED' ? 'bg-slate-100 text-slate-700' : 'bg-red-100 text-red-700'}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* BOX OFFICE MODAL */}
        {isBoxOfficeOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-green-600 text-white">
                        <h3 className="font-bold flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Box Office (POS)
                        </h3>
                        <button onClick={() => { setIsBoxOfficeOpen(false); setCreatedTicketQr(null); }} className="text-white/80 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {!createdTicketQr ? (
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Walk-in Guest"
                                    value={posForm.customerName}
                                    onChange={e => setPosForm({...posForm, customerName: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Ticket Type</label>
                                    <select 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        value={posForm.ticketTypeId}
                                        onChange={e => setPosForm({...posForm, ticketTypeId: e.target.value})}
                                    >
                                        {eventData.ticketTypes.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} (R{t.price})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        value={posForm.quantity}
                                        onChange={e => setPosForm({...posForm, quantity: parseInt(e.target.value)})}
                                        min={1}
                                        max={10}
                                    />
                                </div>
                            </div>
                            
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                                <span className="text-sm text-slate-500">Total to Charge</span>
                                <span className="text-xl font-bold text-slate-900">
                                    R {((eventData.ticketTypes.find(t => t.id === posForm.ticketTypeId)?.price || 0) * posForm.quantity).toFixed(2)}
                                </span>
                            </div>

                            <button 
                                onClick={handleSellTicket}
                                className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" /> Confirm Sale
                            </button>
                        </div>
                    ) : (
                        <div className="p-6 text-center space-y-6">
                            <div className="flex flex-col items-center">
                                <div className="bg-green-100 text-green-700 p-3 rounded-full mb-4">
                                    <Check className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Sale Complete!</h3>
                                <p className="text-sm text-slate-500">Order recorded in database.</p>
                            </div>
                            
                            <div className="p-4 bg-white border-2 border-slate-900 rounded-xl inline-block">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${createdTicketQr}`} 
                                    alt="QR Code" 
                                    className="w-40 h-40"
                                />
                                <p className="text-xs font-mono mt-2 text-slate-500">{createdTicketQr}</p>
                            </div>

                            <p className="text-sm text-slate-600">Scan this code with the Gate Scanner to test entry.</p>

                            <button 
                                onClick={() => setCreatedTicketQr(null)}
                                className="w-full py-2 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                Process Next Sale
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
