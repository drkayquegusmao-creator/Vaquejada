
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
import ForgotPasswordView from './views/ForgotPasswordView';
import Navbar from './components/Navbar';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(() => {
    const savedView = sessionStorage.getItem('arena_last_view');
    return (savedView as View) || View.EVENTS;
  });
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setInitializing(false);
        // If not logged in and not on login/signup/forgot, go to login
        if (![View.LOGIN, View.SIGNUP, View.FORGOT_PASSWORD].includes(currentView)) {
          setCurrentView(View.LOGIN);
        }
      }
    });

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        if (event === 'SIGNED_OUT') {
           setCurrentView(View.LOGIN);
        }
      }

      // Handle Password Recovery Hash
      if (event === 'PASSWORD_RECOVERY') {
         setCurrentView(View.FORGOT_PASSWORD);
      }
    });

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleNav = (e: any) => {
      const view = e.detail?.view || currentView;
      const username = e.detail?.username ?? null;
      
      setCurrentView(view);
      if (username !== undefined) {
          setProfileUsername(username);
      }

      // Add to history
      const stateObj = { view, username };
      if (username) {
          window.history.pushState(stateObj, '', `/perfil/${username}`);
      } else if (view === View.PROFILE) {
          window.history.pushState(stateObj, '', `/perfil`);
      } else {
          window.history.pushState(stateObj, '', `/`);
      }
    };

    const handlePopState = (e: PopStateEvent) => {
        if (e.state) {
            setCurrentView(e.state.view);
            setProfileUsername(e.state.username);
        } else {
            // Fallback parsing
            const path = window.location.pathname;
            if (path.startsWith('/perfil/')) {
                const parts = path.split('/perfil/');
                setProfileUsername(parts[1] || null);
                setCurrentView(View.PROFILE);
            } else if (path === '/perfil' || path === '/meu-perfil') {
                setProfileUsername(null);
                setCurrentView(View.PROFILE);
            } else {
                setCurrentView(View.SOCIAL); // default fallback
            }
        }
    };

    window.addEventListener('arena_navigate', handleNav);
    window.addEventListener('popstate', handlePopState);
    
    // Also handle initial load path and save initial state
    const path = window.location.pathname;
    let initialView = currentView;
    let initialUser = null;

    if (path.startsWith('/perfil/')) {
        const parts = path.split('/perfil/');
        if (parts[1]) {
            initialUser = parts[1];
            initialView = View.PROFILE;
        }
    } else if (path === '/perfil' || path === '/meu-perfil') {
        initialUser = null;
        initialView = View.PROFILE;
    }
    
    setProfileUsername(initialUser);
    setCurrentView(initialView);
    window.history.replaceState({ view: initialView, username: initialUser }, '', path);

    return () => {
        window.removeEventListener('arena_navigate', handleNav);
        window.removeEventListener('popstate', handlePopState);
    };
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
        return <LoginView onLogin={handleAuthSuccess} onSignUp={() => setCurrentView(View.SIGNUP)} onForgotPassword={() => setCurrentView(View.FORGOT_PASSWORD)} />;
      case View.SIGNUP:
        return <SignUpView onBack={() => setCurrentView(View.LOGIN)} onSuccess={handleAuthSuccess} />;
      case View.NEWS:
        return <NewsView user={user} />;
      case View.EVENTS:
        return <EventsView />;
      case View.SOCIAL:
        return <SocialFeedView user={user} onMediaCreation={() => setCurrentView(View.MEDIA_CREATION)} />;
      case View.MERCADO:
        return <MarketView />;
      case View.PROFILE:
        return <ProfileView user={user} targetUsername={profileUsername} onLogout={handleLogout} onAdminView={() => setCurrentView(View.ADMIN)} onSettingsView={() => setCurrentView(View.SETTINGS)} />;
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
      case View.FORGOT_PASSWORD:
        return <ForgotPasswordView onBack={() => setCurrentView(View.LOGIN)} />;
      default:
        return <EventsView />;
    }
  };

  const showNavbar = ![View.LOGIN, View.SIGNUP].includes(currentView);

  return (
    <div className="min-h-screen flex flex-col bg-background-dark overflow-hidden">
      {/* App Container */}
      <div className="relative w-full h-screen bg-background-dark overflow-hidden flex flex-col">
        
        {/* View Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar relative">
          <div className="max-w-7xl mx-auto w-full h-full">
            {renderView()}
          </div>
        </div>

        {/* Bottom Navigation */}
        {showNavbar && (
          <Navbar currentView={currentView} onViewChange={setCurrentView} />
        )}
      </div>
    </div>
  );
};

export default App;
