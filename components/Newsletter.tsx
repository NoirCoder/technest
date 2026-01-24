'use client';

import { Mail } from 'lucide-react';
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
    <section className="py-20 bg-neutral-900 text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-800 text-primary-400 mb-6 border border-neutral-700">
            <Mail className="w-6 h-6" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-4">
            Get smarter about your setup
          </h2>
          
          <p className="text-neutral-400 mb-8 text-lg">
            Join 5,000+ engineers and creatives. Weekly deep dives on productivity gear, desk setups, and workflow tips. No spam, ever.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-primary-500/25 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === 'loading' ? 'Joining...' : status === 'success' ? 'Joined!' : 'Subscribe'}
            </button>
          </form>

          {status === 'success' && (
            <p className="mt-4 text-green-400 text-sm animate-fade-in">
              Thanks for subscribing! Check your inbox for our latest guide.
            </p>
          )}
          
          <p className="mt-6 text-xs text-neutral-500">
            Unsubscribe at any time. Read our <a href="#" className="underline hover:text-neutral-400">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
