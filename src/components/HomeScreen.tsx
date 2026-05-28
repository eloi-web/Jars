import React from 'react';
import { HomePhysicsWorkspace } from './HomePhysicsWorkspace';

interface Props {
  onNavigateToJar: () => void;
  onOpenLogin: () => void;
  onOpenCreate: () => void;
}

export function HomeScreen({ onNavigateToJar, onOpenLogin, onOpenCreate }: Props) {
  return (
    <div className="h-screen w-full relative bg-surface overflow-hidden flex flex-col">
      <HomePhysicsWorkspace onJarClick={onNavigateToJar} />

      <header className="z-10 flex justify-end items-center w-full px-6 md:px-10 py-6 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-end">
          <span className="font-pixel text-on-surface-variant text-sm md:text-base tracking-widest mb-1">just a jar</span>
          <button
            onClick={onOpenLogin}
            className="font-pixel text-primary hover:underline underline-offset-4 text-xl md:text-2xl font-bold"
          >
            Login
          </button>
        </div>
      </header>

      <main className="z-10 absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
        <div className="relative flex flex-col items-center group">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLsOQwV_Y13GK0aAL-lQo2WQjVthe5AmnlzLBQIW0UlPPr6uQtMWbNBJturS--CfNiNSkcWszuR9ThNS21RzeMIgVWxCkRAve7iOoEqLkTMnys5ZdlbkeEPK5XN04ahzUQrqnX72cEGchwvqzlDE-KXJnrqd7vRl7x7QY40g6oqvNRfDelK76yk7A5vJ-AXu-JsEIRH-4mqHKfDAZq6p7o-Bljeu9trHYp28Y_hxBBBZVQsknu4gbctLdGFeXZLCPdOO86FX9BV_Nd"
            alt="Text Jar"
            className="w-[150px] md:w-[180px] lg:w-[200px] object-contain select-none mb-4 animate-wiggle pointer-events-auto cursor-default"
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
