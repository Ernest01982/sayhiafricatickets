import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, Flashlight, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

export const Scanner: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [scanResult, setScanResult] = useState<'idle' | 'valid' | 'invalid' | 'used' | 'loading'>('idle');
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState(''); // For manual simulation input in this demo

  // Real validate logic
  const handleValidate = async (qrCode: string) => {
    setScanResult('loading');
    
    try {
        // 1. Check ticket in DB
        const { data: ticket, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('qr_code', qrCode)
            .single();

        if (error || !ticket) {
            setScanResult('invalid');
            setLastScanned('Unknown Ticket');
            return;
        }

        if (ticket.status === 'USED') {
            setScanResult('used');
            setLastScanned(ticket.holder_name);
            return;
        }

        if (ticket.status === 'INVALID') {
            setScanResult('invalid');
            setLastScanned(ticket.holder_name);
            return;
        }

        // 2. Mark as USED
        const { error: updateError } = await supabase
            .from('tickets')
            .update({ status: 'USED' })
            .eq('id', ticket.id);

        if (updateError) throw updateError;

        // 3. Log Check-in
        await supabase.from('check_in_logs').insert({
            ticket_id: ticket.id,
            gate_name: 'Main Gate',
            status: 'SUCCESS',
            scanner_id: 'WEB-SCANNER-01'
        });

        setScanResult('valid');
        setLastScanned(ticket.holder_name);

    } catch (err) {
        console.error("Scan error:", err);
        setScanResult('invalid');
    }
  };

  const resetScan = () => {
    setScanResult('idle');
    setLastScanned(null);
    setInputCode('');
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Scanner Header */}
      <div className="flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md absolute top-0 w-full z-10">
        <button onClick={onExit} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-bold text-lg">Gate Scanner</h1>
        <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <Flashlight className="w-5 h-5" />
        </button>
      </div>

      {/* Camera Viewport (Simulated) */}
      <div className="flex-1 relative flex flex-col items-center justify-center bg-gray-800 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
        
        {/* Scanning Overlay */}
        {scanResult === 'idle' && (
          <div className="relative z-0 flex flex-col items-center animate-pulse w-full max-w-sm px-4">
            <div className="w-64 h-64 border-2 border-green-500/50 rounded-lg flex items-center justify-center relative mb-8">
               <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500"></div>
               <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500"></div>
               <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500"></div>
               <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500"></div>
            </div>
            
            {/* Input for testing since we can't access real camera in this iframe easily */}
            <div className="bg-black/50 p-4 rounded-xl backdrop-blur-md w-full">
                <p className="text-sm text-center mb-2 text-slate-300">Test Mode: Enter QR Code</p>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="e.g. 8831-..."
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-green-500"
                    />
                    <button 
                        onClick={() => handleValidate(inputCode)}
                        disabled={!inputCode}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
                    >
                        Scan
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {scanResult === 'loading' && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80">
                <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
            </div>
        )}

        {/* Result Overlay */}
        {(scanResult === 'valid' || scanResult === 'invalid' || scanResult === 'used') && (
           <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 p-6 text-center animate-in zoom-in-95 duration-200">
             {scanResult === 'valid' && (
                <div className="bg-green-500 rounded-full p-6 mb-4 shadow-[0_0_30px_rgba(34,197,94,0.5)]">
                   <CheckCircle className="w-16 h-16 text-white" />
                </div>
             )}
             {scanResult === 'used' && (
                <div className="bg-amber-500 rounded-full p-6 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                   <RefreshCw className="w-16 h-16 text-white" />
                </div>
             )}
             {scanResult === 'invalid' && (
                <div className="bg-red-500 rounded-full p-6 mb-4 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                   <XCircle className="w-16 h-16 text-white" />
                </div>
             )}

             <h2 className="text-3xl font-bold mb-2 capitalize">{scanResult} Ticket</h2>
             <p className="text-white/70 text-lg mb-8">{lastScanned}</p>
             
             <button 
               onClick={resetScan}
               className="w-full max-w-xs bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors"
             >
               Scan Next
             </button>
           </div>
        )}
      </div>
    </div>
  );
};