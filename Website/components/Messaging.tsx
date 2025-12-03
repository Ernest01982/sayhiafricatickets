
import React, { useState } from 'react';
import { MessageSquare, Sparkles, Send, Loader2, AlertCircle, Calculator, Tag, Plus, Copy, Trash2, X, Smartphone } from 'lucide-react';
import { generateMarketingMessage } from '../services/geminiService';
import { MessageCampaign, Coupon } from '../types';
import { StatCard } from './StatCard';

const initialCampaigns: MessageCampaign[] = [
  { id: '1', title: 'Early Bird Reminder', audience: 'All Previous Attendees (450)', status: 'Sent', cost: 202.50, sentAt: '2 days ago', content: 'Hey! 🎟️ Early birds closing soon.', type: 'MARKETING' },
  { id: '2', title: 'VIP Parking Info', audience: 'VIP Ticket Holders (50)', status: 'Scheduled', cost: 22.50, content: 'VIP Parking is at Gate 3.', type: 'UTILITY' },
];

const initialCoupons: Coupon[] = [
    { id: '1', code: 'SUMMER20', discountValue: 20, discountType: 'PERCENTAGE', usageCount: 45, maxUsage: 100, status: 'ACTIVE', expiryDate: '2024-12-31' },
    { id: '2', code: 'EARLYBIRD', discountValue: 50, discountType: 'FIXED', usageCount: 200, maxUsage: 200, status: 'EXPIRED', expiryDate: '2024-10-01' },
    { id: '3', code: 'VIPACCESS', discountValue: 100, discountType: 'FIXED', usageCount: 12, maxUsage: 50, status: 'ACTIVE', expiryDate: '2024-12-15' },
];

