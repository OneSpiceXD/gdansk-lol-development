import { TrendingUp, Target, Eye, Users } from 'lucide-react';

export default function PolandStats() {
  const stats = [
    {
      icon: Target,
      label: 'Avg Rank',
      value: 'Diamond IV',
      subtext: 'Poland average',
    },
    {
      icon: TrendingUp,
      label: 'Avg Win Rate',
      value: '51.2%',
      subtext: 'Across all ranks',
    },
    {
      icon: Users,
      label: 'Most Popular',
      value: 'Mid 28%',
      subtext: 'Preferred role',
    },
    {
      icon: Eye,
      label: 'Vision Score',
      value: '+15% vs EUNE',
      subtext: 'Poland advantage',
    },
  ];

  return (
    <section className="py-16 bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            How Polish Players Stack Up
          </h2>
          <p className="text-[var(--text-secondary)]">
            Real-time aggregated stats from active Polish players
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-[var(--bg-card)] rounded-lg p-6 text-center border border-[var(--border-color)] card-hover"
              >
                <Icon className="w-8 h-8 text-cyan-accent mx-auto mb-3" />
                <div className="text-sm text-[var(--text-muted)] mb-1">
                  {stat.label}
                </div>
                <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {stat.subtext}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-lg text-[var(--text-secondary)] mb-4">
            Where do <span className="text-cyan-accent font-semibold">YOU</span> rank?
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-[var(--accent-red)] to-[var(--accent-red-hover)] text-white font-bold rounded-lg shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/50 hover:-translate-y-0.5 transition-all">
            Claim Your Profile
          </button>
        </div>
      </div>
    </section>
  );
}
