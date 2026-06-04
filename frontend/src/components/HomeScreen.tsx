import React, { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { HomePhysicsWorkspace } from './HomePhysicsWorkspace';
import { User, JarData } from '../App';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

interface Props {
  onNavigateToJar: () => void;
  onSelectJar: (jar: JarData) => void;
  onOpenLogin: () => void;
  onOpenCreate: () => void;
  user: User | null;
  onLogout: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  newJar: JarData | null;
  onNewJarConsumed: () => void;
}

export function HomeScreen({ onNavigateToJar, onSelectJar, onOpenLogin, onOpenCreate, user, onLogout, isDark, onToggleDark, newJar, onNewJarConsumed }: Props) {
  const [jars, setJars] = useState<JarData[]>([]);
  const [goldJarId, setGoldJarId] = useState<string | null>(null);
  const goldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/jars`)
      .then(r => r.json())
      .then(data => setJars(Array.isArray(data) ? data : []))
      .catch(err => console.error('[HomeScreen] jars fetch error:', err));
  }, []);

  // Prepend a newly created jar and flash it gold for 5 s
  useEffect(() => {
    if (!newJar) return;
    setJars(prev => prev.some(j => j._id === newJar._id) ? prev : [newJar, ...prev]);
    setGoldJarId(newJar._id);
    onNewJarConsumed();
    if (goldTimerRef.current) clearTimeout(goldTimerRef.current);
    goldTimerRef.current = setTimeout(() => setGoldJarId(null), 5000);
  }, [newJar, onNewJarConsumed]);

  useEffect(() => () => { if (goldTimerRef.current) clearTimeout(goldTimerRef.current); }, []);

  return (
    <div className="h-screen w-full relative bg-surface overflow-hidden flex flex-col">
      <HomePhysicsWorkspace jars={jars} onSelectJar={onSelectJar} goldJarId={goldJarId} />

      {/* ── Header ── */}
      <header className="z-10 flex justify-end items-center w-full px-6 md:px-10 py-6 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3 bg-surface/85 backdrop-blur-md rounded-full px-4 py-2 shadow-sm border border-on-surface/10">
          <span className="font-pixel text-on-surface-variant text-sm tracking-widest hidden sm:inline">just a jar</span>

          <button
            onClick={onToggleDark}
            aria-label="Toggle dark mode"
            className="text-on-surface-variant hover:text-on-surface transition-all duration-200 p-1 rounded-full hover:rotate-[20deg] active:scale-90"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <span className="w-px h-4 bg-on-surface/20 rounded-full" />

          {user ? (
            <div className="flex items-center gap-2">
              {user.avatar && (
                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
              )}
              <span className="font-pixel text-on-surface text-sm font-bold max-w-[120px] truncate">{user.name}</span>
              <button
                onClick={onLogout}
                className="font-pixel text-on-surface-variant hover:text-on-surface text-xs underline underline-offset-2 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="font-pixel text-on-surface font-bold text-base hover:[animation:jiggle_0.4s_ease-in-out] active:scale-95 transition-transform duration-150"
            >
              Login
            </button>
          )}
        </div>
      </header>

      {/* ── Hero center ── */}
      <main className="z-10 absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-24">
        <div className="relative flex flex-col items-center group">
          <div className="absolute -inset-x-24 -inset-y-16 bg-surface opacity-75 blur-3xl rounded-full pointer-events-none" />
          <img
            src="/jar-hero.png"
            alt="Text Jar"
            className="hero-jar relative w-37.5 md:w-45 lg:w-50 object-contain select-none mb-4 animate-wiggle pointer-events-auto cursor-default transition-[filter] duration-300"
            draggable="false"
          />
          <button
            onClick={onOpenCreate}
            className="relative pointer-events-auto bg-primary text-surface font-pixel text-xl md:text-2xl px-6 py-2 rounded-md shadow-lg hover:shadow-xl hover:[animation:jiggle_0.4s_ease-in-out] active:scale-95 transition-shadow duration-150 z-20"
          >
            Create a Jar
          </button>
        </div>
      </main>
    </div>
  );
}
