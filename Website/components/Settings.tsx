import React from 'react';
import { User, Building, CreditCard, Users, Mail, Save } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your organization details and team.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <Building className="text-slate-400 w-6 h-6" />
          <h2 className="text-lg font-semibold text-slate-900">Organization Details</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
            <input type="text" defaultValue="SoundWave Events" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
            <input type="email" defaultValue="support@soundwave.com" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Business Number</label>
             <input type="text" defaultValue="+27 82 123 4567" className="w-full px-3 py-2 border border-slate-300 rounded-lg" disabled />
             <p className="text-xs text-slate-500 mt-1">Contact support to change this.</p>
          </div>
          <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
              <input type="text" defaultValue="https://soundwave.com" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
           <button className="flex items-center bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800">
              <Save className="w-4 h-4 mr-2" /> Save Changes
           </button>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Users className="text-slate-400 w-6 h-6" />
            <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
          </div>
          <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">Invite Member</button>
        </div>
        <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">JD</div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">John Doe (You)</p>
                        <p className="text-xs text-slate-500">Owner</p>
                    </div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">SK</div>
                    <div>
                        <p className="text-sm font-medium text-slate-900">Sarah Kline</p>
                        <p className="text-xs text-slate-500">Finance</p>
                    </div>
                </div>
                <button className="text-xs text-slate-400 hover:text-red-600">Remove</button>
            </div>
        </div>
      </div>
    </div>
  );
};