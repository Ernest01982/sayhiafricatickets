import React from 'react';
import { DollarSign, Save, Smartphone, Server, Globe } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Configuration</h1>
        <p className="text-slate-500">Manage global service fees, margins, and API costs.</p>
      </div>

      {/* Pricing Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2 bg-green-100 rounded-lg text-green-600">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Global Pricing & Fees</h2>
            <p className="text-sm text-slate-500">These defaults apply to all new events unless overridden.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Platform Service Fee (%)</label>
              <div className="relative">
                  <input type="number" defaultValue="5.0" className="w-full px-4 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono" />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-bold">%</span>
                  </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Percentage taken from gross ticket sales.</p>
           </div>

           <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fixed Fee per Ticket (R)</label>
              <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400 font-bold">R</span>
                  </div>
                  <input type="number" defaultValue="5.00" className="w-full px-4 py-2 pl-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono" />
              </div>
              <p className="text-xs text-slate-500 mt-2">Additional flat fee per ticket sold.</p>
           </div>
        </div>
      </div>

      {/* API Cost Management */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
             <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">WhatsApp & AI Costs</h2>
            <p className="text-sm text-slate-500">Set the internal cost basis for promoter billing.</p>
          </div>
        </div>

        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Utility Message Cost</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">R</span>
                        <input type="number" defaultValue="0.00" className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg bg-slate-50" />
                    </div>
                    <span className="text-xs text-green-600 font-medium mt-1 inline-block">Currently Free (24hr window)</span>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Marketing Message Cost</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">R</span>
                        <input type="number" defaultValue="0.45" className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg" />
                    </div>
                    <span className="text-xs text-slate-500 mt-1 inline-block">Standard rate per template msg</span>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">AI Agent Interaction</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">R</span>
                        <input type="number" defaultValue="0.15" className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg" />
                    </div>
                    <span className="text-xs text-slate-500 mt-1 inline-block">Est. cost per turn</span>
                </div>
            </div>
        </div>
      </div>

      {/* System & Maintenance */}
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
           <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
             <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">System Controls</h2>
          </div>
        </div>
        
        <div className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
            <div>
                <p className="font-medium text-slate-900">Maintenance Mode</p>
                <p className="text-sm text-slate-500">Suspend all ticket sales and promoter logins.</p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 bg-slate-200">
                <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
        </div>
         <div className="flex items-center justify-between py-3">
            <div>
                <p className="font-medium text-slate-900">Public Discovery</p>
                <p className="text-sm text-slate-500">Allow WhatsApp bot to list public events globally.</p>
            </div>
            <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 bg-green-500">
                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
            </button>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="flex items-center bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-slate-200 transition-all active:scale-95">
            <Save className="w-5 h-5 mr-2" />
            Save Global Configuration
        </button>
      </div>
    </div>
  );
};