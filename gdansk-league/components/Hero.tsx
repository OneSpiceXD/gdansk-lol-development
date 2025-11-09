'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

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
    <section className="relative overflow-hidden py-24 md:py-32 pb-16 md:pb-20" style={{
      background: 'radial-gradient(ellipse at top, #1a0f2e 0%, #0A0E27 50%, #000000 100%)'
    }}>
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(rgba(0, 212, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.3) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Hextech Geometric Pattern Background */}
      <div className="absolute inset-0 opacity-15">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hextech" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              {/* Main Hexagon - Bright Cyan */}
              <polygon points="50,5 85,25 85,60 50,80 15,60 15,25" fill="none" stroke="#00D4FF" strokeWidth="0.8" opacity="1" />
              {/* Inner lines creating tech pattern - Cyan */}
              <line x1="50" y1="5" x2="50" y2="80" stroke="#00D4FF" strokeWidth="0.5" opacity="0.6" />
              <line x1="15" y1="25" x2="85" y2="60" stroke="#00D4FF" strokeWidth="0.5" opacity="0.6" />
              <line x1="85" y1="25" x2="15" y2="60" stroke="#00D4FF" strokeWidth="0.5" opacity="0.6" />
              {/* Corner accents - Bright Cyan */}
              <circle cx="50" cy="5" r="2.5" fill="#00D4FF" opacity="0.9" />
              <circle cx="85" cy="25" r="2" fill="#00D4FF" opacity="0.7" />
              {/* Purple accent hexagon overlay - Brighter */}
              <polygon points="50,5 85,25 85,60 50,80 15,60 15,25" fill="none" stroke="#b269f0" strokeWidth="0.6" opacity="0.8" />
              {/* Purple corner accents - Brighter */}
              <circle cx="50" cy="80" r="2.5" fill="#b269f0" opacity="0.9" />
              <circle cx="15" cy="60" r="2" fill="#b269f0" opacity="0.7" />
              {/* Gradient-filled accent hexagon */}
              <polygon points="50,5 85,25 85,60 50,80 15,60 15,25" fill="url(#hexGradient)" opacity="0.1" />
            </pattern>
            <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D4FF" />
              <stop offset="100%" stopColor="#9b51e0" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#hextech)" />
        </svg>
      </div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => {
          const isPurple = i % 2 === 0; // 50/50 purple/cyan
          const size = i % 5 === 0 ? 'w-2 h-2' : i % 3 === 0 ? 'w-1.5 h-1.5' : 'w-1 h-1';
          const glowColor = isPurple ? 'rgba(178, 105, 240, 0.6)' : 'rgba(0, 212, 255, 0.6)';
          return (
            <div
              key={i}
              className={`absolute rounded-full animate-float ${isPurple ? 'bg-[#b269f0]' : 'bg-cyan-accent'} ${size}`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
                opacity: Math.random() * 0.6 + 0.3,
                boxShadow: `0 0 ${i % 4 === 0 ? '12px' : '8px'} ${glowColor}`,
              }}
            />
          );
        })}
      </div>

      {/* Gradient Overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent opacity-60" />

      {/* Smooth bottom fade for section transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[var(--bg-primary)] pointer-events-none" />

      {/* Enhanced purple glow accents with pulse animation */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#b269f0] rounded-full blur-[180px] opacity-10 pointer-events-none animate-radial-pulse" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-cyan-accent rounded-full blur-[150px] opacity-5 pointer-events-none animate-radial-pulse" style={{ animationDelay: '2s' }} />

      {/* Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.4) 100%)'
      }} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 1. Headline with animated gradient */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-cyan-accent to-[#b269f0] bg-clip-text text-transparent mb-6 leading-[1.1] animate-gradient">
          Poland's first ever<br />LoL player hub
        </h1>

        {/* 2. Subheadline */}
        <p className="text-lg md:text-xl text-[var(--text-secondary)] opacity-90 mb-10 max-w-3xl mx-auto leading-relaxed">
          Connect with players in your city, compete on regional leaderboards, and get discovered by Polish esports teams.
        </p>

        {/* 3. Email Sign Up */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-cyan)] focus:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all backdrop-blur-xl"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-[var(--accent-cyan)] to-[#00B8E6] text-[#0A0E27] font-bold rounded-lg shadow-[0_8px_30px_rgba(0,212,255,0.4)] hover:shadow-[0_12px_40px_rgba(0,212,255,0.6)] hover:-translate-y-1 hover:scale-105 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] whitespace-nowrap relative overflow-hidden group"
              >
                <span className="relative z-10">Get started free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </div>
          </form>
        ) : (
          <div className="max-w-md mx-auto mb-6 py-8">
            <p className="text-xl font-semibold text-green-500">
              ✓ Check your email to complete registration!
            </p>
          </div>
        )}

        {/* 4. Little Message Below */}
        <p className="text-sm text-[var(--text-muted)]">
          Join 87 players tracking their Gdańsk rank • 100% free • No credit card required
        </p>
      </div>
    </section>
  );
}
