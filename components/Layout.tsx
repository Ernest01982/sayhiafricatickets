import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  DollarSign, 
  Settings, 
  Users, 
  Menu, 
  X,
  Smartphone,
  ShieldAlert,
  QrCode,
  Globe,
  Lock,
  MessageCircle,
  LogOut
} from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentRole: UserRole;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentRole, 
  activePage,
  onNavigate,
  onLogout
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fullscreen mode for Scanner
  if (activePage === 'scanner') {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        {children}
      </div>
    );
  }

  const promoterLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'My Events', icon: Calendar },
    { id: 'messaging', label: 'Messaging & Ads', icon: MessageSquare },
    { id: 'finance', label: 'Payouts', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks = [
    { id: 'admin-overview', label: 'Platform Stats', icon: LayoutDashboard },
    { id: 'admin-finance', label: 'Global Finance', icon: DollarSign },
    { id: 'admin-users', label: 'User Management', icon: Users },
    { id: 'admin-costs', label: 'System Costs', icon: Smartphone },
    { id: 'admin-risk', label: 'Risk & Fraud', icon: ShieldAlert },
    { id: 'admin-settings', label: 'Global Config', icon: Globe },
    { id: 'whatsapp-sim', label: 'WhatsApp Simulator', icon: MessageCircle },
  ];

  const links = currentRole === UserRole.PROMOTER ? promoterLinks : adminLinks;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 transform bg-slate-900 text-white transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-16 items-center justify-between px-6 font-bold text-xl tracking-tight border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
               <span className="text-white text-lg">👋</span>
            </div>
            <span>Say HI Africa</span>
          </div>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3 flex-1">
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = activePage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigate(link.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    flex w-full items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-green-600 text-white' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  `}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {link.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={`https://ui-avatars.com/api/?name=${currentRole === UserRole.PROMOTER ? 'Promoter' : 'Admin'}&background=random`}
              alt="User" 
              className="h-9 w-9 rounded-full border border-slate-600"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentRole === UserRole.PROMOTER ? 'Promoter Account' : 'Platform Admin'}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {currentRole === UserRole.PROMOTER ? 'promoter@sayhi.africa' : 'admin@sayhi.africa'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => onLogout?.()}
            className="flex w-full items-center justify-center rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm lg:px-8">
          <div className="flex items-center gap-4">
             <button 
                className="lg:hidden text-slate-500 hover:text-slate-700"
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu className="h-6 w-6" />
            </button>
            {currentRole === UserRole.PROMOTER && (
                <div className="hidden md:flex items-center gap-4">
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    WhatsApp Connected
                    </span>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    Payfast Active
                    </span>
                </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('scanner')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">Launch Scanner</span>
              </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
