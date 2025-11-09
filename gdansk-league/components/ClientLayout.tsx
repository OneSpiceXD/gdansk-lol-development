'use client';

import Navigation from './v2/Navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] py-16">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <h4 className="text-base font-semibold mb-2">Leagueverse</h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Poland's first local leaderboard for esports talent discovery
              </p>
            </div>
            <div>
              <h5 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-4">Quick Links</h5>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Home</a></li>
                <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Leaderboard</a></li>
                <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Tournaments</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs uppercase tracking-wider text-[var(--text-secondary)] mb-4">Community</h5>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Discord</a></li>
                <li><a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-tertiary)]">
            © 2025 Leagueverse. Not associated with Riot Games.
          </div>
        </div>
      </footer>
    </div>
  );
}
