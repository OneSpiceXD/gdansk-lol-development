'use client';

import Link from 'next/link';
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
    <nav className="sticky top-0 z-50 bg-[var(--bg-card)] border-b border-[var(--border-color)] backdrop-blur-xl shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[var(--accent-red)] rounded flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="font-bold text-lg text-[var(--text-primary)]">
              Gdańsk League Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side - CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-4 py-2 bg-gradient-to-r from-[var(--accent-red)] to-[var(--accent-red-hover)] text-white rounded-lg font-bold transition-all hover:shadow-lg hover:shadow-red-500/50">
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
        <div className="md:hidden border-t border-[var(--border-color)] bg-[var(--bg-card)] backdrop-blur-xl">
          <div className="px-4 py-4 space-y-3">
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
            <button className="w-full px-4 py-2 bg-gradient-to-r from-[var(--accent-red)] to-[var(--accent-red-hover)] text-white rounded-lg font-bold transition-all hover:shadow-lg hover:shadow-red-500/50 mt-4">
              Claim Profile
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
