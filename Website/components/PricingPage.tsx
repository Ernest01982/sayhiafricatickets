
import React from 'react';
import { Check, X, Zap, Crown, Shield, ArrowRight, ArrowLeft, MessageSquare } from 'lucide-react';

interface PricingPageProps {
  onBack: () => void;
  onGetStarted: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onBack, onGetStarted }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-green-500 selection:text-black">
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
             <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                 <span className="text-lg">👋</span>
             </div>
            <h1 className="text-xl font-black tracking-tight">Pricing</h1>
          </div>
          <div className="w-20"></div> {/* Spacer */}
        </div>
      </div>

      {/* Hero */}
      <div className="relative pt-20 pb-16 text-center px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <h1 className="text-5xl md:text-7xl font-black mb-6 relative z-10">
          Pay Only When You <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-200">Sell Out.</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 relative z-10">
          No monthly fees. No setup costs. We only make money when you make money. 
          Simple, transparent, and built for growth.
        </p>

        {/* Toggle (Visual Only for now) */}
        <div className="inline-flex bg-slate-900 rounded-full p-1 border border-slate-800 relative z-10 mb-16">
            <button className="px-6 py-2 rounded-full bg-green-600 text-white font-bold text-sm shadow-lg">Pay Per Ticket</button>
            <button className="px-6 py-2 rounded-full text-slate-400 font-bold text-sm hover:text-white transition-colors">Volume Enterprise</button>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            
            {/* Starter */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 flex flex-col hover:border-slate-600 transition-all duration-300">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">The Plug</h3>
                    <p className="text-slate-400 text-sm">Perfect for club nights, pop-ups, and intimate gigs.</p>
                </div>
                <div className="mb-8">
                    <span className="text-4xl font-black text-white">0%</span>
                    <span className="text-slate-500 font-medium"> / month</span>
                    <div className="mt-4 p-3 bg-slate-800 rounded-xl border border-slate-700">
                        <p className="text-sm font-medium text-slate-300">
                            <span className="text-green-400 font-bold">5.0%</span> + R5 per ticket
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Passed on to the buyer</p>
                    </div>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Unlimited Events</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                        <span>WhatsApp QR Delivery</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Basic Scanner App</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                        <Check className="w-5 h-5 text-green-500 shrink-0" />
                        <span>Weekly Payouts</span>
                    </li>
                </ul>
                <button 
                    onClick={onGetStarted}
                    className="w-full py-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                >
                    Start Free
                </button>
            </div>

            {/* Pro - Highlighted */}
            <div className="bg-slate-900 border-2 border-green-500 rounded-3xl p-8 flex flex-col transform md:-translate-y-4 shadow-[0_0_40px_rgba(34,197,94,0.15)] relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                    Most Popular
                </div>
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                        The Headliner <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    </h3>
                    <p className="text-slate-400 text-sm">For festivals, venues, and serious promoters.</p>
                </div>
                <div className="mb-8">
                    <span className="text-4xl font-black text-white">Custom</span>
                    <span className="text-slate-500 font-medium"> pricing</span>
                    <div className="mt-4 p-3 bg-slate-800 rounded-xl border border-slate-700">
                        <p className="text-sm font-medium text-slate-300">
                            Reduced Service Fees
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Based on ticket volume</p>
                    </div>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-start gap-3 text-sm text-white font-medium">
                        <div className="p-1 bg-green-500/20 rounded-full">
                            <Check className="w-3 h-3 text-green-500" />
                        </div>
                        <span>Everything in The Plug</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-white font-medium">
                        <div className="p-1 bg-green-500/20 rounded-full">
                            <Check className="w-3 h-3 text-green-500" />
                        </div>
                        <span>WhatsApp Marketing Suite</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-white font-medium">
                        <div className="p-1 bg-green-500/20 rounded-full">
                            <Check className="w-3 h-3 text-green-500" />
                        </div>
                        <span>AI Agent (Support Bot)</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-white font-medium">
                        <div className="p-1 bg-green-500/20 rounded-full">
                            <Check className="w-3 h-3 text-green-500" />
                        </div>
                        <span>Live Command Center</span>
                    </li>
                </ul>
                <button 
                    onClick={onGetStarted}
                    className="w-full py-4 rounded-xl font-bold text-sm bg-green-500 hover:bg-green-400 text-black transition-colors shadow-lg shadow-green-900/20"
                >
                    Get Started
                </button>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 flex flex-col hover:border-slate-600 transition-all duration-300">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">The Legend</h3>
                    <p className="text-slate-400 text-sm">For multi-day festivals and stadium tours.</p>
                </div>
                <div className="mb-8">
                    <span className="text-4xl font-black text-white">Contact Us</span>
                    <div className="mt-4 p-3 bg-slate-800 rounded-xl border border-slate-700">
                        <p className="text-sm font-medium text-slate-300">
                            Tailored Agreement
                        </p>
                        <p className="text-xs text-slate-500 mt-1">SLA & Dedicated Account Manager</p>
                    </div>
                </div>
                <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                        <Crown className="w-5 h-5 text-yellow-500 shrink-0" />
                        <span>White-label WhatsApp Bot</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                        <Crown className="w-5 h-5 text-yellow-500 shrink-0" />
                        <span>On-site Tech Support</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                        <Crown className="w-5 h-5 text-yellow-500 shrink-0" />
                        <span>Custom Payment Integration</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-300">
                        <Crown className="w-5 h-5 text-yellow-500 shrink-0" />
                        <span>API Access</span>
                    </li>
                </ul>
                <button className="w-full py-4 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white transition-colors">
                    Contact Sales
                </button>
            </div>
        </div>
      </div>

      {/* Feature Breakdown / "The Secret Sauce" */}
      <div className="py-20 bg-slate-900">
         <div className="max-w-4xl mx-auto px-4">
             <div className="text-center mb-12">
                 <h2 className="text-3xl font-black text-white mb-4">Included in The Fee</h2>
                 <p className="text-slate-400">We don't nickel and dime you. Here is what's under the hood.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
                     <div className="flex items-start gap-4">
                         <div className="p-3 bg-green-500/10 rounded-xl">
                             <MessageSquare className="w-6 h-6 text-green-500" />
                         </div>
                         <div>
                             <h4 className="font-bold text-white mb-1">WhatsApp Infrastructure</h4>
                             <p className="text-sm text-slate-400">We cover the cost of ticket delivery messages and basic utility notifications. You never pay for "Session Templates" on ticket delivery.</p>
                         </div>
                     </div>
                 </div>

                 <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
                     <div className="flex items-start gap-4">
                         <div className="p-3 bg-blue-500/10 rounded-xl">
                             <Shield className="w-6 h-6 text-blue-500" />
                         </div>
                         <div>
                             <h4 className="font-bold text-white mb-1">Fraud Protection</h4>
                             <p className="text-sm text-slate-400">Our AI monitors velocity checks and duplicate scans in real-time. Secure QR codes are generated dynamically.</p>
                         </div>
                     </div>
                 </div>
                 
                  <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
                     <div className="flex items-start gap-4">
                         <div className="p-3 bg-purple-500/10 rounded-xl">
                             <Zap className="w-6 h-6 text-purple-500" />
                         </div>
                         <div>
                             <h4 className="font-bold text-white mb-1">Server Capacity</h4>
                             <p className="text-sm text-slate-400">Expecting a viral drop? We scale automatically. No crashing when you release Early Birds.</p>
                         </div>
                     </div>
                 </div>

                 <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700">
                     <div className="flex items-start gap-4">
                         <div className="p-3 bg-yellow-500/10 rounded-xl">
                             <Crown className="w-6 h-6 text-yellow-500" />
                         </div>
                         <div>
                             <h4 className="font-bold text-white mb-1">Payment Processing</h4>
                             <p className="text-sm text-slate-400">We handle the PayFast integration. You don't need your own merchant account to get started.</p>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
      </div>

      {/* FAQ */}
      <div className="py-20 max-w-3xl mx-auto px-4">
         <h2 className="text-3xl font-black text-white mb-10 text-center">Frequently Asked Questions</h2>
         <div className="space-y-6">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                 <h4 className="font-bold text-white mb-2">When do I get paid?</h4>
                 <p className="text-slate-400 text-sm">Payouts are processed every Tuesday for the previous week's sales. Funds are settled directly into your South African bank account.</p>
             </div>
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                 <h4 className="font-bold text-white mb-2">Can I pass the fees to the customer?</h4>
                 <p className="text-slate-400 text-sm">Yes! By default, the service fee is added on top of your ticket price, so you receive your full asking price.</p>
             </div>
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                 <h4 className="font-bold text-white mb-2">Are there WhatsApp messaging costs?</h4>
                 <p className="text-slate-400 text-sm">Ticket delivery is free. For marketing broadcasts (e.g. "Tickets are live!"), standard Meta template rates apply. You can view these estimates in your dashboard before sending.</p>
             </div>
         </div>
      </div>

      {/* Bottom CTA */}
      <div className="py-20 text-center">
          <h2 className="text-4xl font-black text-white mb-6">Ready to sell out?</h2>
          <button 
            onClick={onGetStarted}
            className="px-8 py-4 bg-green-500 text-black font-black text-lg rounded-full hover:bg-green-400 transition-all hover:scale-105 shadow-[0_0_30px_rgba(34,197,94,0.4)]"
          >
            Create Event Free <ArrowRight className="inline ml-2 w-5 h-5" />
          </button>
      </div>

    </div>
  );
};
