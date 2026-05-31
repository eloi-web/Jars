import React, { useRef } from 'react';
import { PhysicsWorkspace, PhysicsWorkspaceRef } from './PhysicsWorkspace';

interface Props {
  onBack: () => void;
  onOpenCreate: () => void;
}

export function JarScreen({ onBack }: Props) {
  const physicsRef = useRef<PhysicsWorkspaceRef>(null);

  // Example text message passed inside - static upon entry
  const displayMessage = "I have always loved the way you smile, the way you laugh, and every little thing about you. You mean the world to me. You are my sunshine.";

  return (
    <div className="h-screen w-full flex flex-col justify-between p-6 md:p-10 relative bg-surface overflow-hidden">
      {/* Physics Canvas Background */}
      <PhysicsWorkspace ref={physicsRef} defaultText={displayMessage} />

      {/* Top App Bar */}
      <header className="flex justify-between items-start w-full z-30 pointer-events-none">
        <div className="flex flex-col pointer-events-auto">
          <button onClick={onBack} className="text-xl font-pixel text-primary hover:underline transition-all tracking-widest mb-1 text-left font-bold">
            &larr; Back to Jars
          </button>
        </div>
      </header>

      {/* Bottom Footer Area */}
      <footer className="absolute bottom-6 w-full flex flex-col justify-center items-center z-30 pointer-events-none">
        <div className="text-[12px] md:text-sm font-pixel text-on-surface-variant font-bold border-t border-outline-variant/30 pt-4 w-full text-center max-w-md bg-surface/50 backdrop-blur-sm rounded-lg p-2">
          Press ENTER to let it fall &bull; Press ESC to put it back
        </div>
      </footer>
    </div>
  );
}
