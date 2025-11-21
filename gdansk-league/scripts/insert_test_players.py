"""
Insert 4 test players into Supabase
Quick script to add the 4 successfully fetched players to test the database
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client
from riot_api import get_player_full_data

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env file")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Test players (already verified they work)
test_players = [
    "petRoXD#EUW",
    "twtv shiftlol5#2005",
    "TwTv Keksereslol#katar",
    "QQ Pawelek6#EUW"
]

print("=" * 60)
print("  Inserting 4 Test Players to Supabase")
print("=" * 60)
print()

successful = 0
failed = 0

for i, player_name in enumerate(test_players, 1):
    print(f"[{i}/4] Fetching and inserting: {player_name}")

    # Fetch player data from Riot API
    player_data = get_player_full_data(player_name)

    if not player_data:
        print(f"  [FAIL] Failed to fetch data for {player_name}")
        failed += 1
        continue

    # Prepare data for Supabase (only fields that match our schema)
    db_record = {
        'summoner_name': player_data['summoner_name'],
        'puuid': player_data['puuid'],
        'tier': player_data['tier'],
        'rank': player_data['rank'],
        'lp': player_data['lp'],
        'wins': player_data['wins'],
        'losses': player_data['losses'],
        'winrate': player_data['winrate'],
        'summoner_level': player_data['summoner_level']
    }

    try:
        # Insert into Supabase
        result = supabase.table('players').insert(db_record).execute()

        if result.data:
            successful += 1
            print(f"  [OK] Inserted: {player_data['summoner_name']} - {player_data['tier']} {player_data['rank']} ({player_data['lp']} LP)")
        else:
            failed += 1
            print(f"  [FAIL] Failed to insert: {player_name}")

    except Exception as e:
        failed += 1
        print(f"  [FAIL] Error inserting {player_name}: {str(e)}")

# Summary
print()
print("=" * 60)
print("  INSERTION COMPLETE")
print("=" * 60)
print(f"Successful: {successful}/4")
print(f"Failed: {failed}/4")
print()

if successful > 0:
    print("[SUCCESS] Players added to Supabase!")
    print()
    print("Next steps:")
    print("  1. Go to Supabase Dashboard -> Table Editor")
    print("  2. Click 'players' table")
    print("  3. View your test data!")
else:
    print("[FAIL] No players were inserted. Check errors above.")
