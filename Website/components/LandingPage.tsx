
import React, { useState, useEffect } from 'react';
import { MessageSquare, DollarSign, Zap, CheckCircle, ArrowRight, Heart, Share2, Music, PartyPopper, Eye, ChevronLeft, Battery, Phone, Video, MoreVertical, Check, RefreshCw, Flame, TrendingUp } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onNavigateToLegal: (doc: 'terms' | 'privacy') => void;
  onNavigateToEvents: () => void;
  onNavigateToPricing: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onNavigateToLegal, onNavigateToEvents, onNavigateToPricing }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Simulation Steps
  const steps = [
    { title: "Say 'Hi'", desc: "Users start the chat instantly. No app downloads." },
    { title: "Browse Events", desc: "AI Bot lists upcoming events with images and details." },
    { title: "Select Tickets", desc: "User picks ticket type and quantity in the chat." },
    { title: "Secure Payment", desc: "Seamless checkout via PayFast link." },
    { title: "Get QR Code", desc: "Ticket delivered instantly to WhatsApp." }
  ];

  // Auto-play the simulation
  useEffect(() => {
    let interval: any;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length) return 0; // Loop back
          return prev + 1;
        });
      }, 2500); // Change step every 2.5 seconds
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, steps.length]);

  const scrollToDemo = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setCurrentStep(0);
      setIsAutoPlaying(true);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setIsAutoPlaying(false); // Stop auto-play if user interacts manually
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-green-500 selection:text-black">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                 <span className="text-2xl">👋</span>
               </div>
              <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-200">
                Say HI Africa
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={onNavigateToEvents}
                className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
              >
                Vibe Check
              </button>
              <button 
                onClick={onNavigateToPricing} 
                className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
              >
                Pricing
              </button>
              <button 
                onClick={onLoginClick}
                className="text-sm font-bold text-white hover:text-green-400 transition-colors"
              >
                Login
              </button>
              <button 
                onClick={onLoginClick}
                className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-extrabold hover:bg-green-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Start the Party
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=2574&auto=format&fit=crop" 
                alt="Party Background" 
                className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/90 to-slate-900"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 to-green-900/30 mix-blend-overlay"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 mb-8 animate-in slide-in-from-top-4 duration-700">
            <Zap className="w-4 h-4 mr-2 fill-yellow-300" />
            The #1 WhatsApp Ticketing Partner in Africa
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-none drop-shadow-2xl">
            THE PARTY STARTS <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-300 to-pink-500">
              ON WHATSAPP
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Say HI to the easiest way to sell tickets. No apps, no logins, just pure vibes. 
            Meet your fans where they already live.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={onLoginClick}
              className="group relative px-8 py-4 bg-green-500 text-black font-black text-lg rounded-full transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(34,197,94,0.6)]"
            >
              <span className="flex items-center">
                Create Events Free <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button 
              onClick={scrollToDemo}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-lg rounded-full hover:bg-white/20 transition-all"
            >
              See How It Works
            </button>
          </div>

          {/* Floating Stats / Social Proof */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-3xl font-black text-white">1M+</p>
                <p className="text-sm text-slate-400 font-medium">Tickets Sold</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-3xl font-black text-green-400">100%</p>
                <p className="text-sm text-slate-400 font-medium">WhatsApp Native</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-3xl font-black text-yellow-400">Zero</p>
                <p className="text-sm text-slate-400 font-medium">Monthly Fees</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-3xl font-black text-pink-400">24/7</p>
                <p className="text-sm text-slate-400 font-medium">AI Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Vibe Check Section */}
      <div id="vibe-check" className="bg-slate-900 relative overflow-hidden">
        
        {/* Live Hype Ticker - Straightened */}
        <div className="bg-green-500 overflow-hidden py-2 border-y-4 border-black z-20 relative">
           <div className="whitespace-nowrap flex gap-8 animate-marquee font-black text-black text-lg uppercase tracking-wider">
              <span>🔥 Sarah just bought 4 VIP tickets to Summer Fest</span>
              <span>🚀 Neon Run is 90% Sold Out</span>
              <span>💎 Mike just checked in at Gate A</span>
              <span>⚡ Payment processed in 3 seconds</span>
              <span>🔥 Sarah just bought 4 VIP tickets to Summer Fest</span>
              <span>🚀 Neon Run is 90% Sold Out</span>
              <span>💎 Mike just checked in at Gate A</span>
              <span>⚡ Payment processed in 3 seconds</span>
              <span>🔥 Sarah just bought 4 VIP tickets to Summer Fest</span>
              <span>🚀 Neon Run is 90% Sold Out</span>
              <span>💎 Mike just checked in at Gate A</span>
              <span>⚡ Payment processed in 3 seconds</span>
           </div>
        </div>

        <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-2 border-2 border-white rounded-full mb-6">
                <span className="text-xl font-black uppercase tracking-widest">Vibe Check</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Does your current platform<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">pass the vibe check?</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Most ticketing sites are boring. We built a hype machine that lives in your pocket.
            </p>

            {/* New Link to Public Events Page */}
            <button 
              onClick={onNavigateToEvents}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-black text-lg rounded-full hover:bg-green-400 hover:text-black transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <Flame className="w-5 h-5" />
              Browse Live Vibes
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Vibe Card 1 */}
            <div className="group relative p-8 rounded-3xl bg-slate-800 border border-slate-700 hover:border-green-500 transition-all duration-300 hover:-translate-y-2 overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 border border-slate-700 group-hover:border-green-500 shadow-lg shadow-green-900/20">
                   <MessageSquare className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-3xl font-black text-white mb-2 italic">ZERO FRICTION</h3>
                <p className="text-lg font-bold text-green-400 mb-4">"Download our App"</p>
                <p className="text-slate-400 leading-relaxed">
                  Said no one ever. Your fans are already on WhatsApp. We put the "Buy Ticket" button right in their chat list. Conversion rates go 📈.
                </p>
              </div>
            </div>

            {/* Vibe Card 2 */}
            <div className="group relative p-8 rounded-3xl bg-slate-800 border border-slate-700 hover:border-pink-500 transition-all duration-300 hover:-translate-y-2 overflow-hidden">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-all"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 border border-slate-700 group-hover:border-pink-500 shadow-lg shadow-pink-900/20">
                   <Flame className="w-8 h-8 text-pink-500" />
                </div>
                <h3 className="text-3xl font-black text-white mb-2 italic">HYPE MACHINE</h3>
                <p className="text-lg font-bold text-pink-400 mb-4">Broadcast 2 Everyone</p>
                <p className="text-slate-400 leading-relaxed">
                  Send a WhatsApp blast to 5,000 past attendees when tickets drop. It's like having a direct line to the jol.
                </p>
              </div>
            </div>

            {/* Vibe Card 3 */}
            <div className="group relative p-8 rounded-3xl bg-slate-800 border border-slate-700 hover:border-yellow-500 transition-all duration-300 hover:-translate-y-2 overflow-hidden">
               <div className="absolute -right-10 -top-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl group-hover:bg-yellow-500/20 transition-all"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 border border-slate-700 group-hover:border-yellow-500 shadow-lg shadow-yellow-900/20">
                   <TrendingUp className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-3xl font-black text-white mb-2 italic">SECURE THE BAG</h3>
                <p className="text-lg font-bold text-yellow-400 mb-4">Weekly Payouts</p>
                <p className="text-slate-400 leading-relaxed">
                  We don't hold your money hostage. Get paid every Tuesday. Real-time analytics so you know exactly how much you made tonight.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Phone Mockup / Simulation Section */}
      <div id="how-it-works" className="py-24 bg-slate-950 overflow-hidden relative border-t border-white/5">
          {/* Decor elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-[100px]"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
              
              {/* Steps Indicator */}
              <div className="lg:w-1/2">
                  <div className="flex items-center gap-3 mb-8">
                    <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                        How It Works
                    </h2>
                    <button 
                      onClick={() => { setCurrentStep(0); setIsAutoPlaying(true); }}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      title="Replay Simulation"
                    >
                      <RefreshCw className={`w-5 h-5 text-green-400 ${isAutoPlaying ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="space-y-6 relative">
                      {/* Vertical Line */}
                      <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-800"></div>

                      {steps.map((step, index) => (
                        <div 
                          key={index} 
                          className={`relative pl-12 transition-all duration-500 cursor-pointer group ${currentStep === index ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}
                          onClick={() => handleStepClick(index)}
                        >
                           {/* Dot */}
                           <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-500
                              ${currentStep >= index ? 'bg-green-500 border-green-500' : 'bg-slate-900 border-slate-700 group-hover:border-green-500/50'}`}>
                              {currentStep > index ? <Check className="w-4 h-4 text-black font-bold" /> : <span className={`text-xs font-bold ${currentStep === index ? 'text-black' : 'text-slate-500'}`}>{index + 1}</span>}
                           </div>
                           
                           <h3 className={`text-xl font-bold transition-colors ${currentStep === index ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                             {step.title}
                           </h3>
                           <p className="text-slate-400 text-sm mt-1 max-w-sm">
                             {step.desc}
                           </p>
                        </div>
                      ))}
                  </div>
              </div>
              
              {/* Phone Mockup with WhatsApp Chat Simulation */}
              <div className="lg:w-1/2 relative flex justify-center">
                  <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-slate-800 group max-w-[320px] md:max-w-[360px] aspect-[9/19] bg-[#0b141a]">
                       {/* Background Image of Festival/Party */}
                       <img 
                          src="https://images.unsplash.com/photo-1514525253440-b393452e8d03?q=80&w=1000&auto=format&fit=crop" 
                          className="absolute inset-0 w-full h-full object-cover opacity-40 filter blur-[2px]"
                          alt="Festival Party" 
                       />
                       
                       {/* WhatsApp UI Overlay */}
                       <div className="absolute inset-0 flex flex-col">
                           {/* Header */}
                           <div className="bg-[#202c33] p-3 flex items-center gap-3 shadow-sm z-20">
                               <div className="flex items-center text-[#aebac1]">
                                   <ChevronLeft className="w-6 h-6" />
                                   <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center ml-1 relative">
                                       <span className="text-lg">👋</span>
                                       <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-[2px] border border-[#202c33]">
                                          <CheckCircle className="w-3 h-3 text-white fill-white" />
                                       </div>
                                   </div>
                               </div>
                               <div className="flex-1">
                                   <div className="text-white font-medium flex items-center gap-1">
                                       Say HI Africa
                                       <span className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                           <Check className="w-2 h-2 text-black font-bold" />
                                       </span>
                                   </div>
                                   <div className="text-xs text-[#8696a0]">Official Business Account</div>
                               </div>
                               <div className="flex gap-4 text-[#aebac1]">
                                   <Video className="w-5 h-5" />
                                   <Phone className="w-5 h-5" />
                                   <MoreVertical className="w-5 h-5" />
                               </div>
                           </div>

                           {/* Chat Area */}
                           <div className="flex-1 p-4 space-y-4 overflow-hidden font-sans relative z-10">
                               
                               {/* Step 0: User Hi */}
                               {currentStep >= 0 && (
                                 <div className="flex justify-end animate-in fade-in slide-in-from-right-4 duration-300">
                                     <div className="bg-[#005c4b] rounded-b-xl rounded-tl-xl p-3 shadow-sm">
                                         <p className="text-sm text-[#e9edef]">Hi 👋</p>
                                         <div className="flex justify-end items-center gap-1 mt-1">
                                             <span className="text-[10px] text-[#8696a0]">14:00</span>
                                             <div className="flex"><Check className="w-3 h-3 text-[#53bdeb]" /><Check className="w-3 h-3 text-[#53bdeb] -ml-1.5" /></div>
                                         </div>
                                     </div>
                                 </div>
                               )}

                               {/* Step 1: Bot Welcome */}
                               {currentStep >= 1 && (
                                <div className="flex justify-start animate-in fade-in slide-in-from-left-4 duration-500">
                                   <div className="bg-[#202c33] rounded-b-xl rounded-tr-xl p-3 max-w-[85%] shadow-sm">
                                       <p className="text-sm text-[#e9edef]">Welcome to Say HI Africa! 🌍 <br/>Here are the hottest events this weekend:</p>
                                       <div className="mt-2 bg-[#2a3942] rounded-lg overflow-hidden border border-[#37404a]">
                                           <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=300&auto=format&fit=crop" className="w-full h-20 object-cover" alt="Event" />
                                           <div className="p-2">
                                               <p className="text-sm font-bold text-[#e9edef]">Summer Vibes Fest 🌴</p>
                                               <p className="text-xs text-[#8696a0]">Sun, 15 Dec • Cape Town</p>
                                               <div className="mt-2 bg-[#202c33] py-1.5 text-center rounded border border-[#37404a]">
                                                  <span className="text-blue-400 text-xs font-medium">View Tickets</span>
                                               </div>
                                           </div>
                                       </div>
                                       <div className="text-[10px] text-[#8696a0] text-right mt-1">14:00</div>
                                   </div>
                               </div>
                               )}

                               {/* Step 2: User Selection */}
                               {currentStep >= 2 && (
                                   <div className="flex justify-end animate-in fade-in slide-in-from-right-4 duration-500">
                                       <div className="bg-[#005c4b] rounded-b-xl rounded-tl-xl p-3 max-w-[80%] shadow-sm">
                                           <p className="text-sm text-[#e9edef]">2 VIP tickets for Summer Vibes please!</p>
                                           <div className="flex justify-end items-center gap-1 mt-1">
                                               <span className="text-[10px] text-[#8696a0]">14:01</span>
                                               <div className="flex"><Check className="w-3 h-3 text-[#53bdeb]" /><Check className="w-3 h-3 text-[#53bdeb] -ml-1.5" /></div>
                                           </div>
                                       </div>
                                   </div>
                               )}

                               {/* Step 3: Bot Payment */}
                               {currentStep >= 3 && (
                                   <div className="flex justify-start animate-in fade-in slide-in-from-left-4 duration-500">
                                       <div className="bg-[#202c33] rounded-b-xl rounded-tr-xl p-3 max-w-[85%] shadow-sm">
                                           <p className="text-sm text-[#e9edef]">Total: R900. 🎟️🎟️ <br/>Click to pay securely via PayFast:</p>
                                           <div className="mt-2 bg-[#2a3942] rounded-lg p-2 flex items-center gap-3 border border-[#37404a]">
                                               <div className="bg-white p-1 rounded h-8 w-8 flex items-center justify-center">
                                                   <DollarSign className="w-5 h-5 text-black" />
                                               </div>
                                               <div>
                                                   <p className="text-sm font-medium text-[#e9edef]">Pay R900.00</p>
                                                   <p className="text-[10px] text-[#8696a0]">Secure Checkout</p>
                                               </div>
                                           </div>
                                           <div className="text-[10px] text-[#8696a0] text-right mt-1">14:01</div>
                                       </div>
                                   </div>
                               )}

                               {/* Step 4: Bot Success */}
                               {currentStep >= 4 && (
                                   <div className="flex justify-start animate-in fade-in slide-in-from-left-4 duration-500">
                                       <div className="bg-[#202c33] rounded-b-xl rounded-tr-xl p-3 max-w-[85%] shadow-sm">
                                           <p className="text-sm text-[#e9edef]">🎉 Paid! Here are your tickets:</p>
                                           <div className="mt-2 bg-white rounded-lg p-2 w-24 mx-auto">
                                               <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DEMO-TICKET" alt="QR" className="w-full" />
                                           </div>
                                            <div className="text-[10px] text-[#8696a0] text-right mt-1">14:02</div>
                                       </div>
                                   </div>
                               )}
                           </div>

                            {/* Input Area */}
                            <div className="bg-[#202c33] p-2 px-3 flex items-center gap-3 z-20">
                                <div className="p-2 bg-[#2a3942] rounded-full">
                                    <PartyPopper className="w-5 h-5 text-[#8696a0]" />
                                </div>
                                <div className="flex-1 bg-[#2a3942] rounded-full h-10 px-4 flex items-center text-[#8696a0] text-sm">
                                    {currentStep < steps.length ? "Type a message..." : "See you there! 👋"}
                                </div>
                                <div className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center shadow-lg">
                                     <Phone className="w-5 h-5 text-white rotate-90 fill-white" />
                                </div>
                            </div>
                       </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                 <span className="text-lg">👋</span>
             </div>
            <span className="text-xl font-bold text-white">Say HI Africa</span>
          </div>
          
          <div className="flex gap-8 text-slate-400 text-sm font-medium">
             <button onClick={() => onNavigateToLegal('terms')} className="hover:text-white transition-colors">Terms & Conditions</button>
             <button onClick={() => onNavigateToLegal('privacy')} className="hover:text-white transition-colors">Privacy Policy (POPIA)</button>
             <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>

          <div className="text-slate-500 text-sm">
            © 2024 Say HI Africa. Built for the culture.
          </div>
        </div>
      </footer>
    </div>
  );
};
