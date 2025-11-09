'use client';

import { useState } from 'react';

export default function EmailCapture() {
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
    }, 4000);
  };

  return (
    <section className="py-32 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] relative overflow-hidden">
      {/* Base Electric Blue aurora */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[800px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 35%, rgba(0, 217, 255, 0.2) 0%, rgba(0, 217, 255, 0.1) 40%, transparent 70%)',
          opacity: 1,
          animation: 'auroraBlue 8s ease-in-out infinite'
        }}
      />

      {/* Purple aurora wave */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[800px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 55% 45% at 50% 35%, rgba(138, 43, 226, 0.3) 0%, rgba(138, 43, 226, 0.12) 35%, transparent 65%)',
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

      <div className="max-w-[1280px] mx-auto px-8 relative z-10">
        <div className="max-w-[700px] mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block text-xs text-[var(--accent)] uppercase tracking-wider font-semibold mb-4">
              Stay Updated
            </span>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
              Ready to claim your spot?
            </h2>
            <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
              Join 500+ players in Poland tracking their rank, finding teammates, and competing regionally.
            </p>
          </div>

          {/* Form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-16">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-5 py-3.5 bg-gray-200 border border-[var(--border-default)] rounded-lg text-black text-sm placeholder-gray-600 focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              <button
                type="submit"
                className="px-7 py-3.5 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg text-sm font-medium hover:-translate-y-1 hover:scale-105 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap relative overflow-hidden group"
              >
                <span className="relative z-10">Claim your profile</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </form>
          ) : (
            <div className="py-12 mb-16 text-center">
              <p className="text-xl font-semibold text-green-500">
                ✓ Check your email for next steps!
              </p>
            </div>
          )}

        </div>
      </div>

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
    </section>
  );
}
