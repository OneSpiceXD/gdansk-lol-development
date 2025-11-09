"""
Import collected player data from CSV to Supabase database
"""

import csv
import os
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file")

# CSV file path
CSV_FILE = "../data/collected_players.csv"


def read_csv_data(file_path: str) -> list:
    """Read player data from CSV file"""
    if not os.path.exists(file_path):
        print(f"Error: CSV file not found: {file_path}")
        return []

    players = []
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Convert string numbers to integers/floats
            player = {
                'summoner_name': row['summoner_name'],
                'puuid': row['puuid'],
                'summoner_id': row['summoner_id'],
                'summoner_level': int(row['summoner_level']),
                'tier': row['tier'],
                'rank': row['rank'],
                'lp': int(row['lp']),
                'wins': int(row['wins']),
                'losses': int(row['losses']),
                'winrate': float(row['winrate']),
                'last_fetched_at': row.get('collected_at', datetime.now().isoformat())
            }
            players.append(player)

    print(f"Loaded {len(players)} players from CSV")
    return players


def import_to_supabase(players: list):
    """
    Import player data to Supabase database

    Uses upsert to update existing players or insert new ones
    """
    # Initialize Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    successful = 0
    failed = 0
    errors = []

    print(f"\n=== Starting Supabase Import ===\n")

    for i, player in enumerate(players, 1):
        try:
            # Upsert player (insert or update if exists)
            result = supabase.table('players').upsert(player, on_conflict='puuid').execute()

            if result.data:
                successful += 1
                print(f"[{i}/{len(players)}] ✓ Imported: {player['summoner_name']}")
            else:
                failed += 1
                error_msg = f"No data returned for {player['summoner_name']}"
                errors.append(error_msg)
                print(f"[{i}/{len(players)}] ✗ Failed: {error_msg}")

        except Exception as e:
            failed += 1
            error_msg = f"{player['summoner_name']}: {str(e)}"
            errors.append(error_msg)
            print(f"[{i}/{len(players)}] ✗ Error: {error_msg}")

    # Summary
    print(f"\n=== Import Complete ===")
    print(f"✓ Successful: {successful}/{len(players)}")
    print(f"✗ Failed: {failed}/{len(players)}")

    if errors:
        print(f"\nErrors:")
        for error in errors[:10]:  # Show first 10 errors
            print(f"  - {error}")

    return successful, failed


def verify_import():
    """Verify the import by querying the database"""
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    print(f"\n=== Verifying Database ===\n")

    try:
        # Get total player count
        result = supabase.table('players').select('*', count='exact').execute()
        total_players = len(result.data) if result.data else 0

        print(f"Total players in database: {total_players}")

        if total_players > 0:
            # Get top 5 players
            top_players = supabase.table('players') \
                .select('summoner_name, tier, rank, lp') \
                .order('lp', desc=True) \
                .limit(5) \
                .execute()

            if top_players.data:
                print(f"\nTop 5 Players:")
                for i, player in enumerate(top_players.data, 1):
                    print(f"  {i}. {player['summoner_name']} - {player['tier']} {player['rank']} ({player['lp']} LP)")

            # Rank distribution
            rank_counts = {}
            all_players = supabase.table('players').select('tier').execute()
            if all_players.data:
                for player in all_players.data:
                    tier = player['tier']
                    rank_counts[tier] = rank_counts.get(tier, 0) + 1

                print(f"\nRank Distribution:")
                for tier in ['CHALLENGER', 'GRANDMASTER', 'MASTER', 'DIAMOND', 'EMERALD', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'IRON', 'UNRANKED']:
                    count = rank_counts.get(tier, 0)
                    if count > 0:
                        print(f"  {tier}: {count} players")

            print(f"\n✓ Database verification successful!")

    except Exception as e:
        print(f"✗ Verification error: {str(e)}")


def main():
    """Main execution function"""
    print("=" * 60)
    print("  Gdansk LoL Project - CSV to Supabase Import")
    print("=" * 60)

    # Check if CSV exists
    if not os.path.exists(CSV_FILE):
        print(f"\n✗ Error: CSV file not found: {CSV_FILE}")
        print(f"\nPlease run collect_players.py first to generate the CSV file.")
        return

    # Read CSV data
    players = read_csv_data(CSV_FILE)

    if not players:
        print("\n✗ No player data found in CSV")
        return

    # Import to Supabase
    successful, failed = import_to_supabase(players)

    if successful > 0:
        # Verify import
        verify_import()

        print(f"\n✓ Import complete! {successful} players imported to Supabase.")
        print(f"\nNext steps:")
        print(f"  1. Check Supabase dashboard to view your data")
        print(f"  2. Install Supabase client in Next.js: npm install @supabase/supabase-js")
        print(f"  3. Connect frontend to display leaderboard")

    else:
        print(f"\n✗ Import failed. Check your Supabase credentials and try again.")


if __name__ == "__main__":
    main()
