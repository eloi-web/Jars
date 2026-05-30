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

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'jar'>('home');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  // Access token lives only in memory — never in localStorage
  const [accessToken, setAccessToken] = useState<string | null>(null);

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
          onOpenLogin={() => setIsLoginOpen(true)}
          onOpenCreate={() => setIsCreateOpen(true)}
          user={user}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === 'jar' && (
        <JarScreen
          onBack={() => setCurrentScreen('home')}
          onOpenCreate={() => setIsCreateOpen(true)}
        />
      )}

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <CreateJarModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
}

