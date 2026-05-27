import React, { useRef, useState, KeyboardEvent, ChangeEvent } from 'react';
import { PhysicsWorkspace, PhysicsWorkspaceRef } from './PhysicsWorkspace';

interface Props {
  onBack: () => void;
  onOpenCreate: () => void;
}

export function JarScreen({ onBack, onOpenCreate }: Props) {
  const physicsRef = useRef<PhysicsWorkspaceRef>(null);
  const [inputValue, setInputValue] = useState('');
  const [showSubmissionUI, setShowSubmissionUI] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.trim() === '') {
      setShowSubmissionUI(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim() !== '') {
        setShowSubmissionUI(true);
      }
    }
  };

  const handlePost = () => {
    if (inputValue.trim() !== '') {
      physicsRef.current?.dropText(inputValue);
      setInputValue('');
      setShowSubmissionUI(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col justify-between p-6 md:p-10 relative bg-surface overflow-hidden">
      {/* Physics Canvas Background */}
      <PhysicsWorkspace ref={physicsRef} />

      {/* Top App Bar */}
      <header className="flex justify-between items-start w-full z-30 pointer-events-none">
        <div className="flex flex-col pointer-events-auto">
          <button onClick={onBack} className="text-sm font-mono text-on-surface-variant hover:text-primary transition-colors tracking-widest mb-1 text-left">
            &larr; jars
          </button>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-primary mt-1">Pixel Jar</h1>
          <p className="text-sm font-mono text-on-surface-variant italic mt-1 max-w-xs leading-relaxed">
            To share how much I love about my man
          </p>
        </div>
        <div className="flex items-center gap-4 pointer-events-auto">
          <button onClick={onOpenCreate} className="font-mono border-2 border-primary bg-surface px-4 py-2 text-primary font-bold hover:bg-primary hover:text-on-primary transition-colors uppercase tracking-widest text-sm shadow-[4px_4px_0_0_rgba(33,33,33,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
            Create Jar
          </button>
          <span className="text-sm font-mono text-on-surface-variant font-bold">22</span>
        </div>
      </header>

      {/* Central Interactive Area */}
      <main className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="flex flex-col items-center gap-6 pointer-events-auto w-full max-w-2xl px-4">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="type here..."
            className="w-full text-center text-3xl md:text-5xl font-body text-primary italic placeholder:text-accent bg-transparent border-none outline-none focus:ring-0"
            autoFocus
          />

          {/* Submission UI Panel */}
          {showSubmissionUI && (
            <div className="flex flex-col items-center gap-4 bg-surface/80 backdrop-blur-md p-6 border-2 border-outline-variant rounded-xl shadow-lg mt-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <input
                  id="anonymous-checkbox"
                  type="checkbox"
                  className="w-5 h-5 text-primary bg-surface border-2 border-outline-variant rounded-sm focus:ring-2 focus:ring-primary focus:ring-offset-2 appearance-none checked:bg-primary checked:border-primary relative
                  after:content-[''] after:absolute after:hidden checked:after:block after:left-[5px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-on-primary after:rotate-45 cursor-pointer"
                />
                <label htmlFor="anonymous-checkbox" className="text-sm font-mono text-on-surface font-bold uppercase tracking-wider cursor-pointer">
                  Post anonymously
                </label>
              </div>
              <button
                onClick={handlePost}
                className="w-full px-8 py-3 bg-primary text-on-primary font-mono font-bold uppercase tracking-widest hover:bg-inverse-surface transition-colors shadow-[4px_4px_0_0_rgba(160,160,160,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                Post
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Footer Area */}
      <footer className="flex flex-col justify-center items-center w-full z-30 pointer-events-none pb-2">
        <div className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-on-surface-variant font-bold border-t border-outline-variant/30 pt-4 w-full text-center max-w-md">
          Inspired by textjar.app &ndash; built for learning.
        </div>
      </footer>
    </div>
  );
}
