"""
Update Seasonal Champion Statistics
Fetches champion stats from recent matches and updates player_champion_stats table
"""

import os
import sys
from typing import List, Dict, Optional
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client
from riot_api import get_champion_stats_from_matches
import time

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
# Try to use service role key first (bypasses RLS), fall back to anon key
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) must be set in .env file")
    sys.exit(1)

# Initialize Supabase client
print(f"Using {'service role' if os.getenv('SUPABASE_SERVICE_ROLE_KEY') else 'anon'} key for database access")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Current season (update this when new season starts)
CURRENT_SEASON = "S3_2025"
# Season 3 2025 started on January 9, 2025
SEASON_START_DATE = datetime(2025, 1, 9, 0, 0, 0)  # UTC
SEASON_START_TIMESTAMP = int(SEASON_START_DATE.timestamp())

# Number of matches to analyze for seasonal stats
MATCH_COUNT = 100  # Analyze up to 100 ranked games (will get all games from season start)


def get_current_season() -> str:
    """
    Determine current League of Legends season
    Can be enhanced to auto-detect based on date or API data

    Returns:
        Season string in format 'S{number}_{year}'
    """
    # For now, return hardcoded season
    # TODO: Implement auto-detection based on Riot's season schedule
    return CURRENT_SEASON


def get_all_players() -> List[Dict]:
    """
    Fetch all players from Supabase

    Returns:
        List of player dictionaries with id, summoner_name, puuid
    """
    print("Fetching players from database...")
    response = supabase.table('players').select('id, summoner_name, puuid').execute()

    if response.data:
        print(f"[OK] Found {len(response.data)} players")
        return response.data
    else:
        print("[ERROR] No players found in database")
        return []


def get_champion_id_by_riot_id(riot_champion_id: int) -> Optional[str]:
    """
    Get database champion ID from Riot's champion ID

    Args:
        riot_champion_id: Riot Games champion ID

    Returns:
        Database champion UUID or None if not found
    """
    response = supabase.table('champions').select('id').eq('id', riot_champion_id).execute()

    if response.data and len(response.data) > 0:
        return response.data[0]['id']

    return None


def upsert_champion_stats(player_id: str, champion_id: int, season: str, stats: Dict) -> bool:
    """
    Insert or update champion statistics in database

    Args:
        player_id: Player UUID
        champion_id: Champion ID (Riot API ID)
        season: Season identifier (e.g., 'S3_2025')
        stats: Dictionary with games, wins, losses, last_played

    Returns:
        True if successful, False otherwise
    """
    try:
        # Convert timestamp to datetime
        last_played = None
        if stats.get('last_played') and stats['last_played'] > 0:
            last_played = datetime.fromtimestamp(stats['last_played'] / 1000).isoformat()

        data = {
            'player_id': player_id,
            'champion_id': champion_id,
            'season': season,
            'games_played': stats['games'],
            'wins': stats['wins'],
            'losses': stats['losses'],
            'last_played_at': last_played,
            'updated_at': datetime.now().isoformat()
        }

        # Upsert (insert or update if exists)
        response = supabase.table('player_champion_stats').upsert(
            data,
            on_conflict='player_id,champion_id,season'
        ).execute()

        return True

    except Exception as e:
        print(f"  [ERROR] Database error: {str(e)}")
        return False


def update_player_seasonal_stats(player: Dict, season: str) -> tuple[int, int]:
    """
    Update seasonal champion statistics for a single player

    Args:
        player: Player dictionary with id, summoner_name, puuid
        season: Season identifier

    Returns:
        Tuple of (successful_updates, failed_updates)
    """
    summoner_name = player['summoner_name']
    puuid = player['puuid']
    player_id = player['id']

    print(f"\nProcessing: {summoner_name}")
    print(f"  Analyzing ranked matches since season start ({SEASON_START_DATE.strftime('%Y-%m-%d')})...")

    # Fetch champion stats from matches since season start
    champion_stats = get_champion_stats_from_matches(puuid, match_count=MATCH_COUNT, start_time=SEASON_START_TIMESTAMP)

    if not champion_stats:
        print(f"  [WARN] No champion stats found")
        return (0, 0)

    print(f"  Found stats for {len(champion_stats)} champions")

    successful = 0
    failed = 0

    # Sort champions by games played (descending)
    sorted_champions = sorted(
        champion_stats.items(),
        key=lambda x: x[1]['games'],
        reverse=True
    )

    # Update database for each champion
    for champion_id, stats in sorted_champions:
        if upsert_champion_stats(player_id, champion_id, season, stats):
            successful += 1
        else:
            failed += 1

    # Show top 3 most played
    top_3 = sorted_champions[:3]
    if top_3:
        print(f"  [OK] Top 3 Champions:")
        for i, (champ_id, stats) in enumerate(top_3, 1):
            winrate = (stats['wins'] / stats['games'] * 100) if stats['games'] > 0 else 0
            print(f"    {i}. Champion #{champ_id}: {stats['games']}G {stats['wins']}W {stats['losses']}L ({winrate:.1f}%)")

    return (successful, failed)


def update_all_seasonal_stats():
    """
    Main function to update seasonal champion stats for all players
    """
    print("=" * 70)
    print("  Update Seasonal Champion Statistics")
    print("=" * 70)
    print(f"  Season: {CURRENT_SEASON}")
    print(f"  Match Analysis: Last {MATCH_COUNT} ranked games")
    print("=" * 70)
    print()

    # Get current season
    season = get_current_season()

    # Get all players
    players = get_all_players()

    if not players:
        print("\n[ERROR] No players to update")
        return

    # Track overall stats
    total_successful = 0
    total_failed = 0
    players_processed = 0
    players_failed = 0

    print(f"Processing {len(players)} players...\n")

    for i, player in enumerate(players, 1):
        print(f"[{i}/{len(players)}]", end=" ")

        try:
            successful, failed = update_player_seasonal_stats(player, season)

            if successful > 0:
                total_successful += successful
                players_processed += 1
                print(f"  ✓ Updated {successful} champions")

            if failed > 0:
                total_failed += failed
                players_failed += 1
                print(f"  ✗ {failed} failed")

            # Small delay to respect rate limits
            time.sleep(0.5)

        except Exception as e:
            print(f"  [ERROR] Failed to process player: {str(e)}")
            players_failed += 1

    # Summary
    print("\n" + "=" * 70)
    print("  Summary")
    print("=" * 70)
    print(f"Season: {season}")
    print(f"Players successfully processed: {players_processed}/{len(players)}")
    print(f"Total champion stats updated: {total_successful}")
    if total_failed > 0:
        print(f"Total failures: {total_failed}")
    if players_failed > 0:
        print(f"Players with errors: {players_failed}")

    print()
    if players_processed == len(players) and total_failed == 0:
        print("[OK] All seasonal champion stats updated successfully!")
    elif players_processed > 0:
        print(f"[OK] Seasonal stats updated for {players_processed} players")
    else:
        print("[ERROR] No players were updated successfully")


if __name__ == "__main__":
    update_all_seasonal_stats()
