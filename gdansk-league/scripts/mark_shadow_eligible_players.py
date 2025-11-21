"""
Mark Shadow-Eligible Players

Identifies Emerald+ players in the database and marks them as eligible to be shadow targets.
Players are categorized into:
- EMERALD_PLUS: Emerald and Diamond players (shadows for Iron-Platinum users)
- MASTER_PLUS: Master, Grandmaster, Challenger (shadows for Emerald+ users)

Usage: python mark_shadow_eligible_players.py
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv(override=True)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY')

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def mark_shadow_eligible():
    """Mark Emerald+ players as shadow-eligible"""

    print("=" * 80)
    print("MARKING SHADOW-ELIGIBLE PLAYERS")
    print("=" * 80)
    print()

    # Get all players from database
    try:
        result = supabase.table('players').select('puuid, summoner_name, tier, rank').execute()
        all_players = result.data

        print(f"Total players in database: {len(all_players)}")
        print()

        # Categorize players
        emerald_plus_players = []
        master_plus_players = []

        for player in all_players:
            tier = player.get('tier', '').upper()

            if tier in ['EMERALD', 'DIAMOND']:
                emerald_plus_players.append(player)
            elif tier in ['MASTER', 'GRANDMASTER', 'CHALLENGER']:
                master_plus_players.append(player)

        print(f"Found {len(emerald_plus_players)} Emerald/Diamond players")
        print(f"Found {len(master_plus_players)} Master+ players")
        print()

        # Update Emerald/Diamond players
        if emerald_plus_players:
            print("Marking Emerald/Diamond players as EMERALD_PLUS shadows...")
            for player in emerald_plus_players:
                try:
                    supabase.table('players').update({
                        'is_shadow_eligible': True,
                        'shadow_tier': 'EMERALD_PLUS'
                    }).eq('puuid', player['puuid']).execute()
                except Exception as e:
                    print(f"  Error updating {player['summoner_name']}: {e}")

            print(f"[OK] Marked {len(emerald_plus_players)} Emerald/Diamond players")
            print()

        # Update Master+ players
        if master_plus_players:
            print("Marking Master+ players as MASTER_PLUS shadows...")
            for player in master_plus_players:
                try:
                    supabase.table('players').update({
                        'is_shadow_eligible': True,
                        'shadow_tier': 'MASTER_PLUS'
                    }).eq('puuid', player['puuid']).execute()
                except Exception as e:
                    print(f"  Error updating {player['summoner_name']}: {e}")

            print(f"[OK] Marked {len(master_plus_players)} Master+ players")
            print()

        # Summary
        print("=" * 80)
        print("SUMMARY")
        print("=" * 80)
        print(f"Total shadow-eligible players: {len(emerald_plus_players) + len(master_plus_players)}")
        print(f"  - EMERALD_PLUS tier: {len(emerald_plus_players)}")
        print(f"  - MASTER_PLUS tier: {len(master_plus_players)}")
        print()

        # Check role distribution
        print("Checking role distribution (run calculate_player_roles.py if roles are missing)...")
        result = supabase.table('players').select('main_role').eq('is_shadow_eligible', True).execute()
        role_counts = {}
        no_role_count = 0

        for player in result.data:
            role = player.get('main_role')
            if role:
                role_counts[role] = role_counts.get(role, 0) + 1
            else:
                no_role_count += 1

        print()
        print("Shadow-eligible players by role:")
        for role, count in sorted(role_counts.items()):
            print(f"  {role}: {count} players")
        if no_role_count > 0:
            print(f"  (No role assigned): {no_role_count} players")
        print()

        if no_role_count > 0:
            print("[WARNING] Some shadow-eligible players don't have roles assigned.")
            print("   Run: python calculate_player_roles.py")
        print()

        print("=" * 80)
        print("COMPLETE!")
        print("=" * 80)

    except Exception as e:
        print(f"\n[ERROR] Failed to mark shadow-eligible players: {e}")
        raise

if __name__ == "__main__":
    mark_shadow_eligible()
