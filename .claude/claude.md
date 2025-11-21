# Gdańsk League Hub - Development Guidelines

## Project Overview
Building a hyper-local League of Legends talent network for Poland, starting in Gdańsk. The platform tracks player rankings, provides AI insights, facilitates team formation, and organizes local tournaments.

## Technology Stack
- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS v3.4
- **Language**: TypeScript
- **Data**: Mock JSON data (Riot API integration planned)
- **Deployment**: TBD

## Design Principles

### Typography & Copy
- **NO TITLE CASE**: Use sentence case for headings and UI text
  - ✅ Good: "See where you rank in Gdańsk"
  - ❌ Bad: "See Where You Rank In Gdańsk"
  - Exception: Brand name "Gdańsk League Hub" and proper nouns
- **User-focused copy**: Use "you/your" not "our/we"
- **Specific numbers**: "87 players" not "many users"
- **Benefit-driven**: Answer "what's in it for me?" not just features

### Color System
- **Primary Background**: #0A0E27 (navy)
- **Accent Cyan**: #00D4FF (for highlights, borders, data points)
- **Accent Red**: #DC143C (for CTAs and important actions)
- **Use red for primary CTAs**: Email capture, profile claims
- **Use cyan for**: Data highlights, secondary actions, borders

### Component Structure
- Keep components simple and focused
- Use sentence case for all user-facing text
- Prioritize mobile responsiveness
- Include hover states and transitions

## Content Guidelines
- Focus on local context (Gdańsk, Poland)
- Show real movement and trends (not just static data)
- Create FOMO with live activity feeds
- Emphasize uniqueness vs OP.GG (don't over-compare)

## Development Standards
- Use TypeScript for type safety
- Follow Next.js 16 best practices
- Keep CSS variables in globals.css
- Mock data goes in /data directory
- Components go in /components directory
