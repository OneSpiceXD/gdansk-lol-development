import { Trophy, Flame, TrendingUp, Star, Users, User, PartyPopper } from 'lucide-react';
import activityData from '@/data/activity.json';

const iconMap = {
  trophy: Trophy,
  flame: Flame,
  chart: TrendingUp,
  star: Star,
  users: Users,
  user: User,
  party: PartyPopper,
};

export default function ActivityFeed() {
  return (
    <div className="bg-[var(--bg-card)] rounded-lg p-6 shadow-[var(--shadow)] border border-[var(--border-color)]">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[var(--accent-red)] rounded-full live-pulse" />
          <span className="text-xs font-semibold text-[var(--accent-red)] uppercase tracking-wider">
            LIVE
          </span>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Activity
        </h2>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {activityData.events.map((event) => {
          const Icon = iconMap[event.icon as keyof typeof iconMap] || Star;

          return (
            <div
              key={event.id}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--accent-red)] bg-opacity-10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[var(--accent-red)]" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-secondary)]">
                  {event.player && (
                    <span className="font-semibold text-[var(--text-primary)]">
                      {event.player}
                    </span>
                  )}{' '}
                  {event.message}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {event.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
