
import React from 'react';
import { ArrowLeft, Calendar, MapPin, MessageCircle, Flame, Ticket, Star } from 'lucide-react';

interface PublicEventsPageProps {
  onBack: () => void;
}

const publicEvents = [
  {
    id: '1',
    title: 'Summer Vibes Festival 2024',
    date: 'Sun, 15 Dec',
    time: '14:00',
    venue: 'Green Point Stadium, CPT',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop',
    price: 'R 150',
    totalCapacity: 1000,
    sold: 840,
    status: 'SELLING_FAST',
    tags: ['Music', 'Outdoors']
  },
  {
    id: '2',
    title: 'Neon Night Run & Rave',
    date: 'Sat, 21 Dec',
    time: '18:30',
    venue: 'The Promenade, DBN',
    image: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1000&auto=format&fit=crop',
    price: 'R 100',
    totalCapacity: 500,
    sold: 480,
    status: 'ALMOST_FULL',
    tags: ['Fitness', 'Party']
  },
  {
    id: '3',
    title: 'Deep House Sunday',
    date: 'Sun, 29 Dec',
    time: '15:00',
    venue: 'Botanical Gardens, JHB',
    image: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?q=80&w=1000&auto=format&fit=crop',
    price: 'R 200',
    totalCapacity: 300,
    sold: 150,
    status: 'AVAILABLE',
    tags: ['Chill', 'Vibe']
  },
  {
    id: '4',
    title: 'Amipiano Street Bash',
    date: 'Tue, 31 Dec',
    time: '20:00',
    venue: 'Maboneng Precinct, JHB',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1000&auto=format&fit=crop',
    price: 'R 250',
    totalCapacity: 2000,
    sold: 1200,
    status: 'POPULAR',
    tags: ['NYE', 'Dance']
  }
];

export const PublicEventsPage: React.FC<PublicEventsPageProps> = ({ onBack }) => {
  const handleBook = (eventName: string) => {
    const message = `Hi! I want to buy tickets for ${eventName}.`;
    // 27735718920 is the international format for 0735718920
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
                 <span className="text-lg">👋</span>
             </div>
            <h1 className="text-xl font-black tracking-tight">Live Vibes</h1>
          </div>
          <div className="w-20"></div> {/* Spacer for alignment */}
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
          {publicEvents.map((event) => (
            <div key={event.id} className="group bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden hover:border-green-500/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]">
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-lg backdrop-blur-md
                        ${event.status === 'SELLING_FAST' ? 'bg-red-500/90 text-white border-red-400' : 
                          event.status === 'ALMOST_FULL' ? 'bg-amber-500/90 text-white border-amber-400' : 
                          'bg-green-500/90 text-white border-green-400'}`}>
                        {event.status.replace('_', ' ')}
                    </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex gap-2 mb-4">
                    {event.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold uppercase px-2 py-1 bg-slate-800 text-slate-300 rounded">
                            {tag}
                        </span>
                    ))}
                </div>

                <h3 className="text-2xl font-black text-white mb-2 leading-tight">{event.title}</h3>
                
                <div className="space-y-3 mb-6">
                    <div className="flex items-center text-slate-400 text-sm">
                        <Calendar className="w-4 h-4 mr-3 text-green-500" />
                        {event.date} • {event.time}
                    </div>
                    <div className="flex items-center text-slate-400 text-sm">
                        <MapPin className="w-4 h-4 mr-3 text-green-500" />
                        {event.venue}
                    </div>
                    <div className="flex items-center text-slate-400 text-sm">
                        <Ticket className="w-4 h-4 mr-3 text-green-500" />
                        Starting from <span className="text-white font-bold ml-1">{event.price}</span>
                    </div>
                </div>

                {/* Scarcity Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-xs font-medium mb-2">
                        <span className="text-slate-500">Availability</span>
                        <span className="text-green-400">{Math.round((event.sold / event.totalCapacity) * 100)}% Sold</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full" 
                            style={{ width: `${(event.sold / event.totalCapacity) * 100}%` }}
                        ></div>
                    </div>
                </div>

                {/* Action */}
                <button 
                    onClick={() => handleBook(event.title)}
                    className="w-full py-4 bg-white hover:bg-green-400 text-black font-black rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                >
                    <MessageCircle className="w-5 h-5" />
                    Book on WhatsApp
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
