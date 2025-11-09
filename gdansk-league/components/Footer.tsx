import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-color)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[var(--accent-red)] rounded flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <span className="font-bold text-[var(--text-primary)]">
                Gdańsk Hub
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">
              Poland's first local League of Legends talent network.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-red)] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-red)] transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/tournaments" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-red)] transition-colors">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-red)] transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">
              Community
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-red)] transition-colors">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-red)] transition-colors">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-red)] transition-colors">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-red)] transition-colors">
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">
              Partners
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-red)] transition-colors">
                  Kinguin Lounge
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-red)] transition-colors">
                  Riot Games
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-[var(--border-color)] text-center">
          <p className="text-sm text-[var(--text-muted)]">
            © 2025 Gdańsk League Hub. Not endorsed by Riot Games.
          </p>
        </div>
      </div>
    </footer>
  );
}
