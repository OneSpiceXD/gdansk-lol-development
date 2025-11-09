import { MapPin, Brain, Users } from 'lucide-react';

export default function ValuePropCards() {
  const cards = [
    {
      icon: MapPin,
      title: 'Local Rankings',
      description: 'See where you rank in Poland, not among millions',
    },
    {
      icon: Brain,
      title: 'Unique Insights',
      description: 'Mental resilience, best play times, heatmaps',
    },
    {
      icon: Users,
      title: 'Growing Community',
      description: 'Track players, discover teams, join tournaments',
    },
  ];

  return (
    <section className="py-12 bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border-color)] hover:border-cyan-accent transition-all"
              >
                {/* Icon */}
                <div className="w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-[var(--accent-cyan)] to-cyan-accent-dark flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[var(--text-secondary)]">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
