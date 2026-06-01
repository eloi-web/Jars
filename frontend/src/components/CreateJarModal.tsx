import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { User } from '../App';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
const MAX_CHARS = 2000;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  user: User | null;
  onOpenLogin: () => void;
}

export function CreateJarModal({ isOpen, onClose, accessToken, user, onOpenLogin }: Props) {
  const [message, setMessage] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const remaining = MAX_CHARS - message.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/jars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message, isPublic }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = data.errors?.[0]?.msg ?? data.error ?? 'Something went wrong.';
        setError(msg);
        return;
      }

      // Success — reset and close
      setMessage('');
      setIsPublic(true);
      onClose();
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200 overflow-hidden border border-on-surface/10">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-on-surface/10">
          <h2 className="font-pixel text-xl font-bold text-on-surface tracking-wide">New Jar</h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-full hover:[animation:jiggle_0.3s_ease-in-out] active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Not logged in */}
          {!user ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <p className="font-body text-on-surface-variant text-sm">
                You need to be signed in to create a jar.
              </p>
              <button
                onClick={onOpenLogin}
                className="font-pixel font-bold bg-primary text-surface px-6 py-2 rounded-lg hover:[animation:jiggle_0.4s_ease-in-out] active:scale-95 transition-transform"
              >
                Sign in
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Message field */}
              <div className="flex flex-col gap-2">
                <label className="font-pixel text-on-surface-variant text-xs uppercase tracking-widest">
                  Message
                </label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  maxLength={MAX_CHARS}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write something to put in the jar..."
                  className="w-full px-4 py-3 bg-surface-container text-on-surface font-body text-base rounded-xl border border-on-surface/15 focus:border-on-surface/40 focus:outline-none focus:ring-0 resize-none placeholder:text-on-surface-variant/50 transition-colors"
                />
                <span className={`font-mono text-xs self-end ${remaining < 100 ? 'text-red-500' : 'text-on-surface-variant'}`}>
                  {remaining} left
                </span>
              </div>

              {/* Visibility toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <div
                  onClick={() => setIsPublic(p => !p)}
                  className={`w-10 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 ${isPublic ? 'bg-on-surface' : 'bg-on-surface/20'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-surface shadow transition-transform duration-200 ${isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="font-pixel text-on-surface-variant text-xs uppercase tracking-widest group-hover:text-on-surface transition-colors">
                  {isPublic ? 'Public' : 'Private'}
                </span>
              </label>

              {/* Error */}
              {error && (
                <p className="font-body text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-2">{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || message.trim().length === 0}
                className="w-full py-3 bg-primary text-surface font-pixel font-bold tracking-widest uppercase text-base rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:[animation:jiggle_0.4s_ease-in-out] active:enabled:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Creating...' : 'Create Jar'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
