'use client';

import { useState } from 'react';

export default function Hero() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[EMAIL CAPTURE]', email);
    localStorage.setItem('signup_email', email);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail('');
    }, 3000);
  };

  return (
    <section className="relative overflow-hidden pt-16 pb-12">
      {/* Base Electric Blue aurora */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[800px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(0, 217, 255, 0.2) 0%, rgba(0, 217, 255, 0.1) 40%, transparent 70%)',
          opacity: 1,
          animation: 'auroraBlue 8s ease-in-out infinite'
        }}
      />

      {/* Purple aurora wave */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[800px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 55% 45% at 50% 30%, rgba(138, 43, 226, 0.3) 0%, rgba(138, 43, 226, 0.12) 35%, transparent 65%)',
          opacity: 1,
          animation: 'auroraPurple 6s ease-in-out infinite'
        }}
      />

      {/* Animated grid background with white/greyish lines */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(200, 200, 200, 0.15) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
          animation: 'gridPulse 3s ease-in-out infinite'
        }}
      />

      {/* CSS Keyframes for animations */}
      <style jsx>{`
        @keyframes gridPulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.7;
          }
        }
        @keyframes auroraBlue {
          0%, 100% {
            opacity: 1;
            transform: translate(-50%, 0) scaleX(1) scaleY(1);
          }
          33% {
            opacity: 0.8;
            transform: translate(-48%, 2%) scaleX(1.05) scaleY(0.95);
          }
          66% {
            opacity: 0.9;
            transform: translate(-52%, -2%) scaleX(0.95) scaleY(1.05);
          }
        }
        @keyframes auroraPurple {
          0%, 100% {
            opacity: 1;
            transform: translate(-50%, 0) scaleX(1) scaleY(1);
          }
          50% {
            opacity: 0.7;
            transform: translate(-50%, 3%) scaleX(1.08) scaleY(0.92);
          }
        }
      `}</style>

      <div className="relative max-w-[900px] mx-auto px-8 text-center">
        {/* Headline - bigger */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.1] mb-8 mt-12">
          Poland's{' '}
          <span
            className="bg-gradient-to-r from-[var(--accent)] to-[#00a8cc] bg-clip-text text-transparent"
            style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            first ever
          </span>
          <br />
          LoL player hub
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-12 max-w-[700px] mx-auto leading-relaxed">
          Connect with players in your city, compete on regional leaderboards, and get discovered by Polish esports teams.
        </p>

        {/* CTA */}
        {!submitted ? (
          <div className="mb-12">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full sm:w-auto min-w-[280px] px-5 py-3.5 bg-gray-200 border border-[var(--border-default)] rounded-lg text-black text-sm placeholder-gray-600 focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3.5 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg text-sm font-medium hover:-translate-y-1 hover:scale-105 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap relative overflow-hidden group"
              >
                <span className="relative z-10">Claim your profile</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </form>
            <p className="text-xs text-[var(--text-secondary)] text-center max-w-[500px] mx-auto">
              1,000+ players already joined and receive our analysis weekly<br />
              <span className="text-[var(--text-tertiary)] italic">(just kidding, we're not there yet!)</span>
            </p>
          </div>
        ) : (
          <div className="mb-12 py-12">
            <p className="text-xl font-semibold text-green-500">
              ✓ Check your email to complete registration!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
