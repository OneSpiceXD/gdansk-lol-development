import { MapPin, Clock } from 'lucide-react';

export default function RegionalMap() {
  const cities = [
    { name: 'Gdańsk', players: 87, status: 'live' },
    { name: 'Warsaw', players: 0, status: 'coming' },
    { name: 'Kraków', players: 0, status: 'coming' },
    { name: 'Wrocław', players: 0, status: 'coming' },
    { name: 'Poznań', players: 0, status: 'coming' },
  ];

  return (
    <section className="py-12 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Vision Statement */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-4">
            Expanding Across Poland
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Starting in Gdańsk with 87 players. Join us as we build Poland's premier League of Legends community.
          </p>
          <button className="px-6 py-3 bg-[var(--bg-card)] border-2 border-[var(--accent-cyan)] text-[var(--accent-cyan)] font-semibold rounded-lg hover:bg-[var(--accent-cyan)] hover:text-white transition-all">
            Get Notified About Your City
          </button>
        </div>
      </div>
    </section>
  );
}
