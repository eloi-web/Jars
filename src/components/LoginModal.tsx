import React from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl w-full max-w-md p-8 shadow-xl relative animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-display text-primary">Welcome back</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold font-mono text-primary mb-1 uppercase tracking-wider">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full border-2 border-outline-variant bg-surface rounded-lg px-4 py-2 font-body focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-bold font-mono text-primary mb-1 uppercase tracking-wider">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full border-2 border-outline-variant bg-surface rounded-lg px-4 py-2 font-body focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>
          <button className="w-full bg-[#212121] text-white font-pixel font-bold uppercase tracking-widest rounded py-3 text-lg hover:bg-black transition-colors mt-2 active:scale-95">
            Log in
          </button>

          <div className="relative flex items-center py-4">
            <div className="grow border-t-2 border-outline-variant"></div>
            <span className="shrink-0 mx-4 text-on-surface-variant text-sm font-pixel font-bold uppercase">or</span>
            <div className="grow border-t-2 border-outline-variant"></div>
          </div>

          <button className="w-full border-2 border-outline-variant text-[#212121] bg-surface rounded py-3 font-pixel font-bold uppercase text-lg tracking-widest hover:bg-surface-container transition-colors flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm font-body text-on-surface-variant mt-4">
            Don't have an account? <button className="text-primary font-bold hover:underline">Register</button>
          </p>
        </div>
      </div>
    </div>
  );
}
