import { ArrowRight, X, Check } from 'lucide-react';

export default function ComparisonSection() {
  const comparisons = [
    {
      opgg: '#487,392 EUNE',
      us: '#12 in Warsaw',
    },
    {
      opgg: 'Global stats',
      us: 'Your city comparison',
    },
    {
      opgg: 'Basic KDA',
      us: 'Mental resilience score',
    },
    {
      opgg: 'No community',
      us: 'Live local activity',
    },
  ];

  return (
    <section className="py-16 bg-[var(--bg-primary)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            How We're Different from OP.GG
          </h2>
          <p className="text-[var(--text-secondary)]">
            Same data source. Completely different insights.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* OP.GG Column */}
          <div className="bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border-color)] opacity-60">
            <div className="flex items-center gap-2 mb-6">
              <X className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-[var(--text-secondary)]">
                OP.GG Shows
              </h3>
            </div>
            <div className="space-y-4">
              {comparisons.map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-[var(--text-muted)]">
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                  <span>{item.opgg}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Our Platform Column */}
          <div className="bg-gradient-to-br from-[var(--bg-card)] to-charcoal-lighter rounded-lg p-6 border-2 border-[var(--accent-cyan)] shadow-lg shadow-cyan-accent/20">
            <div className="flex items-center gap-2 mb-6">
              <Check className="w-5 h-5 text-[var(--accent-cyan)]" />
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                We Show
              </h3>
            </div>
            <div className="space-y-4">
              {comparisons.map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-[var(--text-primary)]">
                  <div className="w-2 h-2 bg-[var(--accent-cyan)] rounded-full flex-shrink-0 live-pulse" />
                  <span className="font-medium">{item.us}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Arrow */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-3 text-[var(--accent-cyan)]">
            <span className="text-sm font-semibold">Choose what matters</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </section>
  );
}
