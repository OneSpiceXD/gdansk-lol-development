'use client';

import { useEffect, useState } from 'react';

interface Activity {
  id: number;
  player: string;
  action: string;
  timestamp: string;
  icon: string;
  isNew?: boolean;
}

export default function ActivityFeed() {
  const [visibleActivities, setVisibleActivities] = useState<Activity[]>([]);
  const [activityCounter, setActivityCounter] = useState(0);

  const allActivities: Activity[] = [
    {
      id: 1,
      player: '',
      action: '🏆 xKomandor hit Master I in Pomorskie',
      timestamp: '2 hours ago',
      icon: ''
    },
    {
      id: 2,
      player: '',
      action: '🎯 3 new duos matched this week with 67% average winrate',
      timestamp: '5 hours ago',
      icon: ''
    },
    {
      id: 3,
      player: '',
      action: '📍 Mazowieckie now has 247 registered players',
      timestamp: '1 day ago',
      icon: ''
    },
    {
      id: 4,
      player: '',
      action: '⚡ WarsawLegend reached Grandmaster with 58% winrate',
      timestamp: '3 hours ago',
      icon: ''
    },
    {
      id: 5,
      player: '',
      action: '🔥 5 Clash teams formed in Gdańsk this week',
      timestamp: '6 hours ago',
      icon: ''
    },
    {
      id: 6,
      player: '',
      action: '💎 KrakowChamp promoted to Master with 200 LP gain',
      timestamp: '4 hours ago',
      icon: ''
    },
    {
      id: 7,
      player: '',
      action: '🎮 Śląskie region hit 500 active players milestone',
      timestamp: '2 days ago',
      icon: ''
    },
    {
      id: 8,
      player: '',
      action: '🌟 TriCityGG won 8 games in a row in Diamond II',
      timestamp: '7 hours ago',
      icon: ''
    },
    {
      id: 9,
      player: '',
      action: '🚀 12 new players registered in Wielkopolskie today',
      timestamp: '30 min ago',
      icon: ''
    },
    {
      id: 10,
      player: '',
      action: '👥 "Wrocław Warriors" looking for jungle main',
      timestamp: '1 hour ago',
      icon: ''
    },
    {
      id: 11,
      player: '',
      action: '🎯 PoznanBeast hit 70% winrate over last 20 games',
      timestamp: '5 hours ago',
      icon: ''
    },
    {
      id: 12,
      player: '',
      action: '💪 Małopolskie region grew 15% this month',
      timestamp: '12 hours ago',
      icon: ''
    },
    {
      id: 13,
      player: '',
      action: '⭐ GdańskPro climbed from Platinum to Diamond in 2 weeks',
      timestamp: '8 hours ago',
      icon: ''
    },
    {
      id: 14,
      player: '',
      action: '🏅 Top 10 leaderboard updated - 3 new entries from Pomorskie',
      timestamp: '3 hours ago',
      icon: ''
    },
    {
      id: 15,
      player: '',
      action: '🎊 BalticAce just hit 100 games played milestone',
      timestamp: '10 hours ago',
      icon: ''
    }
  ];

  // Initialize with first 4 activities
  useEffect(() => {
    setVisibleActivities(allActivities.slice(0, 4));
  }, []);

  // Rotate activities - show 4 at a time
  useEffect(() => {
    let currentIndex = 4;

    const interval = setInterval(() => {
      setVisibleActivities((prev) => {
        const nextActivity = { ...allActivities[currentIndex % allActivities.length], isNew: true };
        const updated = prev.slice(0, 3).map(act => ({ ...act, isNew: false }));

        currentIndex++;
        setActivityCounter(c => c + 1);
        return [nextActivity, ...updated];
      });
    }, 3000); // Rotate every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-32 bg-[var(--bg-primary)] border-t border-[var(--border-subtle)] relative overflow-hidden">
      {/* Background gradient accents */}
      <div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#00d9ff] rounded-full blur-[200px] opacity-5 pointer-events-none"
      />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#00d9ff] rounded-full blur-[200px] opacity-5 pointer-events-none"
      />

      <div className="max-w-[1280px] mx-auto px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 max-w-[800px] mx-auto">
          <span className="inline-block text-xs text-[var(--accent)] uppercase tracking-wider font-semibold mb-4">
            Weekly recap
          </span>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            This week's highlights
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            See what's happening across Poland's League of Legends community
          </p>
        </div>

        {/* Activity Feed */}
        <div className="max-w-[900px] mx-auto space-y-3">
          {visibleActivities.map((activity, index) => {
            const isFirstItem = index === 0;

            return (
              <div
                key={`${activity.id}-${activityCounter}-${index}`}
                className={`group relative bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-5 hover:border-[#00d9ff] hover:shadow-[0_0_20px_rgba(0,217,255,0.2)] transition-all duration-300 ${
                  isFirstItem && activity.isNew ? 'animate-slide-in' : ''
                }`}
                style={{
                  background: 'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(0, 217, 255, 0.02) 100%)'
                }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(0,217,255,0.03)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-relaxed mb-1" style={{ color: '#ffffff' }}>
                      {activity.action}
                    </p>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>
                      {activity.timestamp}
                    </p>
                  </div>

                  {/* Preview badge */}
                  <span className="flex-shrink-0 px-2 py-1 bg-[rgba(255,165,0,0.1)] border border-[rgba(255,165,0,0.2)] text-[#FFA500] rounded text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap">
                    Preview
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-4 bg-gradient-to-r from-[var(--accent)] to-[#0088cc] text-[var(--bg-primary)] rounded-lg text-sm font-semibold hover:-translate-y-1 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,217,255,0.4)] transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-hidden group">
            <span className="relative z-10">Register to get featured</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </section>
  );
}
