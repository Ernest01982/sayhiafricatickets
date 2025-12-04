import React, { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { DashboardPromoter } from './components/DashboardPromoter';
import { Events } from './components/Events';
import { EventDetails } from './components/EventDetails';
import { Messaging } from './components/Messaging';
import { AdminOverview } from './components/AdminOverview';
import { AdminFinance } from './components/AdminFinance';
import { PromoterFinance } from './components/PromoterFinance';
import { AdminUsers } from './components/AdminUsers';
import { AdminSystemCosts } from './components/AdminSystemCosts';
import { AdminSettings } from './components/AdminSettings';
import { AdminRisk } from './components/AdminRisk';
import { Settings } from './components/Settings';
import { Scanner } from './components/Scanner';
import { LegalDocs } from './components/LegalDocs';
import { EventLiveMonitor } from './components/EventLiveMonitor';
import { PublicEventsPage } from './components/PublicEventsPage';
import { WhatsAppTest } from './components/WhatsAppTest';
import { PricingPage } from './components/PricingPage';
import { PaymentPage } from './components/PaymentPage';
import { UserRole } from './types';
import { supabase } from './services/supabaseClient';

type AppView = 'landing' | 'login' | 'dashboard' | 'legal-terms' | 'legal-privacy' | 'public-events' | 'pricing' | 'pay';

const App: React.FC = () => {
  // Auth & Navigation State
  const [view, setView] = useState<AppView>('landing');
  const [role, setRole] = useState<UserRole>(UserRole.PROMOTER);
  
  // Dashboard Navigation State
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Deep link handler for /pay checkout route
  useEffect(() => {
    if (window.location.pathname === '/pay') {
      setView('pay');
    }
  }, []);

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setView('dashboard');
    // Reset dashboard state on new login
    setActivePage(selectedRole === UserRole.PROMOTER ? 'dashboard' : 'admin-overview');
    setSelectedEventId(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('landing');
    setRole(UserRole.PROMOTER);
    setActivePage('dashboard');
  };

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setActivePage('event-details');
  };

  const handleBackToEvents = () => {
    setSelectedEventId(null);
    setActivePage('events');
  };

  // Render specific views
  if (view === 'landing') {
    return (
      <LandingPage 
        onLoginClick={() => setView('login')} 
        onNavigateToLegal={(doc) => setView(doc === 'terms' ? 'legal-terms' : 'legal-privacy')}
        onNavigateToEvents={() => setView('public-events')}
        onNavigateToPricing={() => setView('pricing')}
      />
    );
  }

  if (view === 'public-events') {
    return <PublicEventsPage onBack={() => setView('landing')} />;
  }

  if (view === 'pricing') {
    return <PricingPage onBack={() => setView('landing')} onGetStarted={() => setView('login')} />;
  }

  if (view === 'pay') {
    return (
      <PaymentPage
        onBack={() => {
          window.history.pushState({}, '', '/');
          setView('landing');
        }}
      />
    );
  }

  if (view === 'legal-terms') {
    return <LegalDocs initialTab="terms" onBack={() => setView('landing')} />;
  }

  if (view === 'legal-privacy') {
    return <LegalDocs initialTab="privacy" onBack={() => setView('landing')} />;
  }

  if (view === 'login') {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        onBack={() => setView('landing')} 
        onNavigateToLegal={(doc) => setView(doc === 'terms' ? 'legal-terms' : 'legal-privacy')}
      />
    );
  }

  // Main Dashboard Logic
  const renderContent = () => {
    // Fullscreen Scanner Mode
    if (activePage === 'scanner') {
      return <Scanner onExit={() => {
        // If we came from an event, go back to it, otherwise dashboard
        if (selectedEventId) {
           setActivePage('event-details');
        } else {
           setActivePage('dashboard');
        }
      }} />;
    }

    // Fullscreen Live Monitor Mode
    if (activePage === 'event-live' && selectedEventId) {
      return <EventLiveMonitor eventId={selectedEventId} onBack={() => setActivePage('event-details')} />;
    }

    // Admin Views
    if (role === UserRole.ADMIN) {
      switch (activePage) {
        case 'admin-overview':
          return <AdminOverview />;
        case 'admin-finance':
          return <AdminFinance />;
        case 'admin-users':
          return <AdminUsers />;
        case 'admin-costs':
          return <AdminSystemCosts />;
        case 'admin-settings':
          return <AdminSettings />;
        case 'admin-risk':
          return <AdminRisk />;
        case 'whatsapp-sim':
          return <WhatsAppTest />;
        default:
          return <AdminOverview />;
      }
    }

    // Promoter Views
    // Special case for nested Event Details view
    if (activePage === 'event-details' && selectedEventId) {
        return <EventDetails 
          eventId={selectedEventId} 
          onBack={handleBackToEvents} 
          onLaunchScanner={() => setActivePage('scanner')}
          onLaunchLive={() => setActivePage('event-live')}
        />;
    }

    switch (activePage) {
      case 'dashboard':
        return <DashboardPromoter />;
      case 'events':
        return <Events onSelectEvent={handleSelectEvent} />;
      case 'messaging':
        return <Messaging />;
      case 'finance':
        return <PromoterFinance />;
      case 'settings':
        return <Settings />;
      default:
        return <DashboardPromoter />;
    }
  };

  return (
    <Layout 
      currentRole={role} 
      activePage={activePage}
      onNavigate={(page) => {
        setActivePage(page);
        if (page !== 'event-details') setSelectedEventId(null);
      }}
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
