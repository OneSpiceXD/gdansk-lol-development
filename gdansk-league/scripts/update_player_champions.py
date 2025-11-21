"""
Update players with their top 3 champion mastery data
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env file")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_top_champions_for_player(puuid: str, count: int = 3):
    """Fetch top champions using the existing riot_api module"""
    import requests
    import time

    API_KEY = os.getenv('RIOT_API_KEY')
    REGION = "euw1"

    url = f"https://{REGION}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top"
    headers = {"X-Riot-Token": API_KEY}
    params = {"count": count}

    try:
        time.sleep(1.2)  # Rate limit protection
        response = requests.get(url, headers=headers, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            return None
    except Exception as e:
        print(f"  [FAIL] Error fetching champions: {str(e)}")
        return None

print("=" * 60)
print("  Updating Players with Top 3 Champions")
print("=" * 60)
print()

# Fetch all players from database
print("[1/2] Fetching players from database...")
players_result = supabase.table('players').select('*').execute()
players = players_result.data

if not players:
    print("  [FAIL] No players found in database")
    exit(1)

print(f"  [OK] Found {len(players)} players")

# Update each player with top 3 champions
print(f"\n[2/2] Updating champion mastery data...")
successful = 0
failed = 0

for i, player in enumerate(players, 1):
    summoner_name = player['summoner_name']
    puuid = player['puuid']

    print(f"\n[{i}/{len(players)}] {summoner_name}")
    print(f"  Fetching top 3 champions...")

    # Fetch top 3 champions from Riot API
    top_champions = get_top_champions_for_player(puuid, count=3)

    if not top_champions or len(top_champions) == 0:
        print(f"  [FAIL] No champion data found")
        failed += 1
        continue

    # Prepare update data
    update_data = {}

    for idx, champ in enumerate(top_champions[:3], 1):
        champion_id = champ['championId']
        mastery_points = champ['championPoints']

        update_data[f'top_champion_{idx}_id'] = champion_id
        update_data[f'top_champion_{idx}_points'] = mastery_points

        print(f"  Champion {idx}: ID {champion_id} ({mastery_points:,} points)")

    # Update player in database
    try:
        result = supabase.table('players').update(update_data).eq('puuid', puuid).execute()

        if result.data:
            successful += 1
            print(f"  [OK] Updated champion data")
        else:
            failed += 1
            print(f"  [FAIL] Failed to update")
    except Exception as e:
        failed += 1
        print(f"  [FAIL] Error updating: {str(e)}")

# Summary
print()
print("=" * 60)
print("  UPDATE COMPLETE")
print("=" * 60)
print(f"Successful: {successful}/{len(players)}")
print(f"Failed: {failed}/{len(players)}")
print()

if successful > 0:
    print("[SUCCESS] Players updated with champion mastery data!")
    print()
    print("Next: Check your Supabase Table Editor")
    print("  - Go to 'players' table")
    print("  - You should see top_champion_1_id, top_champion_2_id, top_champion_3_id")
    print("  - And their corresponding mastery points")
else:
    print("[FAIL] No players were updated. Check errors above.")
