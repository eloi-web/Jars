import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { HomePhysicsWorkspace } from './HomePhysicsWorkspace';
import { User } from '../App';

interface Props {
  onNavigateToJar: () => void;
  onOpenLogin: () => void;
  onOpenCreate: () => void;
  user: User | null;
  onLogout: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export function HomeScreen({ onNavigateToJar, onOpenLogin, onOpenCreate, user, onLogout, isDark, onToggleDark }: Props) {
  return (
    <div className="h-screen w-full relative bg-surface overflow-hidden flex flex-col">
      <HomePhysicsWorkspace onJarClick={onNavigateToJar} />

      <header className="z-10 flex justify-end items-center w-full px-6 md:px-10 py-6 pointer-events-none">
        {/* Frosted pill — always readable no matter what jars are behind it */}
        <div className="pointer-events-auto flex items-center gap-3 bg-surface/85 backdrop-blur-md rounded-full px-4 py-2 shadow-sm border border-on-surface/10">
          <span className="font-pixel text-on-surface-variant text-sm tracking-widest hidden sm:inline">just a jar</span>

          {/* Dark / light toggle */}
          <button
            onClick={onToggleDark}
            aria-label="Toggle dark mode"
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Thin divider */}
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
              className="font-pixel text-on-surface font-bold text-base hover:opacity-70 transition-opacity"
            >
              Login
            </button>
          )}
        </div>
      </header>

      <main className="z-10 absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
        <div className="relative flex flex-col items-center group">
          <img
            src="/jar-hero.png"
            alt="Text Jar"
            className="w-37.5 md:w-45 lg:w-50 object-contain select-none mb-4 animate-wiggle pointer-events-auto cursor-default"
            draggable="false"
          />
          <button
            onClick={onOpenCreate}
            className="pointer-events-auto bg-primary text-surface font-pixel text-xl md:text-2xl px-6 py-2 rounded-md hover:scale-105 transition-all shadow-lg z-20"
          >
            Create a Jar
          </button>
        </div>
      </main>
    </div>
  );
}
