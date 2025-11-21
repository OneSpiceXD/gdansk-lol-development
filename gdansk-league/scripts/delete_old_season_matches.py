"""
Delete matches from previous seasons (Season 14 and earlier)
Keep only Season 15 (2025) matches
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import requests
import time

load_dotenv()

RIOT_API_KEY = os.getenv('RIOT_API_KEY')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

MATCH_V5_BASE = 'https://europe.api.riotgames.com'

def get_match_version(match_id: str) -> str:
    """Get game version for a match"""
    url = f'{MATCH_V5_BASE}/lol/match/v5/matches/{match_id}'
    headers = {'X-Riot-Token': RIOT_API_KEY}

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        return data['info']['gameVersion']
    else:
        print(f'[WARN] Could not fetch match {match_id}: {response.status_code}')
        return None

def main():
    # Get all match IDs from database
    print('Fetching all match IDs from database...')
    result = supabase.table('match_stats').select('match_id').execute()
    all_match_ids = list(set([record['match_id'] for record in result.data]))

    print(f'Found {len(all_match_ids)} unique matches in database\n')

    # Check each match version
    old_season_matches = []
    current_season_matches = []

    print('Checking match versions...')
    for i, match_id in enumerate(all_match_ids, 1):
        version = get_match_version(match_id)

        if version:
            # Season 15 started with version 15.x
            if version.startswith('14.') or int(version.split('.')[0]) < 15:
                old_season_matches.append(match_id)
                print(f'{i}/{len(all_match_ids)} - {match_id} - Version {version} [OLD SEASON - WILL DELETE]')
            else:
                current_season_matches.append(match_id)
                print(f'{i}/{len(all_match_ids)} - {match_id} - Version {version} [CURRENT SEASON - KEEP]')

        # Rate limiting
        time.sleep(0.5)

    print(f'\n{"="*60}')
    print(f'Summary:')
    print(f'  Old season matches (to delete): {len(old_season_matches)}')
    print(f'  Current season matches (to keep): {len(current_season_matches)}')
    print(f'{"="*60}\n')

    if not old_season_matches:
        print('[OK] No old season matches to delete!')
        return

    # Delete old season matches from both tables
    print(f'Deleting {len(old_season_matches)} old season matches...\n')

    for i, match_id in enumerate(old_season_matches, 1):
        print(f'Deleting {i}/{len(old_season_matches)}: {match_id}')

        # Delete from match_stats
        try:
            supabase.table('match_stats').delete().eq('match_id', match_id).execute()
            print(f'  [OK] Deleted from match_stats')
        except Exception as e:
            print(f'  [ERROR] Failed to delete from match_stats: {e}')

        # Delete from match_analytics_summary
        try:
            supabase.table('match_analytics_summary').delete().eq('match_id', match_id).execute()
            print(f'  [OK] Deleted from match_analytics_summary')
        except Exception as e:
            print(f'  [ERROR] Failed to delete from match_analytics_summary: {e}')

    print(f'\n{"="*60}')
    print(f'[OK] Cleanup complete!')
    print(f'Deleted {len(old_season_matches)} old season matches')
    print(f'Kept {len(current_season_matches)} current season matches')
    print(f'{"="*60}')

if __name__ == '__main__':
    main()
