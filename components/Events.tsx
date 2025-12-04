import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Users, MoreHorizontal, Plus, X, Image as ImageIcon, Clock, Loader2 } from 'lucide-react';
import { Event, EventStatus, TicketType } from '../types';
import { supabase, ensureDemoLogin } from '../services/supabaseClient';

interface EventsProps {
  onSelectEvent: (eventId: string) => void;
}

export const Events: React.FC<EventsProps> = ({ onSelectEvent }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    venue: '',
    date: '',
    time: '',
    description: '',
    totalCapacity: 100,
  });

  const [ticketTypes, setTicketTypes] = useState<Partial<TicketType>[]>([
    { name: 'General Admission', price: 0, capacity: 100 }
  ]);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
        let { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            const demo = await ensureDemoLogin();
            user = demo.user;
        }
        if (!user) return;

        // FILTER: Only fetch events belonging to the current promoter
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('promoter_id', user.id)
            .order('date', { ascending: true });
            
        if (error) throw error;

        // Map database fields to frontend type
        const formattedEvents: Event[] = data.map(e => ({
            id: e.id,
            title: e.title,
            date: e.date,
            time: e.time,
            venue: e.venue,
            status: e.status,
            revenue: e.revenue,
            ticketsSold: e.tickets_sold,
            totalCapacity: e.total_capacity,
            ticketTypes: [], // We could fetch these if needed for the list view, but simple overview is fine
            imageUrl: e.image_url || 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80',
            description: e.description
        }));
        
        setEvents(formattedEvents);
    } catch (err) {
        console.error("Error fetching events:", err);
    } finally {
        setIsLoading(false);
    }
  };

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { name: '', price: 0, capacity: 0 }]);
  };

  const removeTicketType = (indexToRemove: number) => {
    setTicketTypes((prev) => {
      if (prev.length === 1) {
        return prev;
      }
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleCreateEvent = async () => {
    setIsLoading(true);
    try {
        let uploadedImageUrl: string | null = null;
        let promoterId = null;
        let { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
            promoterId = user.id;
        } else {
            const demo = await ensureDemoLogin();
            if (!demo.user) throw new Error("You must be logged in to create an event.");
            promoterId = demo.user.id;
            user = demo.user;
        }

        // Upload cover image if provided
        if (coverFile) {
            setIsUploadingImage(true);
            const fileName = `events/${promoterId}-${Date.now()}-${coverFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('event-covers')
              .upload(fileName, coverFile, { upsert: false });
            if (uploadError) {
              throw new Error(`Image upload failed: ${uploadError.message}`);
            }
            if (uploadData?.path) {
              const { data: publicUrl } = supabase.storage.from('event-covers').getPublicUrl(uploadData.path);
              if (!publicUrl?.publicUrl) {
                throw new Error('Image upload succeeded but no public URL returned. Please ensure the "event-covers" bucket is public.');
              }
              uploadedImageUrl = publicUrl.publicUrl;
            }
            setIsUploadingImage(false);
        }

        // Check if profile exists
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', promoterId)
            .single();
            
        if (!existingProfile) {
            // Auto-create profile if missing (helps with demo flow)
            await supabase.from('profiles').insert({
                id: promoterId,
                email: user.email || 'unknown@example.com',
                role: 'PROMOTER',
                organization_name: 'My Organization',
                whatsapp_number: ''
            });
        }

        // Insert Event
        const { data: eventData, error: eventError } = await supabase
            .from('events')
            .insert({
                promoter_id: promoterId,
                title: newEvent.title,
                date: newEvent.date,
                time: newEvent.time,
                venue: newEvent.venue,
                description: newEvent.description,
                total_capacity: newEvent.totalCapacity,
                status: 'DRAFT',
                image_url: uploadedImageUrl
            })
            .select()
            .single();

        if (eventError) {
             // Basic RLS error handling
             if (eventError.code === '42501') {
                 throw new Error("Permission denied. Database RLS policy might be blocking this insert. Check README for SQL.");
             }
             throw eventError;
        }

        // 3. Insert Ticket Types
        if (ticketTypes.length > 0) {
            const typesToInsert = ticketTypes.map(t => ({
                event_id: eventData.id,
                name: t.name,
                price: t.price,
                capacity: t.capacity
            }));
            
            const { error: typesError } = await supabase
                .from('ticket_types')
                .insert(typesToInsert);
                
            if (typesError) throw typesError;
        }

        setIsCreateModalOpen(false);
        setEditEventId(null);
        setCoverFile(null);
        fetchEvents(); // Refresh list
        alert("Event created successfully!");

    } catch (error: any) {
        console.error("Create event error:", error);
        alert(`Failed to create event: ${error.message || JSON.stringify(error)}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!editEventId) return;
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to update an event.");

      let uploadedImageUrl: string | null = newEvent.imageUrl || null;
      if (coverFile) {
        setIsUploadingImage(true);
        const fileName = `events/${user.id}-${Date.now()}-${coverFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-covers')
          .upload(fileName, coverFile, { upsert: false });
        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }
        if (uploadData?.path) {
          const { data: publicUrl } = supabase.storage.from('event-covers').getPublicUrl(uploadData.path);
          if (!publicUrl?.publicUrl) {
            throw new Error('Image upload succeeded but no public URL returned. Please ensure the "event-covers" bucket is public.');
          }
          uploadedImageUrl = publicUrl.publicUrl;
        }
        setIsUploadingImage(false);
      }

      const { error } = await supabase
        .from('events')
        .update({
          title: newEvent.title,
          date: newEvent.date,
          time: newEvent.time,
          venue: newEvent.venue,
          description: newEvent.description,
          total_capacity: newEvent.totalCapacity,
          image_url: uploadedImageUrl,
        })
        .eq('id', editEventId);

      if (error) throw error;

      setIsCreateModalOpen(false);
      setEditEventId(null);
      setCoverFile(null);
      fetchEvents();
      alert("Event updated successfully!");
    } catch (error: any) {
      console.error("Update event error:", error);
      alert(`Failed to update event: ${error.message || JSON.stringify(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ status: 'PUBLISHED' })
        .eq('id', eventId);
      if (error) throw error;
      fetchEvents();
    } catch (error) {
      console.error("Publish event error:", error);
      alert('Failed to publish event.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-bold text-slate-900">My Events</h1>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="mt-4 sm:mt-0 flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </button>
      </div>

      {isLoading ? (
          <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
      ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
              <p className="text-slate-500">No events found. Create your first one!</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event) => (
            <div 
                key={event.id} 
                className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer"
                onClick={() => onSelectEvent(event.id)}
            >
                <div className="relative h-48 overflow-hidden">
                <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md 
                    ${event.status === EventStatus.PUBLISHED ? 'bg-green-500/90 text-white' : 
                        event.status === EventStatus.DRAFT ? 'bg-slate-500/90 text-white' : 
                        'bg-blue-500/90 text-white'}`}>
                    {event.status}
                    </span>
                </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-green-600 transition-colors">{event.title}</h3>
                
                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-500">
                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                    {event.date} • {event.time}
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                    <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                    {event.venue}
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-600">Sales Progress</span>
                    <span className="text-sm font-bold text-slate-900">{event.totalCapacity > 0 ? Math.round((event.ticketsSold / event.totalCapacity) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                    <div 
                        className="bg-slate-900 h-2 rounded-full" 
                        style={{ width: `${event.totalCapacity > 0 ? (event.ticketsSold / event.totalCapacity) * 100 : 0}%` }}
                    ></div>
                    </div>

                    <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold">Revenue</p>
                        <p className="text-sm font-bold text-slate-900">R {event.revenue.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      {event.status !== EventStatus.PUBLISHED && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsCreateModalOpen(true);
                              setEditEventId(event.id);
                              setNewEvent({
                                id: event.id,
                                title: event.title,
                                date: event.date,
                                time: event.time,
                                venue: event.venue,
                                description: event.description,
                                totalCapacity: event.totalCapacity,
                                imageUrl: event.imageUrl,
                              });
                              setCoverFile(null);
                            }}
                            className="text-xs px-3 py-1.5 rounded-full bg-slate-200 text-slate-800 hover:bg-slate-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePublish(event.id);
                            }}
                            className="text-xs px-3 py-1.5 rounded-full bg-green-600 text-white hover:bg-green-700"
                          >
                            Publish
                          </button>
                        </>
                      )}
                      <button className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            ))}
        </div>
      )}

      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-slate-900">Create New Event</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">Event Details</h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Event Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="e.g. Summer Music Festival"
                    value={newEvent.title}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <div className="relative">
                      <input 
                        type="date" 
                        className="w-full px-3 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500" 
                        value={newEvent.date}
                        onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                      />
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                    <div className="relative">
                      <input 
                        type="time" 
                        className="w-full px-3 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500" 
                        value={newEvent.time}
                        onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                      />
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Venue</label>
                  <div className="relative">
                    <input 
                        type="text" 
                        className="w-full px-3 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500" 
                        placeholder="Search for a location..." 
                        value={newEvent.venue}
                        onChange={e => setNewEvent({...newEvent, venue: e.target.value})}
                    />
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500" 
                    rows={3} 
                    placeholder="Tell people what to expect..."
                    value={newEvent.description}
                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  />
                </div>
              </div>

              {/* Tickets */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">Ticket Types</h3>
                  <button onClick={addTicketType} className="text-sm text-green-600 font-medium hover:text-green-700">+ Add Ticket Type</button>
                </div>
                
                <div className="space-y-3">
                  {ticketTypes.map((ticket, index) => (
                    <div key={index} className="flex gap-3 items-end p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Name</label>
                        <input 
                            type="text" 
                            className="w-full px-2 py-1 text-sm border border-slate-300 rounded" 
                            placeholder="e.g. VIP" 
                            value={ticket.name}
                            onChange={(e) => {
                                const newTypes = [...ticketTypes];
                                newTypes[index].name = e.target.value;
                                setTicketTypes(newTypes);
                            }} 
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Price (R)</label>
                        <input 
                            type="number" 
                            className="w-full px-2 py-1 text-sm border border-slate-300 rounded" 
                            placeholder="0.00" 
                            value={ticket.price} 
                            onChange={(e) => {
                                const newTypes = [...ticketTypes];
                                const nextPrice = parseFloat(e.target.value);
                                newTypes[index].price = Number.isNaN(nextPrice) ? 0 : nextPrice;
                                setTicketTypes(newTypes);
                            }}
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Quantity</label>
                        <input 
                            type="number" 
                            className="w-full px-2 py-1 text-sm border border-slate-300 rounded" 
                            placeholder="100" 
                            value={ticket.capacity} 
                            onChange={(e) => {
                                const newTypes = [...ticketTypes];
                                const nextCapacity = parseInt(e.target.value, 10);
                                newTypes[index].capacity = Number.isNaN(nextCapacity) ? 0 : nextCapacity;
                                setTicketTypes(newTypes);
                            }}
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeTicketType(index)}
                        disabled={ticketTypes.length === 1}
                        className="p-2 text-slate-400 hover:text-red-500 disabled:text-slate-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold uppercase text-slate-500 tracking-wider">Event Cover</h3>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setCoverFile(file);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center w-full"
                  >
                    <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 font-medium">
                      {coverFile ? coverFile.name : 'Click to upload image'}
                    </p>
                    <p className="text-xs text-slate-400">{isUploadingImage ? 'Uploading...' : 'PNG, JPG up to 5MB'}</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={editEventId ? handleUpdateEvent : handleCreateEvent}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                {isLoading ? (editEventId ? 'Updating...' : 'Creating...') : (editEventId ? 'Save Changes' : 'Create Draft Event')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
