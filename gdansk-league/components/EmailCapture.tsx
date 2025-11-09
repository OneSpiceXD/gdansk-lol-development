'use client';

import { useState } from 'react';
import { Mail, User, Check } from 'lucide-react';

export default function EmailCapture() {
  const [email, setEmail] = useState('');
  const [summonerName, setSummonerName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[EMAIL CAPTURE]', { email, summonerName });
    localStorage.setItem('signup_email', email);
    localStorage.setItem('signup_summoner', summonerName);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
      setSummonerName('');
    }, 4000);
  };

  return (
    <section id="email-capture" className="relative py-24 bg-gradient-to-b from-[var(--bg-primary)] to-[#000000] overflow-hidden">
      {/* Animated Rotating Gradient Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-accent via-purple-500 to-cyan-accent rounded-full blur-[100px] animate-rotate-gradient"></div>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[rgba(255,255,255,0.1)] to-[rgba(255,255,255,0.02)] border-2 border-cyan-accent/20 rounded-3xl p-10 md:p-14 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
          {/* Headline */}
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-cyan-accent to-white bg-clip-text text-transparent mb-6 text-center animate-gradient">
            Don't miss your rank updates
          </h2>

          <p className="text-lg text-[var(--text-secondary)] mb-10 text-center max-w-2xl mx-auto">
            Get weekly emails when your position changes, new tournaments open, and teams are looking for your role.
          </p>

          {/* Form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="mb-8">
              {/* Email Input with Subscribe Button */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="w-full px-5 py-4 bg-[rgba(255,255,255,0.05)] border-2 border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-cyan)] focus:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all backdrop-blur-xl"
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-[var(--accent-cyan)] to-[#00B8E6] text-[#0A0E27] font-bold rounded-xl shadow-[0_8px_30px_rgba(0,212,255,0.4)] hover:shadow-[0_12px_40px_rgba(0,212,255,0.6)] hover:-translate-y-1 hover:scale-105 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap relative overflow-hidden group"
                >
                  <span className="relative z-10">Subscribe</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              </div>
            </form>
        ) : (
          <div className="py-12 mb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-success)] flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[var(--color-success)] mb-2">Profile claimed!</h3>
            <p className="text-[var(--text-secondary)]">
              Check your email for next steps. Welcome to the Gdańsk League Hub!
            </p>
          </div>
        )}

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className="text-[var(--text-secondary)] text-sm">
                Performance insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-[var(--text-secondary)] text-sm">
                Team matching
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-[var(--text-secondary)] text-sm">
                Tournament alerts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                <Check className="w-4 h-4 text-cyan-accent" />
              </div>
              <p className="text-[var(--text-secondary)] text-sm">
                No spam
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
