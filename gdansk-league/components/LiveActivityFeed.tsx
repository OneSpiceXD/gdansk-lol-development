'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Users, Trophy, UserPlus, Target, Flame, MessageCircle, Eye } from 'lucide-react';

interface Activity {
  id: number;
  text: string;
  timestamp: string;
  type: 'achievement' | 'team' | 'tournament' | 'looking' | 'performance' | 'stats' | 'milestone';
  featured?: boolean;
  author?: string;
  authorInitials?: string;
  badge?: string;
  quote?: string;
  stats?: string[];
  urgent?: boolean;
  urgentText?: string;
  interactions?: {
    reactions?: number;
    replies?: number;
    views?: number;
  };
  isNew?: boolean;
  isNegative?: boolean;
}

export default function LiveActivityFeed() {
  const [visibleActivities, setVisibleActivities] = useState<Activity[]>([]);
  const [activityCounter, setActivityCounter] = useState(0);

  const allActivities: Activity[] = [
    {
      id: 1,
      text: 'hit Platinum III, now top #50 in Kraków!',
      timestamp: 'Just now',
      type: 'achievement',
      author: 'Wojtek',
      authorInitials: 'WJ',
      interactions: {
        reactions: 23,
        replies: 8
      }
    },
    {
      id: 2,
      text: 'Warsaw average rank is now Platinum II, 23% above other cities in Poland',
      timestamp: 'Just now',
      type: 'stats'
    },
    {
      id: 3,
      text: 'The highest ranked player is now located in Gdańsk! Congrats, Piotr!',
      timestamp: 'Just now',
      type: 'milestone',
      featured: true
    },
    {
      id: 4,
      text: 'dropped to Gold III after losing streak - now #87 in Wrocław',
      timestamp: 'Just now',
      type: 'performance',
      author: 'Marcin',
      authorInitials: 'MR',
      isNegative: true,
      interactions: {
        reactions: 5,
        replies: 12
      }
    },
    {
      id: 5,
      text: 'climbed to Diamond I - now #12 in Poznań!',
      timestamp: 'Just now',
      type: 'achievement',
      author: 'Kasia',
      authorInitials: 'KS',
      interactions: {
        reactions: 31,
        replies: 9
      }
    },
    {
      id: 6,
      text: 'Kinguin Monthly Open registration closes in 48h - 28/32 teams registered',
      timestamp: 'Just now',
      type: 'tournament',
      urgent: true,
      urgentText: 'Register now!',
      interactions: {
        reactions: 45,
        replies: 18,
        views: 312
      }
    },
    {
      id: 7,
      text: 'Kraków average rank dropped to Emerald IV, down 12% this week',
      timestamp: 'Just now',
      type: 'stats',
      isNegative: true
    },
    {
      id: 8,
      text: 'reached Master tier - now #3 in all of Poland!',
      timestamp: 'Just now',
      type: 'achievement',
      author: 'Anna',
      authorInitials: 'AN',
      interactions: {
        reactions: 67,
        replies: 23
      }
    },
    {
      id: 9,
      text: 'fell from Platinum I to Platinum IV - dropped to #156 in Sopot',
      timestamp: 'Just now',
      type: 'performance',
      author: 'Tomek',
      authorInitials: 'TK',
      isNegative: true,
      interactions: {
        reactions: 8,
        replies: 15
      }
    },
    {
      id: 10,
      text: 'Łódź average rank is now Gold I, 8% above national average',
      timestamp: 'Just now',
      type: 'stats'
    },
    {
      id: 11,
      text: 'promoted to Emerald II - now #24 in Gdańsk!',
      timestamp: 'Just now',
      type: 'achievement',
      author: 'Maciej',
      authorInitials: 'MC',
      interactions: {
        reactions: 19,
        replies: 5
      }
    },
    {
      id: 12,
      text: 'hit Diamond IV after 12-game win streak - now #45 in Warsaw!',
      timestamp: 'Just now',
      type: 'achievement',
      author: 'Ola',
      authorInitials: 'OL',
      interactions: {
        reactions: 28,
        replies: 11
      }
    }
  ];

  // Initialize with first 5 activities
  useEffect(() => {
    setVisibleActivities(allActivities.slice(0, 5));
  }, []);

  // Rotate activities every 5 seconds
  useEffect(() => {
    let currentIndex = 5;

    const interval = setInterval(() => {
      setVisibleActivities((prev) => {
        // Remove the last item and add a new one at the top
        const nextActivity = { ...allActivities[currentIndex % allActivities.length], isNew: true };
        const updated = prev.slice(0, 4).map(act => ({ ...act, isNew: false }));

        currentIndex++;
        setActivityCounter(c => c + 1);
        return [nextActivity, ...updated];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: Activity['type'], isNegative?: boolean) => {
    switch (type) {
      case 'achievement':
        return TrendingUp;
      case 'team':
        return Users;
      case 'tournament':
        return Trophy;
      case 'looking':
        return UserPlus;
      case 'performance':
        return isNegative ? TrendingDown : Target;
      case 'stats':
        return isNegative ? TrendingDown : TrendingUp;
      case 'milestone':
        return Flame;
      default:
        return Flame;
    }
  };

  const getIconColor = (type: Activity['type'], isNegative?: boolean) => {
    switch (type) {
      case 'achievement':
        return 'text-[var(--color-success)]';
      case 'team':
        return 'text-[#F97316]';
      case 'tournament':
        return 'text-[#FBBF24]';
      case 'looking':
        return 'text-[#A855F7]';
      case 'performance':
        return isNegative ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]';
      case 'stats':
        return isNegative ? 'text-[var(--color-error)]' : 'text-[#3B82F6]';
      case 'milestone':
        return 'text-cyan-accent';
      default:
        return 'text-[var(--text-secondary)]';
    }
  };

  const getBorderColor = (type: Activity['type']) => {
    switch (type) {
      case 'achievement':
        return 'border-[var(--color-success)]';
      case 'team':
        return 'border-[#F97316]';
      case 'tournament':
        return 'border-[#FBBF24]';
      case 'looking':
        return 'border-[#A855F7]';
      case 'performance':
        return 'border-[var(--color-success)]';
      case 'stats':
        return 'border-[#3B82F6]';
      case 'milestone':
        return 'border-cyan-accent';
      default:
        return 'border-[var(--border-color)]';
    }
  };

  const getActionButton = (type: Activity['type']) => {
    switch (type) {
      case 'achievement':
        return { text: 'View profile', href: '#' };
      case 'team':
        return { text: 'View team', href: '#' };
      case 'tournament':
        return { text: 'Register now', href: '#' };
      case 'looking':
        return { text: 'Send message', href: '#' };
      case 'performance':
        return { text: 'View stats', href: '#' };
      case 'milestone':
        return { text: 'Congratulate', href: '#' };
      default:
        return null;
    }
  };

  const getAvatarColor = (id: number) => {
    const colors = [
      'bg-[#00D4FF]', // Cyan
      'bg-[#9b51e0]', // Purple
      'bg-[#10B981]', // Green
      'bg-[#F97316]', // Orange
      'bg-[#3B82F6]', // Blue
      'bg-[#EF4444]', // Red
    ];
    return colors[id % colors.length];
  };

  return (
    <section className="py-20 bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Live Indicator */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 bg-[var(--color-success)] rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 bg-[var(--color-success)] rounded-full animate-ping"></div>
            </div>
            <span className="text-sm text-[var(--text-muted)] font-medium">LIVE</span>
          </div>
          <h2 className="text-[32px] font-semibold text-[var(--text-primary)] text-center">
            What's happening in Poland right now
          </h2>
        </div>

        {/* Activity Feed Container with Glass Morphism */}
        <div className="relative max-w-4xl mx-auto bg-gradient-to-br from-[rgba(255,255,255,0.08)] to-[rgba(255,255,255,0.02)] border border-cyan-accent/20 rounded-2xl overflow-hidden backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          {/* Activities List */}
          <div className="px-8 py-6">
            {visibleActivities.map((activity, index) => {
              const Icon = getIcon(activity.type, activity.isNegative);
              const iconColor = getIconColor(activity.type, activity.isNegative);
              const actionButton = getActionButton(activity.type);
              const isFirstItem = index === 0;
              const isLastItem = index === visibleActivities.length - 1;

              // Featured Activity Item
              if (activity.featured) {
                const isMilestone = activity.type === 'milestone';
                return (
                  <div
                    key={`${activity.id}-${activityCounter}-${index}`}
                    className={`relative py-6 px-6 -mx-6 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden hover:bg-[rgba(255,255,255,0.06)] hover:-translate-y-1 ${
                      !isLastItem ? 'mb-4' : ''
                    } ${
                      isMilestone
                        ? 'bg-gradient-to-br from-[rgba(0,212,255,0.15)] via-[rgba(0,212,255,0.12)] to-[rgba(0,212,255,0.08)] border-2 border-cyan-accent/30 shadow-[0_8px_32px_rgba(0,212,255,0.2)]'
                        : 'bg-[rgba(255,255,255,0.05)]'
                    } ${isFirstItem && activity.isNew ? 'animate-slide-in' : ''}`}
                  >
                    {/* Background glow for milestone */}
                    {isMilestone && (
                      <div className="absolute inset-0 opacity-30 pointer-events-none">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-accent rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-accent rounded-full blur-3xl"></div>
                      </div>
                    )}

                    {/* Labels */}
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                      {isMilestone && (
                        <span className="px-2 py-1 text-xs font-bold bg-[var(--accent-orange)] text-white rounded-md flex items-center gap-1">
                          🔥 HOT
                        </span>
                      )}
                    </div>

                    {/* Author Header */}
                    <div className="relative z-10 flex items-start gap-4 mb-4">
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full ${getIconColor(activity.type).replace('text-', 'bg-')} bg-opacity-20 flex items-center justify-center font-bold text-[var(--text-primary)]`}>
                        {activity.authorInitials}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-[17px] text-cyan-accent">{activity.author}</span>
                          {activity.badge && (
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[rgba(255,255,255,0.1)] text-[var(--text-secondary)]">
                              {activity.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[15px] leading-[1.6] text-white mb-3">{activity.text}</p>

                        {/* Stats Pills */}
                        {activity.stats && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {activity.stats.map((stat, idx) => (
                              <span key={idx} className="px-3 py-1 text-xs font-medium bg-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] rounded-full">
                                {stat}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-2">
                          <p className="text-sm text-[var(--text-muted)]">{activity.timestamp}</p>

                          {/* Reactions */}
                          {activity.interactions?.reactions !== undefined && (
                            <div className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-cyan-accent transition-colors cursor-pointer">
                              <span className="text-sm">👏</span>
                              <span className="text-sm font-medium">{activity.interactions.reactions}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Compact Activity Item
              return (
                <div
                  key={`${activity.id}-${activityCounter}-${index}`}
                  className={`relative flex items-start gap-3 py-4 px-2 rounded-xl transition-all duration-200 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] hover:-translate-y-0.5 ${
                    !isLastItem ? 'mb-2' : ''
                  } ${
                    activity.urgent
                      ? 'bg-gradient-to-r from-[rgba(255,107,53,0.1)] to-[rgba(255,107,53,0.05)] border border-orange-500/20'
                      : ''
                  } ${isFirstItem && activity.isNew ? 'animate-slide-in' : ''}`}
                >
                  {/* Avatar or Icon */}
                  {activity.author ? (
                    <div className={`flex-shrink-0 w-9 h-9 rounded-full ${getAvatarColor(activity.id)} bg-opacity-20 flex items-center justify-center font-bold text-xs text-[var(--text-primary)]`}>
                      {activity.authorInitials}
                    </div>
                  ) : (
                    <span className="flex-shrink-0 text-lg">
                      {activity.type === 'stats' && '📈'}
                      {activity.type === 'milestone' && '🔥'}
                      {activity.type === 'tournament' && '🏆'}
                      {activity.type === 'team' && '👥'}
                    </span>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-[14px] leading-[1.5] text-[var(--text-secondary)]">
                          {activity.author && (
                            <span className="font-semibold text-white">{activity.author} </span>
                          )}
                          {activity.text}
                          {activity.urgent && activity.urgentText && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-[var(--accent-orange)] text-white rounded-md">
                              {activity.urgentText}
                            </span>
                          )}
                          <span className="text-[var(--text-muted)] ml-2">• {activity.timestamp}</span>
                        </p>

                        {/* Interactions for Compact Items */}
                        {activity.interactions && (
                          <div className="flex items-center gap-3 mt-1.5">
                            {activity.interactions.reactions !== undefined && (
                              <div className="flex items-center gap-1 text-[var(--text-muted)] hover:text-cyan-accent transition-colors cursor-pointer">
                                <span className="text-sm">👏</span>
                                <span className="text-xs font-medium">{activity.interactions.reactions}</span>
                              </div>
                            )}
                            {activity.interactions.replies !== undefined && (
                              <div className="flex items-center gap-1 text-[var(--text-muted)] hover:text-cyan-accent transition-colors cursor-pointer">
                                <MessageCircle className="w-3 h-3" />
                                <span className="text-xs font-medium">{activity.interactions.replies}</span>
                              </div>
                            )}
                            {activity.interactions.views !== undefined && (
                              <div className="flex items-center gap-1 text-[var(--text-muted)]">
                                <Eye className="w-3 h-3" />
                                <span className="text-xs font-medium">{activity.interactions.views}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* See All Link */}
          <div className="p-6 bg-[var(--bg-primary)] bg-opacity-50 backdrop-blur-md border-t border-[var(--border-color)] text-center">
            <a
              href="/activity"
              className="text-cyan-accent hover:text-cyan-accent-hover font-semibold transition-colors"
            >
              See all activity →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
