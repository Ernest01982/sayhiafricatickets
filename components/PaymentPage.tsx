import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';

interface PaymentPageProps {
  onBack: () => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ onBack }) => {
  const [params, setParams] = useState({ amt: '0', ref: '', name: '' });
  const [status, setStatus] = useState<'checkout' | 'success' | 'cancelled'>('checkout');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const amt = searchParams.get('amt') || '0';
    const ref = searchParams.get('ref') || `REF-${Date.now()}`;
    const name = searchParams.get('name') || 'Customer';

    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      setStatus('success');
    } else if (paymentStatus === 'cancel') {
      setStatus('cancelled');
    }

    setParams({ amt, ref, name });
  }, []);

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Payment Successful!</h1>
          <p className="text-slate-500 mb-6">Thank you, {params.name}. Your tickets have been sent to WhatsApp.</p>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/');
              window.location.reload();
            }}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
          >
            Return to App
          </button>
        </div>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Payment Cancelled</h1>
          <p className="text-slate-500 mb-6">You can resume checkout anytime.</p>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/');
              window.location.reload();
            }}
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold"
          >
            Return to App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white text-center relative">
           <button onClick={onBack} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full">
             <ArrowLeft className="w-5 h-5" />
           </button>
           <h1 className="text-lg font-bold flex items-center justify-center gap-2">
             <Lock className="w-4 h-4" /> Secure Checkout
           </h1>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <p className="text-slate-500 text-sm uppercase font-bold tracking-wider mb-2">Total Amount</p>
            <p className="text-5xl font-black text-slate-900">R {params.amt}</p>
            <div className="mt-4 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
              TEST MODE • SANDBOX
            </div>
          </div>

          {/* PayFast Form */}
          <form action="https://sandbox.payfast.co.za/eng/process" method="post">
            {/* Merchant Details */}
            <input type="hidden" name="merchant_id" value={import.meta.env.VITE_PAYFAST_MERCHANT_ID || '10004002'} />
            <input type="hidden" name="merchant_key" value={import.meta.env.VITE_PAYFAST_MERCHANT_KEY || 'q1cd2rdny4a53'} />
            
            {/* Transaction Details */}
            <input type="hidden" name="return_url" value={`${window.location.origin}/pay?payment=success&name=${encodeURIComponent(params.name)}&email=${encodeURIComponent(new URLSearchParams(window.location.search).get('email') || '')}`} />
            <input type="hidden" name="cancel_url" value={`${window.location.origin}/pay?payment=cancel`} />
            <input type="hidden" name="notify_url" value={`https://illeefvnyyilddhhwooz.functions.supabase.co/payfast-notify`} />
            
            <input type="hidden" name="amount" value={params.amt} />
            <input type="hidden" name="item_name" value={`Ticket Order #${params.ref}`} />
            <input type="hidden" name="email_address" value={new URLSearchParams(window.location.search).get('email') || ''} />
            
            <button 
              type="submit"
              className="w-full py-4 bg-[#ff4d4d] hover:bg-[#ff3333] text-white font-bold text-lg rounded-xl shadow-lg shadow-red-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              Pay with PayFast
            </button>
          </form>

          <p className="text-xs text-center text-slate-400 mt-6">
            Secured by PayFast. No real money will be charged.
          </p>
        </div>
      </div>
    </div>
  );
};
