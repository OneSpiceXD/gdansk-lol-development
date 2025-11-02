# Gdansk LoL Development Hub

**"LinkedIn for Gdansk League of Legends Players"**

A local esports talent network featuring player profiles, AI-powered performance insights, and team formation tools, with Kinguin Lounge as the physical verification hub.

## 🎯 Project Vision

Building a platform that connects local League of Legends players in Gdansk, providing:
- Professional player profiles with verification
- AI-powered performance insights (death heatmaps, timing analysis)
- Team formation and teammate finding tools
- Local leaderboard and community connection

## 🚀 Tech Stack

**Backend:**
- Python 3.9+
- Flask/FastAPI
- Supabase (Postgres)
- Riot Games API

**Frontend:**
- Next.js 14 + TypeScript
- Tailwind CSS
- Vercel hosting

**Services:**
- Email: Resend.com
- Analytics: Plausible
- Scheduled Jobs: GitHub Actions

## 📁 Project Structure

```
gdansk-lol-development/
├── backend/              # Python API & data processing
│   ├── api/             # API endpoints
│   ├── scripts/         # Data fetching scripts
│   ├── models/          # Database models
│   └── requirements.txt
├── frontend/            # Next.js application
├── docs/               # Documentation
└── README.md
```

## 🛠️ Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- Riot API Key (get from [developer.riotgames.com](https://developer.riotgames.com))
- Supabase account

### Backend Setup

1. Create virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file:
```bash
RIOT_API_KEY=your_key_here
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

4. Run data fetching script:
```bash
python scripts/fetch_players.py
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## 📋 Development Roadmap

- [x] Project planning and documentation
- [ ] Week 1: Foundation setup
- [ ] Week 2: Data collection from Riot API
- [ ] Week 3: Basic leaderboard website
- [ ] Week 4-5: Profile claiming and AI insights
- [ ] Week 6: Community launch and Kinguin partnership

See [NOTION_PLAN.md](./NOTION_PLAN.md) for detailed implementation plan.

## 🤝 Contributing

This is currently a personal project. Contributions may be accepted in the future.

## 📄 License

MIT License - see LICENSE file for details

## 📞 Contact

Pedro - Product Marketing Manager
- Project: Gdansk LoL Development Hub
- Partnership inquiries: Kinguin Lounge Gdansk

---

**Built with ❤️ for the Gdansk League of Legends community**
