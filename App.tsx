
import React, { useState, useEffect } from 'react';
import { View, User } from './types';
import LoginView from './views/LoginView';
import SignUpView from './views/SignUpView';
import NewsView from './views/NewsView';
import EventsView from './views/EventsView';
import SocialFeedView from './views/SocialFeedView';
import MarketView from './views/MarketView';
import ProfileView from './views/ProfileView';
import AdminView from './views/AdminView';
import MediaCreationView from './views/MediaCreationView';
import SettingsView from './views/SettingsView';
import Navbar from './components/Navbar';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(() => {
    const savedView = sessionStorage.getItem('arena_last_view');
    return (savedView as View) || View.LOGIN;
  });
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setInitializing(false);
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentView(View.LOGIN);
      } else if (event === 'INITIAL_SESSION' && !session) {
        setInitializing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (currentView !== View.LOGIN && currentView !== View.SIGNUP) {
      sessionStorage.setItem('arena_last_view', currentView);
    }
  }, [currentView]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profile) {
        const mappedUser: User = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.whatsapp,
          state_id: profile.state_id,
          city_id: profile.city_id,
          type: 'common', // Default or from role
          role: profile.role === 'ADMIN_MASTER' ? 'ADMIN' : 'USER',
          permissions: profile.can_add_event ? ['organize_event'] : [],
          trustLevel: 'normal',
          blocked: false,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          createdAt: profile.created_at,
        };
        setUser(mappedUser);
        if (currentView === View.LOGIN || currentView === View.SIGNUP) {
          const savedView = sessionStorage.getItem('arena_last_view');
          setCurrentView((savedView as View) || View.EVENTS);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setInitializing(false);
    }
  };

  const handleAuthSuccess = (userData: any) => {
    // This is called from Login/Signup views
    // fetchProfile will handle it via onAuthStateChange, but we can speed it up
    if (userData) {
      const mappedUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.whatsapp,
        state_id: userData.state_id,
        city_id: userData.city_id,
        type: 'common',
        role: userData.role === 'ADMIN_MASTER' ? 'ADMIN' : 'USER',
        permissions: userData.can_add_event ? ['organize_event'] : [],
        trustLevel: 'normal',
        blocked: false,
        avatar_url: userData.avatar_url,
        bio: userData.bio,
        createdAt: userData.created_at,
      };
      setUser(mappedUser);
      setCurrentView(View.EVENTS);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-primary font-black text-2xl animate-pulse tracking-tighter italic">+VAQUEJADA</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    sessionStorage.removeItem('arena_last_view');
    setCurrentView(View.LOGIN);
  };

  const renderView = () => {
    switch (currentView) {
      case View.LOGIN:
        return <LoginView onLogin={handleAuthSuccess} onSignUp={() => setCurrentView(View.SIGNUP)} />;
      case View.SIGNUP:
        return <SignUpView onBack={() => setCurrentView(View.LOGIN)} onSuccess={handleAuthSuccess} />;
      case View.NEWS:
        return <NewsView />;
      case View.EVENTS:
        return <EventsView />;
      case View.SOCIAL:
        return <SocialFeedView onMediaCreation={() => setCurrentView(View.MEDIA_CREATION)} />;
      case View.MERCADO:
        return <MarketView />;
      case View.PROFILE:
        return <ProfileView user={user} onLogout={handleLogout} onAdminView={() => setCurrentView(View.ADMIN)} onSettingsView={() => setCurrentView(View.SETTINGS)} />;
      case View.ADMIN:
        return <AdminView />;
      case View.MEDIA_CREATION:
        return (
          <MediaCreationView
            user={user}
            onClose={() => setCurrentView(View.SOCIAL)}
            onSuccess={() => {
              setCurrentView(View.SOCIAL);
              alert('Publicado com sucesso!');
            }}
          />
        );
      case View.SETTINGS:
        return (
          <SettingsView
            user={user}
            onBack={() => setCurrentView(View.PROFILE)}
            onLogout={handleLogout}
          />
        );
      default:
        return <EventsView />;
    }
  };

  const showNavbar = ![View.LOGIN, View.SIGNUP].includes(currentView);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-dark overflow-hidden">
      {/* Mobile Simulator Frame */}
      <div className="relative w-full max-w-[430px] h-[932px] bg-background-dark shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col">
        {/* iOS Status Bar */}
        <div className="h-11 w-full bg-transparent flex justify-between items-center px-6 shrink-0 z-50">
          <span className="text-sm font-bold text-white">9:41</span>
          <div className="flex gap-1 items-center">
            <span className="material-icons text-xs">signal_cellular_alt</span>
            <span className="material-icons text-xs">wifi</span>
            <span className="material-icons text-xs">battery_full</span>
          </div>
        </div>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar relative">
          {renderView()}
        </div>

        {/* Bottom Navigation */}
        {showNavbar && (
          <Navbar currentView={currentView} onViewChange={setCurrentView} />
        )}

        {/* iOS Home Indicator */}
        <div className="h-8 w-full bg-transparent flex justify-center items-end pb-2 shrink-0">
          <div className="w-32 h-1 bg-white/20 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default App;
