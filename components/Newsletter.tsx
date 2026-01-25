'use client';

import { Zap, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
    }, 1000);
  };

  return (
    <section className="py-32 bg-primary-400 border-t-[4px] border-neutral-900 relative overflow-hidden">
      {/* Brutalist Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="flex flex-wrap gap-8 rotate-12 scale-150">
          {Array.from({ length: 100 }).map((_, i) => (
            <span key={i} className="text-8xl font-black text-neutral-900 leading-none select-none">TN</span>
          ))}
        </div>
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-neutral-900 fill-current" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-900/60">INTELLIGENCE FEED</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-neutral-900 mb-8 leading-[0.9]">
              JOIN THE <br />
              <span className="text-white text-border">AUTHORITY</span>
            </h2>

            <p className="text-lg font-bold text-neutral-900/80 leading-relaxed max-w-lg">
              DEEP DIVES ON PRODUCTIVITY GEAR, CORE SPEC AUDITS, AND STRATEGIC WORKFLOW INTEL. DELIVERED WEEKLY.
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="brutalist-card p-10 bg-white">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Terminal Access</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="OPERATOR@EMAIL.COM"
                    required
                    className="brutalist-input h-14"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading' || status === 'success'}
                  className="brutalist-button-primary w-full h-14 bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'INITIALIZE SUBSCRIPTION'}
                </button>

                {status === 'success' && (
                  <div className="p-4 bg-green-50 border-[2px] border-green-600 font-bold text-xs text-green-700 text-center uppercase tracking-wide">
                    PROTOCOL ESTABLISHED: CHECK YOUR INBOX
                  </div>
                )}

                <p className="text-[9px] font-black text-neutral-300 text-center uppercase tracking-widest leading-loose">
                  SECURE TRANSMISSION. NO SPAM PROTOCOL ACTIVE. <br />
                  READ OUR <a href="#" className="text-neutral-900 underline">PRIVACY INTEL</a>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
