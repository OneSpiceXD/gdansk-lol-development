'use client';

import { Brain, Users, Trophy, ArrowRight, Clock } from 'lucide-react';

export default function ValuePropTriplet() {
  return (
    <section className="py-20 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-[32px] font-semibold text-[var(--text-primary)] mb-4">
            How it works
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            Everything you need to go from solo queue grinding to competitive play—locally.
          </p>
        </div>

        {/* New Layout: Full Width Cards */}
        <div className="space-y-6">
          {/* AI Insights - Featured Card (Full Width) */}
          <div className="bg-gradient-to-br from-[rgba(0,212,255,0.12)] to-[rgba(155,81,224,0.08)] border-2 border-cyan-accent/20 rounded-3xl p-10 hover:border-cyan-accent/50 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,212,255,0.3)] transition-all duration-300 backdrop-blur-xl relative overflow-hidden group">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-10 right-10 w-32 h-32 bg-cyan-accent rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 left-10 w-24 h-24 bg-purple-500 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 grid lg:grid-cols-2 gap-8">
              {/* Left: Explanation */}
              <div>
                <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center shadow-[0_8px_32px_rgba(0,212,255,0.4)] group-hover:shadow-[0_12px_48px_rgba(0,212,255,0.6)] group-hover:scale-110 transition-all duration-300">
                  <Brain className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-cyan-accent bg-clip-text text-transparent mb-4">
                  AI-powered insights you can't find elsewhere
                </h3>

                <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
                  Get deep performance analysis that op.gg and u.gg don't offer. Our AI analyzes your playstyle, identifies patterns, and shows you exactly where to improve.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3 text-[var(--text-secondary)]">
                    <svg className="w-5 h-5 text-cyan-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">Death heatmaps showing your most dangerous zones</span>
                  </li>
                  <li className="flex items-start gap-3 text-[var(--text-secondary)]">
                    <svg className="w-5 h-5 text-cyan-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">Mental resilience score based on bounce-back performance</span>
                  </li>
                  <li className="flex items-start gap-3 text-[var(--text-secondary)]">
                    <svg className="w-5 h-5 text-cyan-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">Optimal play time recommendations (when you perform best)</span>
                  </li>
                  <li className="flex items-start gap-3 text-[var(--text-secondary)]">
                    <svg className="w-5 h-5 text-cyan-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">Performance vs. local players at your rank</span>
                  </li>
                </ul>

                <a
                  href="/insights"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-accent text-[#0A0E27] font-semibold text-sm rounded-lg hover:bg-[#00B8E6] transition-all"
                >
                  See example insights →
                </a>
              </div>

              {/* Right: Preview Card */}
              <div>
                {/* Death Heatmap Preview */}
                <div className="bg-[rgba(10,14,39,0.8)] border border-[rgba(255,255,255,0.1)] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">💀</span>
                    <span className="text-cyan-accent font-semibold text-sm">Death Heatmap Analysis</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    {/* Compact stat callout */}
                    <div className="flex-1">
                      <div className="text-xs text-[var(--text-muted)] mb-1">You're dying</div>
                      <div className="text-2xl font-bold text-[var(--color-error)] mb-0.5">23% more</div>
                      <div className="text-xs text-[var(--text-secondary)]">than Junglers in your league</div>
                    </div>

                    {/* Small map preview */}
                    <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-blue-950 border border-[rgba(255,255,255,0.1)]">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Background */}
                        <rect width="100" height="100" fill="rgba(34, 69, 34, 0.3)" />

                        {/* River */}
                        <path d="M 10 55 Q 50 35, 90 55" stroke="rgba(100, 150, 255, 0.5)" strokeWidth="8" fill="none"/>

                        {/* Lanes */}
                        <line x1="10" y1="10" x2="45" y2="45" stroke="rgba(139, 92, 46, 0.6)" strokeWidth="3"/>
                        <line x1="10" y1="90" x2="90" y2="10" stroke="rgba(139, 92, 46, 0.6)" strokeWidth="3"/>
                        <line x1="55" y1="55" x2="90" y2="90" stroke="rgba(139, 92, 46, 0.6)" strokeWidth="3"/>

                        {/* Bases */}
                        <circle cx="12" cy="88" r="6" fill="rgba(66, 135, 245, 0.4)" stroke="rgba(66, 135, 245, 0.7)" strokeWidth="1"/>
                        <circle cx="88" cy="12" r="6" fill="rgba(220, 50, 50, 0.4)" stroke="rgba(220, 50, 50, 0.7)" strokeWidth="1"/>

                        {/* Heatmap points - smaller and less opaque */}
                        <circle cx="70" cy="30" r="12" fill="rgba(255, 0, 0, 0.5)" filter="blur(8px)"/>
                        <circle cx="75" cy="40" r="10" fill="rgba(255, 100, 0, 0.4)" filter="blur(6px)"/>
                        <circle cx="50" cy="50" r="8" fill="rgba(255, 200, 0, 0.3)" filter="blur(5px)"/>
                      </svg>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
                    To help you out, we mapped when and where you die.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Most deaths</div>
                      <div className="text-sm font-semibold text-[var(--color-error)]">Enemy jungle</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--text-muted)] mb-1">Peak time</div>
                      <div className="text-sm font-semibold text-[var(--text-secondary)]">15-20 min</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Two Cards Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Matching Card */}
            <div className="bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)] border-2 border-[var(--border-color)] rounded-2xl p-8 hover:border-cyan-accent/50 hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(0,212,255,0.2)] transition-all duration-300 backdrop-blur-xl group">
              <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-purple)] flex items-center justify-center shadow-lg shadow-cyan-500/10">
                <Users className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Intelligent team matching
              </h3>

              <p className="text-[var(--text-secondary)] text-sm mb-4 leading-relaxed">
                Our system matches you with players based on skill level, playstyle compatibility, availability, and location—not just rank.
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-cyan-accent"></div>
                  <span className="text-xs text-[var(--text-secondary)]">Clash teams</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-cyan-accent"></div>
                  <span className="text-xs text-[var(--text-secondary)]">Tournament squads</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-cyan-accent"></div>
                  <span className="text-xs text-[var(--text-secondary)]">Duo partners</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-cyan-accent"></div>
                  <span className="text-xs text-[var(--text-secondary)]">Bootcamp groups</span>
                </div>
              </div>

              <a
                href="/teams"
                className="inline-flex items-center gap-2 text-cyan-accent font-semibold text-sm hover:gap-3 transition-all"
              >
                Find teammates →
              </a>
            </div>

            {/* Tournament Card */}
            <div className="bg-gradient-to-br from-[rgba(255,107,53,0.12)] to-[rgba(251,191,36,0.08)] border-2 border-orange-500/20 rounded-2xl p-8 hover:border-orange-500/50 hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(255,107,53,0.3)] transition-all duration-300 backdrop-blur-xl relative overflow-hidden group">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-5 right-5 w-20 h-20 bg-orange-500 rounded-full blur-2xl"></div>
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-[var(--accent-orange)] to-[#FBBF24] flex items-center justify-center shadow-lg shadow-orange-500/10">
                  <Trophy className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                  Local tournaments
                </h3>

                <p className="text-[var(--text-secondary)] text-sm mb-4 leading-relaxed">
                  Compete in monthly events at Kinguin Lounge. Build your resume, earn recognition, and climb regional rankings with a clear path to competitive play.
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-orange-500"></div>
                    <span className="text-xs text-[var(--text-secondary)]">Monthly tournaments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-orange-500"></div>
                    <span className="text-xs text-[var(--text-secondary)]">Regional qualifiers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-orange-500"></div>
                    <span className="text-xs text-[var(--text-secondary)]">Season standings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-orange-500"></div>
                    <span className="text-xs text-[var(--text-secondary)]">Scouting visibility</span>
                  </div>
                </div>

                <a
                  href="/tournaments"
                  className="inline-flex items-center gap-2 text-[var(--accent-orange)] font-semibold text-sm hover:gap-3 transition-all"
                >
                  View tournaments →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
