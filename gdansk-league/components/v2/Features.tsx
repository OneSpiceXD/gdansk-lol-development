import SummonersRiftMap from './SummonersRiftMap';

export default function Features() {
  return (
    <section className="py-32 bg-[var(--bg-primary)]">
      <div className="max-w-[1280px] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16 max-w-[800px] mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            Raising the bar for Polish League
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            Everything you need to go from solo queue grinding to competitive play—locally.
          </p>
        </div>

        {/* Features Layout */}
        <div className="space-y-6">
          {/* AI Insights - Featured Card (Full Width) */}
          <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-10 overflow-hidden hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] hover:border-[#00d9ff] transition-all duration-300 ease-out cursor-pointer">
            {/* Gradient Light Effect */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at top, rgba(0, 217, 255, 0.08) 0%, transparent 50%)',
                opacity: 0.6
              }}
            />

            <div className="relative z-10 grid lg:grid-cols-2 gap-8">
              {/* Left: Explanation */}
              <div>
                <h3 className="text-2xl font-semibold mb-4">
                  Benchmark against the server
                </h3>

                <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                  Compare your stats to EUW/EUNE standards, not just Polish players. See where you need to improve to compete nationally or internationally.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="inline-block w-1 h-1 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></span>
                    <span>Performance vs. server averages at your rank</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="inline-block w-1 h-1 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></span>
                    <span>Gap analysis: where Polish players fall behind</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="inline-block w-1 h-1 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></span>
                    <span>Playstyle comparison (aggression, vision, farming)</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="inline-block w-1 h-1 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></span>
                    <span>Identify your biggest improvement areas</span>
                  </li>
                </ul>

                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-sm text-[var(--accent)] font-medium hover:underline"
                >
                  See example insights →
                </a>
              </div>

              {/* Right: Interactive Summoner's Rift Heat Map */}
              <div>
                <SummonersRiftMap />
              </div>
            </div>
          </div>

          {/* Bottom Row: Two Cards Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Find Practice Partners Card */}
            <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-8 overflow-hidden hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] hover:border-[#00d9ff] transition-all duration-300 ease-out cursor-pointer">
              {/* Gradient Light Effect */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at top, rgba(0, 217, 255, 0.06) 0%, transparent 50%)',
                  opacity: 0.6
                }}
              />

              <div className="relative z-10">
                <h3 className="text-xl font-semibold mb-3">
                  Find practice partners
                </h3>

                <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                  Match with Polish players working on similar skills. Build duos and teams focused on improvement.
                </p>

                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="inline-block w-1 h-1 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></span>
                    <span>Duo partners by playstyle compatibility</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="inline-block w-1 h-1 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></span>
                    <span>Practice groups for specific roles</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="inline-block w-1 h-1 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></span>
                    <span>Team formation for tournaments</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="inline-block w-1 h-1 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></span>
                    <span>Location-based matching</span>
                  </li>
                </ul>

                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-sm text-[var(--accent)] font-medium hover:underline"
                >
                  Find teammates →
                </a>
              </div>
            </div>

            {/* Get Scouted Card */}
            <div className="relative bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-8 overflow-hidden hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] hover:border-[#00d9ff] transition-all duration-300 ease-out cursor-pointer">
              {/* Gradient Light Effect */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at top, rgba(0, 217, 255, 0.06) 0%, transparent 50%)',
                  opacity: 0.6
                }}
              />

              <div className="relative z-10">
                <h3 className="text-xl font-semibold mb-3">
                  Get scouted
                </h3>

                <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                  Top performers get featured and discovered by Polish esports organizations looking for rising talent.
                </p>

                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="inline-block w-1 h-1 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></span>
                    <span>Weekly highlights featuring top climbers</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="inline-block w-1 h-1 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></span>
                    <span>Regional leaderboard visibility</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="inline-block w-1 h-1 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></span>
                    <span>Direct discovery by Polish teams</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="inline-block w-1 h-1 rounded-full bg-[var(--accent)] mt-2 flex-shrink-0"></span>
                    <span>Build your competitive resume</span>
                  </li>
                </ul>

                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-sm text-[var(--accent)] font-medium hover:underline"
                >
                  View leaderboards →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
