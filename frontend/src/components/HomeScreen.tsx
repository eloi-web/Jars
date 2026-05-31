import React from 'react';
import { HomePhysicsWorkspace } from './HomePhysicsWorkspace';
import { User } from '../App';

interface Props {
  onNavigateToJar: () => void;
  onOpenLogin: () => void;
  onOpenCreate: () => void;
  user: User | null;
  onLogout: () => void;
}

export function HomeScreen({ onNavigateToJar, onOpenLogin, onOpenCreate, user, onLogout }: Props) {
  return (
    <div className="h-screen w-full relative bg-surface overflow-hidden flex flex-col">
      <HomePhysicsWorkspace onJarClick={onNavigateToJar} />

      <header className="z-10 flex justify-end items-center w-full px-6 md:px-10 py-6 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-end">
          <span className="font-pixel text-on-surface-variant text-sm md:text-base tracking-widest mb-1">just a jar</span>
          {user ? (
            <div className="flex items-center gap-3">
              {user.avatar && (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
              )}
              <span className="font-pixel text-primary text-base font-bold">{user.name}</span>
              <button
                onClick={onLogout}
                className="font-pixel text-on-surface-variant hover:text-primary underline underline-offset-4 text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="font-pixel text-primary hover:underline underline-offset-4 text-xl md:text-2xl font-bold"
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
            className="pointer-events-auto bg-[#212121] text-white font-pixel text-xl md:text-2xl px-6 py-2 rounded-md hover:scale-105 hover:bg-black transition-all shadow-lg z-20"
          >
            Create a Jar
          </button>
        </div>
      </main>
    </div>
  );
}
