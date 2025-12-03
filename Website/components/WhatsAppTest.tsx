import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, ArrowLeft, Check, CheckCircle, Smile, Paperclip, Mic, Loader2, AlertCircle } from 'lucide-react';
import { processUserMessage } from '../services/chatBot';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  time: string;
  status: 'sent' | 'delivered' | 'read';
}

export const WhatsAppTest: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const updateMessageStatus = (messageId: string, status: Message['status']) => {
    setMessages(prev =>
      prev.map(msg => (msg.id === messageId ? { ...msg, status } : msg))
    );
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    if (isTyping) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);
    setConnectionError(null);

    try {
      const botResponseText = await processUserMessage(newMessage.text);
      updateMessageStatus(newMessage.id, 'read');

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error: any) {
      const fallbackText = error?.message || "Error connecting to AI Agent.";
      setConnectionError(fallbackText);
      updateMessageStatus(newMessage.id, 'sent');

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: fallbackText,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      {/* Phone Container */}
      <div className="w-full max-w-md h-[85vh] bg-[#0b141a] rounded-[40px] shadow-2xl border-[12px] border-slate-900 overflow-hidden relative flex flex-col">
        
        {/* Status Bar */}
        <div className="h-6 bg-[#202c33] flex justify-between items-center px-6 pt-2 pb-1">
             <span className="text-xs text-white font-medium">12:30</span>
             <div className="flex gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                 <div className="w-3 h-3 rounded-full bg-slate-600"></div>
             </div>
        </div>

        {/* WhatsApp Header */}
        <div className="bg-[#202c33] p-2 px-3 flex items-center gap-3 z-20 shadow-md cursor-default">
           <ArrowLeft className="w-5 h-5 text-[#aebac1] cursor-pointer" />
           <div className="flex items-center flex-1 gap-3">
               <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-lg relative">
                   👋
                   <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 border-2 border-[#202c33] rounded-full p-[1px]">
                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                   </div>
               </div>
               <div className="flex-1">
                   <h3 className="text-white font-medium text-base leading-tight flex items-center gap-1">
                       Say HI Africa
                       <CheckCircle className="w-3 h-3 text-green-500 fill-green-500" />
                   </h3>
                   <p className="text-xs text-[#8696a0]">Official Business Account</p>
               </div>
           </div>
           <div className="flex items-center gap-5 text-[#aebac1]">
               <Video className="w-5 h-5" />
               <Phone className="w-5 h-5" />
               <MoreVertical className="w-5 h-5" />
           </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-90 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-600">
          {connectionError && (
            <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 text-red-100 text-xs px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>{connectionError}</span>
            </div>
          )}
           {/* Encryption Notice */}
           <div className="flex justify-center mb-4">
               <div className="bg-[#182229] px-3 py-1.5 rounded-lg text-[#8696a0] text-[10px] text-center shadow-sm max-w-[90%] leading-tight">
                   Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
               </div>
           </div>

           {/* Business Info Notice */}
           <div className="flex justify-center mb-8">
               <div className="bg-[#182229] px-3 py-2 rounded-lg text-[#8696a0] text-[10px] text-center shadow-sm max-w-[90%] leading-tight border border-[#2a3942]">
                   This business uses a secure service from Meta to manage this chat. Tap to learn more.
               </div>
           </div>

           {messages.length === 0 && (
             <div className="text-center mt-12">
                 <div className="inline-block p-4 rounded-full bg-[#202c33] mb-3">
                    <span className="text-2xl">👋</span>
                 </div>
                 <p className="text-[#8696a0] text-sm">Say "Hi" to start chatting.</p>
                 <p className="text-[#8696a0] text-xs mt-2 opacity-60">Try asking: "What events do you have?"</p>
             </div>
           )}

           {messages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div 
                        className={`max-w-[80%] rounded-lg p-2 px-3 shadow-sm text-[14.2px] leading-5 relative
                        ${msg.sender === 'user' ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-none' : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'}`}
                   >
                       <div className="whitespace-pre-wrap">{msg.text}</div>
                       <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
                           <span className="text-[10px]">{msg.time}</span>
                           {msg.sender === 'user' && (
                               <div className="flex -ml-0.5">
                                   <Check className={`w-3 h-3 ${msg.status === 'read' ? 'text-[#53bdeb]' : 'text-[#8696a0]'}`} />
                                   <Check className={`w-3 h-3 -ml-1.5 ${msg.status === 'read' ? 'text-[#53bdeb]' : 'text-[#8696a0]'}`} />
                               </div>
                           )}
                       </div>
                   </div>
               </div>
           ))}
           {isTyping && (
               <div className="flex justify-start">
                   <div className="bg-[#202c33] rounded-lg p-2 px-4 rounded-tl-none">
                       <div className="flex gap-1">
                           <div className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce"></div>
                           <div className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce delay-100"></div>
                           <div className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce delay-200"></div>
                       </div>
                   </div>
               </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-[#202c33] p-2 px-3 flex items-end gap-2 z-20">
            <div className="bg-[#202c33] p-2 rounded-full cursor-pointer mb-1">
                <Smile className="w-6 h-6 text-[#8696a0]" />
            </div>
            <div className="bg-[#202c33] p-2 rounded-full cursor-pointer mb-1 -ml-2">
               <Paperclip className="w-5 h-5 text-[#8696a0]" />
            </div>
            <div className="flex-1 bg-[#2a3942] rounded-2xl min-h-[42px] flex items-center px-3 py-1.5 mb-1">
                <input 
                    type="text" 
                    className="w-full bg-transparent text-[#d1d7db] placeholder-[#8696a0] focus:outline-none text-[15px]"
                    placeholder="Message"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
            </div>
            <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`p-3 rounded-full mb-1 transition-colors ${(input.trim() && !isTyping) ? 'bg-[#00a884]' : 'bg-[#2a3942]'}`}
            >
                {isTyping ? (
                     <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : input.trim() ? (
                     <Send className="w-5 h-5 text-white" />
                ) : (
                     <Mic className="w-5 h-5 text-[#8696a0]" />
                )}
            </button>
        </div>
      </div>
      
      {/* Desktop Info Box */}
      <div className="absolute bottom-4 right-4 hidden md:block bg-white p-4 rounded-xl shadow-lg max-w-sm border border-slate-200 animate-in slide-in-from-bottom-4">
         <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Simulator Active
         </h3>
         <p className="text-xs text-slate-500 mb-2">
            Connected to <strong>Supabase</strong> and <strong>Gemini</strong> directly from the browser.
         </p>
         <div className="bg-slate-50 p-2 rounded text-xs text-slate-600">
            <strong>Try these commands:</strong>
            <ul className="list-disc pl-4 mt-1 space-y-1">
                <li>"What events do you have?"</li>
                <li>"Do you have tickets for Summer Vibes?"</li>
            </ul>
         </div>
      </div>
    </div>
  );
};
