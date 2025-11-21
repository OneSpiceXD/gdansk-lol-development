"""
Calculate player main roles from match history
Analyzes last 20 ranked matches to determine most played role
"""

import os
import requests
import time
from collections import Counter
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

API_KEY = os.getenv('RIOT_API_KEY')
CONTINENT = "europe"
REGION = "euw1"

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_recent_match_ids(puuid: str, count: int = 20):
    """Fetch recent ranked match IDs"""
    url = f"https://{CONTINENT}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
    headers = {"X-Riot-Token": API_KEY}
    params = {
        "type": "ranked",
        "count": count
    }

    try:
        time.sleep(1.2)
        response = requests.get(url, headers=headers, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"  [FAIL] Error fetching matches: {response.status_code}")
            return None
    except Exception as e:
        print(f"  [FAIL] Error: {str(e)}")
        return None

def get_match_details(match_id: str):
    """Fetch detailed match information"""
    url = f"https://{CONTINENT}.api.riotgames.com/lol/match/v5/matches/{match_id}"
    headers = {"X-Riot-Token": API_KEY}

    try:
        time.sleep(1.2)
        response = requests.get(url, headers=headers, params={}, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            return None
    except Exception as e:
        return None

def get_player_role_from_match(match_data, puuid: str):
    """Extract the role/position this player played in a match"""
    participants = match_data['info']['participants']

    for participant in participants:
        if participant['puuid'] == puuid:
            # teamPosition can be: TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY
            position = participant.get('teamPosition', '')
            # Also check individualPosition as backup
            if not position or position == '':
                position = participant.get('individualPosition', '')
            return position

    return None

def calculate_main_role(puuid: str, summoner_name: str):
    """Calculate main role from last 20 ranked matches"""
    print(f"\nCalculating role for: {summoner_name}")
    print(f"  PUUID: {puuid[:20]}...")

    # Step 1: Get match IDs
    print(f"  [1/3] Fetching last 20 ranked match IDs...")
    match_ids = get_recent_match_ids(puuid, count=20)

    if not match_ids or len(match_ids) == 0:
        print(f"  [FAIL] No ranked matches found")
        return None

    print(f"  [OK] Found {len(match_ids)} matches")

    # Step 2: Fetch match details and extract roles
    print(f"  [2/3] Analyzing matches for role data...")
    roles = []

    for i, match_id in enumerate(match_ids[:20], 1):  # Limit to 20 to avoid rate limits
        if i % 5 == 0:
            print(f"    Progress: {i}/{len(match_ids[:20])} matches analyzed...")

        match_data = get_match_details(match_id)
        if match_data:
            role = get_player_role_from_match(match_data, puuid)
            if role and role != '':
                roles.append(role)

    if not roles:
        print(f"  [FAIL] Could not determine role from matches")
        return None

    # Step 3: Calculate most played role
    print(f"  [3/3] Calculating main role...")
    role_counts = Counter(roles)
    main_role = role_counts.most_common(1)[0][0]

    print(f"  [OK] Role distribution:")
    for role, count in role_counts.most_common():
        percentage = (count / len(roles)) * 100
        print(f"    - {role}: {count}/{len(roles)} ({percentage:.0f}%)")

    print(f"  [RESULT] Main role: {main_role}")

    return main_role

# Main execution
print("=" * 60)
print("  Calculate Player Main Roles")
print("=" * 60)

# Fetch all players from database
print("\nFetching players from database...")
players_result = supabase.table('players').select('*').execute()
players = players_result.data

if not players:
    print("[FAIL] No players found")
    exit(1)

print(f"[OK] Found {len(players)} players")

# Process each player
successful = 0
failed = 0

for i, player in enumerate(players, 1):
    summoner_name = player['summoner_name']
    puuid = player['puuid']
    player_id = player['id']

    print(f"\n{'=' * 60}")
    print(f"[{i}/{len(players)}] Processing: {summoner_name}")
    print(f"{'=' * 60}")

    main_role = calculate_main_role(puuid, summoner_name)

    if main_role:
        # Update database
        try:
            result = supabase.table('players').update({'main_role': main_role}).eq('id', player_id).execute()
            if result.data:
                successful += 1
                print(f"\n[OK] Updated {summoner_name} with role: {main_role}")
            else:
                failed += 1
                print(f"\n[FAIL] Failed to update database")
        except Exception as e:
            failed += 1
            print(f"\n[FAIL] Error updating: {str(e)}")
    else:
        failed += 1

# Summary
print("\n" + "=" * 60)
print("  ROLE CALCULATION COMPLETE")
print("=" * 60)
print(f"Successful: {successful}/{len(players)}")
print(f"Failed: {failed}/{len(players)}")
print()

if successful > 0:
    print("[SUCCESS] Player roles updated!")
    print("\nCheck Supabase Table Editor:")
    print("  - Go to 'players' table")
    print("  - You should see main_role column populated")
else:
    print("[FAIL] No roles were calculated. Check errors above.")
