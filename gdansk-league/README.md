# Gdańsk League Hub - Homepage MVP

Poland's first local League of Legends talent network with dual theme support.

## Features

### Dual Theme System
- **Theme A (Dark/Esports)**: Professional dark navy background (#0A0E27) with Poland red accents
- **Theme B (Light/Fresh)**: Clean white background with Polish red/white color scheme
- Toggle between themes with the sun/moon button in navigation
- Theme preference persists in localStorage

### Homepage Components
1. **Hero Section**: Stats cards showing 87 players, 12 teams, next tournament
2. **Top 20 Leaderboard**: Sortable table with rank, player name, tier, LP, win rate
3. **Live Activity Feed**: Real-time updates on rank changes, win streaks, achievements
4. **Responsive Design**: Mobile-first approach, works on all screen sizes

## Tech Stack

- **Next.js 16**: App Router, React 19, Server Components
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling with custom theme variables
- **Lucide React**: Icon library

## Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the homepage.

### Build for Production
```bash
npm run build
npm start
```

## Project Structure

```
gdansk-league/
├── app/
│   ├── layout.tsx          # Root layout with ThemeProvider
│   ├── page.tsx            # Homepage
│   └── globals.css         # Global styles + CSS variables
├── components/
│   ├── ThemeProvider.tsx   # React Context for theme state
│   ├── ThemeSwitcher.tsx   # Toggle button component
│   ├── Navigation.tsx      # Sticky header with nav links
│   ├── Footer.tsx          # Footer with links
│   ├── Hero.tsx            # Hero section with stats
│   ├── LeaderboardPreview.tsx  # Top 20 table
│   └── ActivityFeed.tsx    # Live activity sidebar
├── data/
│   ├── players.json        # 20 mock Polish players
│   └── activity.json       # 15 activity events
└── public/                 # Static assets
```

## Theme System

CSS variables are defined in `app/globals.css` and switch based on `data-theme` attribute:

```css
/* Light Theme */
--bg-primary: #FFFFFF
--bg-secondary: #F5F5F5
--accent-red: #DC143C

/* Dark Theme */
--bg-primary: #0A0E27
--bg-secondary: #1A1A1A
--accent-red: #DC143C
```

## Mock Data

### Players (`data/players.json`)
- 20 Polish players with realistic stats
- Ranks: 1 Master, 4 Diamond, 6 Emerald, 6 Platinum, 3 Gold
- Win rates: 48-58%
- Roles: Mix of Top, Jungle, Mid, ADC, Support

### Activity (`data/activity.json`)
- 15 events: rank ups, win streaks, achievements, tournaments
- Icons: Trophy, Flame, Star, Chart, Users, Party Popper
- Timestamps: "2h ago", "1d ago", etc.

## Design Highlights

### Poland Red Integration
- CTAs (Claim Profile button)
- Hover states on cards and links
- Live activity icons
- Rank badges and accents
- Theme toggle active state

### Responsive Breakpoints
- Mobile: < 640px (single column)
- Tablet: 640px - 1024px (adjusted layout)
- Desktop: > 1024px (2/3 leaderboard, 1/3 activity feed)

## Next Steps

1. Test both themes on multiple devices
2. Deploy to Vercel for preview
3. Build remaining pages (Player Profile, Regions, Tournaments, About)
4. Integrate real Riot API data
5. Add interactive Poland map
6. Implement death heatmaps

## Notes

- Theme switcher persists choice in localStorage
- All components use CSS variables for easy theme switching
- Smooth transitions (0.3s) between theme changes
- No emojis in code (following project guidelines)
- Clean, professional gaming aesthetic

## Screenshots

Visit http://localhost:3000 and toggle between themes to see:
- Dark theme (default): Navy background with red accents
- Light theme: White background with Polish red/white colors

---

Built for Friday MVP demo - Gdańsk League Hub
