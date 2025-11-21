"""
Update Profile Icon IDs for all players in database
Fetches profile icon ID from Riot API and updates Supabase
"""

import os
import sys
from typing import List, Dict
from dotenv import load_dotenv
from supabase import create_client, Client
from riot_api import get_summoner_by_puuid
import time

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file")
    sys.exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_all_players() -> List[Dict]:
    """
    Fetch all players from Supabase

    Returns:
        List of player dictionaries
    """
    print("Fetching players from database...")
    response = supabase.table('players').select('id, summoner_name, puuid, profile_icon_id').execute()

    if response.data:
        print(f"[OK] Found {len(response.data)} players")
        return response.data
    else:
        print("[ERROR] No players found in database")
        return []


def update_player_profile_icon(player_id: str, profile_icon_id: int) -> bool:
    """
    Update profile icon ID for a player in Supabase

    Args:
        player_id: Player's UUID in database
        profile_icon_id: Profile icon ID from Riot API

    Returns:
        True if successful, False otherwise
    """
    try:
        response = supabase.table('players').update({
            'profile_icon_id': profile_icon_id
        }).eq('id', player_id).execute()

        return True
    except Exception as e:
        print(f"  [ERROR] Database update error: {str(e)}")
        return False


def update_all_profile_icons():
    """
    Main function to update profile icons for all players
    """
    print("=" * 60)
    print("  Update Profile Icons")
    print("=" * 60)
    print()

    # Get all players
    players = get_all_players()

    if not players:
        print("\n[ERROR] No players to update")
        return

    # Track stats
    successful = 0
    failed = 0
    skipped = 0

    print(f"\nProcessing {len(players)} players...\n")

    for i, player in enumerate(players, 1):
        summoner_name = player['summoner_name']
        puuid = player['puuid']
        current_icon_id = player.get('profile_icon_id', 0)

        print(f"[{i}/{len(players)}] {summoner_name}")

        # Skip if already has a profile icon (not 0)
        if current_icon_id and current_icon_id != 0:
            print(f"  [SKIP] Already has profile icon ID: {current_icon_id}")
            skipped += 1
            continue

        try:
            # Fetch summoner data from Riot API
            summoner_data = get_summoner_by_puuid(puuid)

            if not summoner_data:
                print(f"  [ERROR] Could not fetch summoner data from Riot API")
                failed += 1
                continue

            profile_icon_id = summoner_data.get('profileIconId', 29)  # Default to icon 29 if not found

            # Update in database
            if update_player_profile_icon(player['id'], profile_icon_id):
                print(f"  [OK] Updated profile icon ID: {profile_icon_id}")
                successful += 1
            else:
                print(f"  [ERROR] Failed to update database")
                failed += 1

            # Small delay to respect rate limits
            time.sleep(0.5)

        except Exception as e:
            print(f"  [ERROR] Error: {str(e)}")
            failed += 1

    # Summary
    print("\n" + "=" * 60)
    print("  Summary")
    print("=" * 60)
    print(f"[OK] Successfully updated: {successful}")
    print(f"[SKIP] Skipped (already set): {skipped}")
    print(f"[ERROR] Failed: {failed}")
    print(f"Total processed: {len(players)}")

    if successful > 0:
        print(f"\n[OK] Profile icons updated successfully!")

    if failed > 0:
        print(f"\n[WARN] {failed} players failed to update")


if __name__ == "__main__":
    update_all_profile_icons()
