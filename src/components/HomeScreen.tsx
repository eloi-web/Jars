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

      <header className="z-10 flex justify-between items-center w-full px-6 md:px-10 py-6 pointer-events-none">
        <div className="flex items-center">
          <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-extrabold text-primary pointer-events-auto cursor-pointer">
            PIXEL JAR
          </h1>
        </div>
        <div className="flex items-center gap-4 md:gap-6 pointer-events-auto">
          <button
            onClick={onOpenLogin}
            className="font-mono text-primary hover:underline underline-offset-4 text-sm md:text-base font-bold"
          >
            Login
          </button>
          <button
            onClick={onOpenCreate}
            className="font-mono text-primary hover:underline underline-offset-4 text-sm md:text-base font-bold"
          >
            Create a Jar
          </button>
        </div>
      </header>

      <main className="z-10 flex-grow flex flex-col items-center justify-center pointer-events-none pb-12">
        <div className="relative flex flex-col items-center">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLsOQwV_Y13GK0aAL-lQo2WQjVthe5AmnlzLBQIW0UlPPr6uQtMWbNBJturS--CfNiNSkcWszuR9ThNS21RzeMIgVWxCkRAve7iOoEqLkTMnys5ZdlbkeEPK5XN04ahzUQrqnX72cEGchwvqzlDE-KXJnrqd7vRl7x7QY40g6oqvNRfDelK76yk7A5vJ-AXu-JsEIRH-4mqHKfDAZq6p7o-Bljeu9trHYp28Y_hxBBBZVQsknu4gbctLdGFeXZLCPdOO86FX9BV_Nd"
            alt="Text Jar"
            className="w-[280px] md:w-[450px] lg:w-[500px] object-contain select-none mb-[-50px] md:mb-[-60px]"
            draggable="false"
          />
          <button
            onClick={onOpenCreate}
            className="pointer-events-auto bg-[#212121] text-on-primary font-body text-base md:text-lg px-8 py-3 rounded hover:bg-inverse-surface transition-colors shadow-lg z-20"
          >
            Create a Jar
          </button>
        </div>
      </main>

      <footer className="z-10 w-full py-6 pointer-events-none">
        <div className="flex justify-center md:justify-end items-center px-6 md:px-10 w-full">
          <span className="font-mono text-xs text-on-surface-variant font-bold tracking-widest uppercase">
            CREDITS TO TEXTJAR.APP
          </span>
        </div>
      </footer>
    </div>
  );
}
