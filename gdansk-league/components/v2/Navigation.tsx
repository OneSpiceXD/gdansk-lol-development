'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/teams', label: 'Find Teams' },
    { href: '/tournaments', label: 'Tournaments' },
    { href: '/about', label: 'About' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[rgba(13,17,23,0.8)] backdrop-blur-xl border-b border-[var(--border-subtle)]">
      <div className="max-w-[1280px] mx-auto px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link href="/v2" className="flex items-center">
            <Image
              src="/leagueverse_logo.png"
              alt="Leagueverse"
              width={600}
              height={130}
              className="h-14 w-auto"
              priority
              unoptimized
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center">
            <button className="px-4 py-2 bg-[var(--accent)] text-[var(--bg-primary)] rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
              Claim Profile
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[var(--text-primary)]" />
              ) : (
                <Menu className="w-6 h-6 text-[var(--text-primary)]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] bg-[rgba(13,17,23,0.95)] backdrop-blur-xl">
          <div className="px-8 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button className="w-full px-4 py-2 bg-[var(--accent)] text-[var(--bg-primary)] rounded-md text-sm font-medium mt-4">
              Claim Profile
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
