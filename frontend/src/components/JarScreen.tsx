import React, { useRef } from 'react';
import { PhysicsWorkspace, PhysicsWorkspaceRef } from './PhysicsWorkspace';
import { JarData } from '../App';

interface Props {
  onBack: () => void;
  onOpenCreate: () => void;
  isDark?: boolean;
  jar: JarData | null;
}

export function JarScreen({ onBack, isDark = false, jar }: Props) {
  const physicsRef = useRef<PhysicsWorkspaceRef>(null);

  const displayMessage = jar?.message
    ?? "I have always loved the way you smile, the way you laugh, and every little thing about you. You mean the world to me. You are my sunshine.";

  return (
    <div className="h-screen w-full flex flex-col justify-between p-6 md:p-10 relative bg-surface overflow-hidden">
      <PhysicsWorkspace ref={physicsRef} defaultText={displayMessage} isDark={isDark} />

      {/* Top App Bar */}
      <header className="flex justify-between items-start w-full z-30 pointer-events-none">
        <div className="flex flex-col pointer-events-auto">
          <button onClick={onBack} className="text-xl font-pixel text-primary hover:underline transition-all tracking-widest mb-1 text-left font-bold">
            &larr; Back to Jars
          </button>
          {/* Title pill — shown when title exists, otherwise author label */}
          {jar?.title ? (
            <span className="inline-block font-pixel text-xs bg-on-surface/10 text-on-surface px-3 py-1 rounded-full mt-1 max-w-[220px] truncate">
              {jar.title}
            </span>
          ) : jar?.owner ? (
            <div className="flex items-center gap-2 mt-1">
              {jar.owner.avatar && (
                <img src={jar.owner.avatar} alt={jar.owner.name} className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
              )}
              <span className="font-pixel text-on-surface-variant text-xs tracking-wider">{jar.owner.name}'s jar</span>
            </div>
          ) : null}
          {jar?.createdAt && (
            <span className="font-pixel text-on-surface-variant/60 text-[10px] tracking-wider mt-1 block">
              {new Date(jar.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
        </div>
      </header>

      {/* Bottom hint */}
      <footer className="absolute bottom-6 w-full flex flex-col justify-center items-center z-30 pointer-events-none">
        <div className="text-[12px] md:text-sm font-pixel text-on-surface-variant font-bold border-t border-on-surface/10 pt-4 w-full text-center max-w-md bg-surface/50 backdrop-blur-sm rounded-lg p-2">
          Press ENTER to let it fall &bull; Press ESC to put it back
        </div>
      </footer>
    </div>
  );
}
