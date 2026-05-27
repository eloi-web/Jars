import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateJarModal({ isOpen, onClose }: Props) {
  const [jarName, setJarName] = useState('');
  const [initialMessage, setInitialMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app this would save. For now just close.
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface border-4 border-primary shadow-[8px_8px_0_0_rgba(33,33,33,1)] w-full max-w-md p-6 flex flex-col gap-6 relative animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-primary hover:text-accent transition-colors">
          <X size={24} />
        </button>
        <h2 className="font-display text-2xl font-bold text-primary border-b-4 border-primary pb-2 uppercase text-center md:text-left">New Jar</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-primary font-bold text-sm uppercase tracking-wider">&gt; Jar_Name</label>
            <input
              type="text"
              required
              value={jarName}
              onChange={e => setJarName(e.target.value)}
              placeholder="e.g. Midnight Thoughts"
              className="w-full p-3 bg-surface border-2 border-primary focus:border-4 focus:ring-0 focus:outline-none font-body text-lg"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-mono text-primary font-bold text-sm uppercase tracking-wider">&gt; Initial_Message</label>
            <textarea
              rows={3}
              value={initialMessage}
              onChange={e => setInitialMessage(e.target.value)}
              placeholder="Drop the first message in..."
              className="w-full p-3 bg-surface border-2 border-primary focus:border-4 focus:ring-0 focus:outline-none font-body text-lg resize-none"
            />
          </div>
          
          <button
            type="submit"
            className="mt-2 w-full py-4 bg-primary text-on-primary font-mono font-bold tracking-widest uppercase hover:bg-inverse-surface transition-transform active:translate-y-1 active:translate-x-1 hover:shadow-none"
          >
            Create & Deploy
          </button>
        </form>
      </div>
    </div>
  );
}
