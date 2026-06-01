import React, { useState, useEffect, useCallback } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { JarScreen } from './components/JarScreen';
import { LoginModal } from './components/LoginModal';
import { CreateJarModal } from './components/CreateJarModal';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface JarData {
  _id: string;
  title?: string;
  message: string;
  isPublic: boolean;
  owner: { name: string; avatar: string };
  createdAt: string;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'jar'>('home');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedJar, setSelectedJar] = useState<JarData | null>(null);
  const [newJar, setNewJar] = useState<JarData | null>(null);
  // Access token lives only in memory — never in localStorage
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => {
    // Persist preference in localStorage
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDark = () => setIsDark(prev => !prev);

  // Refresh the access token using the httpOnly refresh cookie
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // sends the httpOnly cookie
      });
      if (!res.ok) return null;
      const data = await res.json();
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch {
      return null;
    }
  }, []);

  // Fetch the current user profile with a given token
  const fetchUser = useCallback(async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      setUser(data);
    } catch {
      // silently ignore — user stays null
    }
  }, []);

  // On mount: check for ?token= in URL (Google OAuth redirect) or try silent refresh
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    if (tokenFromUrl) {
      // Remove the token from the URL bar without reloading
      window.history.replaceState({}, '', window.location.pathname);
      setAccessToken(tokenFromUrl);
      fetchUser(tokenFromUrl);
    } else {
      // No URL token — try to silently restore the session via refresh cookie
      refreshAccessToken().then((token) => {
        if (token) fetchUser(token);
      });
    }
  }, [fetchUser, refreshAccessToken]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    setUser(null);
    setAccessToken(null);
  };

  return (
    <>
      {currentScreen === 'home' && (
        <HomeScreen
          onNavigateToJar={() => setCurrentScreen('jar')}
          onSelectJar={(jar) => { setSelectedJar(jar); setCurrentScreen('jar'); }}
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenCreate={() => setIsCreateOpen(true)}
          user={user}
          onLogout={handleLogout}
          isDark={isDark}
          onToggleDark={toggleDark}
          newJar={newJar}
          onNewJarConsumed={() => setNewJar(null)}
        />
      )}

      {currentScreen === 'jar' && (
        <JarScreen
          onBack={() => { setCurrentScreen('home'); setSelectedJar(null); }}
          onOpenCreate={() => setIsCreateOpen(true)}
          isDark={isDark}
          jar={selectedJar}
        />
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <CreateJarModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        accessToken={accessToken}
        user={user}
        onOpenLogin={() => { setIsCreateOpen(false); setIsLoginOpen(true); }}
        onJarCreated={(jar) => { setIsCreateOpen(false); setNewJar(jar); }}
      />
    </>
  );
}