export const Messaging: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'broadcasts' | 'coupons'>('broadcasts');
  
  // Smart Composer State
  const [composerOpen, setComposerOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [tone, setTone] = useState<'urgent' | 'exciting' | 'formal'>('exciting');
  const [details, setDetails] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Broadcast Logic State
  const [campaignHistory, setCampaignHistory] = useState<MessageCampaign[]>(initialCampaigns);
  const [isSending, setIsSending] = useState(false);

  // Estimator State
  const [recipientCount, setRecipientCount] = useState(100);
  const costPerMsg = 0.45; // ZAR

  // Coupon State
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    maxUsage: 100,
    expiryDate: ''
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    const result = await generateMarketingMessage(eventTitle, tone, details);
    setGeneratedContent(result);
    setIsGenerating(false);
  };

  const handleSendTest = () => {
    // Send to the business number as requested for testing
    const phoneNumber = '27735718920'; 
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      `*TEST MESSAGE PREVIEW*\n\n${generatedContent}`
    )}`;
    window.open(url, '_blank');
  };

  const handleBroadcast = () => {
    if (!generatedContent || !eventTitle) return;
    
    setIsSending(true);
    
    // Simulate network delay
    setTimeout(() => {
        const newCampaign: MessageCampaign = {
            id: Date.now().toString(),
            title: eventTitle || 'New Broadcast',
            audience: `Selected Audience (${recipientCount})`,
            status: 'Sent',
            cost: recipientCount * costPerMsg,
            sentAt: 'Just now',
            content: generatedContent,
            type: 'MARKETING'
        };
        
        setCampaignHistory([newCampaign, ...campaignHistory]);
        setIsSending(false);
        setGeneratedContent('');
        setEventTitle('');
        setDetails('');
        // Close composer after successful send
        setComposerOpen(false); 
        alert(`Successfully broadcasted to ${recipientCount} recipients!`);
    }, 1500);
  };

  const handleCreateCoupon = () => {
    const coupon: Coupon = {
        id: Math.random().toString(36).substr(2, 9),
        code: newCoupon.code?.toUpperCase() || 'CODE',
        discountType: newCoupon.discountType || 'PERCENTAGE',
        discountValue: newCoupon.discountValue || 0,
        usageCount: 0,
        maxUsage: newCoupon.maxUsage || 100,
        status: 'ACTIVE',
        expiryDate: newCoupon.expiryDate || '2025-12-31'
    };
    setCoupons([...coupons, coupon]);
    setIsCouponModalOpen(false);
    setNewCoupon({ code: '', discountType: 'PERCENTAGE', discountValue: 0, maxUsage: 100, expiryDate: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marketing Tools</h1>
          <p className="text-slate-500">Engage fans via WhatsApp and manage promotions.</p>
        </div>
        <div className="flex gap-2">
             {activeTab === 'broadcasts' && (
                <button 
                onClick={() => setComposerOpen(!composerOpen)}
                className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
                >
                <Sparkles className="w-4 h-4 mr-2" />
                Smart Composer
                </button>
             )}
             {activeTab === 'coupons' && (
                <button 
                onClick={() => setIsCouponModalOpen(true)}
                className="flex items-center bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
                >
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
                </button>
             )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
            <button 
                onClick={() => setActiveTab('broadcasts')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'broadcasts' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <MessageSquare className="w-4 h-4" /> Broadcasts & Ads
            </button>
            <button 
                onClick={() => setActiveTab('coupons')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'coupons' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <Tag className="w-4 h-4" /> Coupons & Discounts
            </button>
        </nav>
      </div>

      {activeTab === 'broadcasts' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
             {/* Messaging Costs & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Utility Messages (Service)</h3>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-900">1,240</span>
                        <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded">Free Tier</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Tickets, Receipts, Support replies.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Marketing Messages</h3>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-900">850</span>
                        <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded">R 0.45 / msg</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Broadcasts, Promos, Reminders.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-medium text-slate-500 mb-2">Total Spend (This Month)</h3>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-slate-900">R 382.50</span>
                        <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded">Deducted from Payout</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Next deduction: Tuesday</p>
                </div>
            </div>

            {/* AI Composer Panel */}
            {composerOpen && (
                <div className="bg-white rounded-xl border border-indigo-100 shadow-lg p-6">
                <div className="flex items-center mb-4 text-indigo-700">
                    <Sparkles className="w-5 h-5 mr-2" />
                    <h3 className="font-bold">AI WhatsApp Message Generator</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Event Name</label>
                        <input 
                        type="text" 
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. Summer Vibes Fest"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tone</label>
                            <select 
                            value={tone}
                            onChange={(e) => setTone(e.target.value as any)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                            <option value="exciting">Exciting & Hype</option>
                            <option value="urgent">Urgent (FOMO)</option>
                            <option value="formal">Formal & Informative</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Recipients (Est.)</label>
                            <input 
                                type="number" 
                                value={recipientCount}
                                onChange={(e) => setRecipientCount(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Key Details</label>
                        <textarea 
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        rows={3}
                        placeholder="e.g. 50% sold out, lineup announced, doors open at 6pm"
                        />
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600">Estimated Cost:</span>
                        <span className="font-bold text-slate-900">R {(recipientCount * costPerMsg).toFixed(2)}</span>
                    </div>

                    <button 
                        onClick={handleGenerate}
                        disabled={isGenerating || !eventTitle}
                        className="w-full flex justify-center items-center bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Generate Draft'}
                    </button>
                    </div>

                    <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex flex-col">
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2">Preview</span>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100 flex-1 font-sans text-sm leading-relaxed whitespace-pre-wrap">
                        {generatedContent || <span className="text-slate-400 italic">Your generated message will appear here...</span>}
                    </div>
                    {generatedContent && (
                        <div className="mt-4 flex flex-col gap-2">
                           <div className="flex gap-2">
                                <button 
                                    onClick={handleBroadcast}
                                    disabled={isSending}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center disabled:opacity-70"
                                >
                                    {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />} 
                                    {isSending ? 'Sending...' : `Broadcast (R ${(recipientCount * costPerMsg).toFixed(2)})`}
                                </button>
                                <button 
                                    onClick={() => setGeneratedContent('')}
                                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                                    Discard
                                </button>
                           </div>
                           
                           <button 
                                onClick={handleSendTest}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg flex items-center justify-center border border-slate-200"
                            >
                                <Smartphone className="w-4 h-4 mr-2" /> Send Test to My Phone (073 571 8920)
                            </button>
                        </div>
                    )}
                    </div>
                </div>
                </div>
            )}

            {/* Campaign List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-900">Recent Broadcasts</h3>
                </div>
                <div className="divide-y divide-slate-100">
                {campaignHistory.map((campaign) => (
                    <div key={campaign.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in slide-in-from-top-2">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${campaign.status === 'Sent' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{campaign.title}</h4>
                            <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${campaign.type === 'UTILITY' ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                                {campaign.type}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500">{campaign.audience}</p>
                        <p className="text-xs text-slate-400 mt-1">
                            {campaign.content.substring(0, 40)}...
                        </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6 md:ml-auto w-full md:w-auto justify-between md:justify-end">
                        <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">R {campaign.cost.toFixed(2)}</p>
                        <p className="text-xs text-slate-500">Total Cost</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border 
                        ${campaign.status === 'Sent' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {campaign.status}
                        </span>
                    </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
      )}

      {activeTab === 'coupons' && (
         <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon) => (
                    <div key={coupon.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider
                            ${coupon.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                              coupon.status === 'EXPIRED' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                            {coupon.status}
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Tag className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-mono font-bold text-slate-900">{coupon.code}</h3>
                                <p className="text-xs text-slate-500">Created via Dashboard</p>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Discount</span>
                                <span className="font-medium text-slate-900">
                                    {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% OFF` : `R ${coupon.discountValue} OFF`}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Usage</span>
                                <span className="font-medium text-slate-900">{coupon.usageCount} / {coupon.maxUsage}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div 
                                    className={`h-1.5 rounded-full ${coupon.status === 'ACTIVE' ? 'bg-indigo-500' : 'bg-slate-400'}`}
                                    style={{ width: `${(coupon.usageCount / coupon.maxUsage) * 100}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Expires</span>
                                <span className="font-medium text-slate-900">{coupon.expiryDate}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 border-t border-slate-100 pt-4">
                            <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                                <Copy className="w-4 h-4 mr-2" /> Copy
                            </button>
                            <button className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4 mr-2" /> Deactivate
                            </button>
                        </div>
                    </div>
                ))}

                {/* New Coupon Card (Trigger) */}
                <button 
                    onClick={() => setIsCouponModalOpen(true)}
                    className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all h-full min-h-[280px]"
                >
                    <div className="p-4 bg-slate-100 rounded-full mb-4 group-hover:bg-white">
                        <Plus className="w-8 h-8" />
                    </div>
                    <span className="font-medium">Create New Coupon</span>
                </button>
            </div>
         </div>
      )}

      {/* Create Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-indigo-600" />
                        Create Coupon
                    </h3>
                    <button onClick={() => setIsCouponModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Coupon Code</label>
                        <input 
                            type="text" 
                            placeholder="e.g. SUMMER2025"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg uppercase font-mono focus:ring-2 focus:ring-indigo-500"
                            value={newCoupon.code}
                            onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={newCoupon.discountType}
                                onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value as any})}
                            >
                                <option value="PERCENTAGE">Percentage (%)</option>
                                <option value="FIXED">Fixed Amount (R)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
                            <input 
                                type="number" 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={newCoupon.discountValue}
                                onChange={(e) => setNewCoupon({...newCoupon, discountValue: parseFloat(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Max Usage</label>
                            <input 
                                type="number" 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={newCoupon.maxUsage}
                                onChange={(e) => setNewCoupon({...newCoupon, maxUsage: parseInt(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                            <input 
                                type="date" 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                value={newCoupon.expiryDate}
                                onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button 
                        onClick={() => setIsCouponModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreateCoupon}
                        disabled={!newCoupon.code || !newCoupon.discountValue}
                        className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:bg-slate-400"
                    >
                        Create Coupon
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
