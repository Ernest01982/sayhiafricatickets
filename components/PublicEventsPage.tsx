import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, MapPin, MessageCircle, Flame, Ticket } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

interface PublicEventsPageProps {
  onBack: () => void;
}

type TicketType = { name: string; price: number };
type EventRow = {
  id: string;
  title: string;
  date: string;
  time?: string;
  venue: string;
  image_url?: string;
  status?: string;
  total_capacity?: number;
  tickets_sold?: number;
  ticket_types?: TicketType[];
};

export const PublicEventsPage: React.FC<PublicEventsPageProps> = ({ onBack }) => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('id,title,date,time,venue,image_url,status,total_capacity,tickets_sold,ticket_types(name,price)')
        .eq('status', 'PUBLISHED')
        .order('date', { ascending: true })
        .limit(12);
      if (error) {
        console.error('Error fetching events:', error);
      } else if (data) {
        setEvents(data as EventRow[]);
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const handleBook = (eventName: string) => {
    const message = `Hi! I want to buy tickets for ${eventName}.`;
    const whatsappUrl = `https://wa.me/27735718920?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full text-slate-300 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold hidden sm:inline">Back to Home</span>
          </button>
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                 <span className="text-lg font-black text-white">SA</span>
             </div>
            <h1 className="text-xl font-black tracking-tight">Live Vibes</h1>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      {/* Hero / Title */}
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 mb-6">
            <Flame className="w-3 h-3 mr-2" />
            Happening This Month
        </div>
        <h2 className="text-4xl md:text-6xl font-black mb-6">
          Don't Miss The <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400">Moment</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Browse the hottest events in Africa. Click "Book" to chat directly with our bot and secure your spot instantly. No signup required.
        </p>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading && (
            <div className="col-span-full text-center text-slate-400">Loading events...</div>
          )}
          {!loading && events.length === 0 && (
            <div className="col-span-full text-center text-slate-400">No live events right now.</div>
          )}
          {events.map((event) => {
            const startingPrice = Array.isArray(event.ticket_types) && event.ticket_types.length
              ? Math.min(...event.ticket_types.map((t) => Number(t.price || 0)))
              : null;
            const sold = event.tickets_sold || 0;
            const capacity = event.total_capacity || 0;
            const soldPct = capacity > 0 ? Math.round((sold / capacity) * 100) : 0;
            const status = event.status || 'LIVE';
            return (
              <div key={event.id} className="group bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden hover:border-green-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop'} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                  <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-lg backdrop-blur-md
                          ${status === 'SELLING_FAST' ? 'bg-red-500/90 text-white border-red-400' : 
                            status === 'ALMOST_FULL' ? 'bg-amber-500/90 text-white border-amber-400' : 
                            'bg-green-500/90 text-white border-green-400'}`}>
                          {status.replace('_', ' ')}
                      </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-black text-white mb-2 leading-tight">{event.title}</h3>
                  
                  <div className="space-y-3 mb-6">
                      <div className="flex items-center text-slate-400 text-sm">
                          <Calendar className="w-4 h-4 mr-3 text-green-500" />
                          {event.date} {event.time ? `• ${event.time}` : ''}
                      </div>
                      <div className="flex items-center text-slate-400 text-sm">
                          <MapPin className="w-4 h-4 mr-3 text-green-500" />
                          {event.venue}
                      </div>
                      <div className="flex items-center text-slate-400 text-sm">
                          <Ticket className="w-4 h-4 mr-3 text-green-500" />
                          {startingPrice !== null ? (
                            <>Starting from <span className="text-white font-bold ml-1">R {startingPrice}</span></>
                          ) : (
                            <span className="text-white font-bold ml-1">Tickets available</span>
                          )}
                      </div>
                  </div>

                  {capacity > 0 && (
                    <div className="mb-6">
                        <div className="flex justify-between text-xs font-medium mb-2">
                            <span className="text-slate-500">Availability</span>
                            <span className="text-green-400">{soldPct}% Sold</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full" 
                                style={{ width: `${soldPct}%` }}
                            ></div>
                        </div>
                    </div>
                  )}

                  <button 
                      onClick={() => handleBook(event.title)}
                      className="w-full py-4 bg-white hover:bg-green-400 text-black font-black rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                  >
                      <MessageCircle className="w-5 h-5" />
                      Book on WhatsApp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
