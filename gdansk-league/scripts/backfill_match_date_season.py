"""
Backfill match_date and season for existing match_stats records
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import requests
import time
from datetime import datetime

load_dotenv()

RIOT_API_KEY = os.getenv('RIOT_API_KEY')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

MATCH_V5_BASE = 'https://europe.api.riotgames.com'

def get_match_metadata(match_id: str):
    """Get match metadata from Riot API"""
    url = f'{MATCH_V5_BASE}/lol/match/v5/matches/{match_id}'
    headers = {'X-Riot-Token': RIOT_API_KEY}

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        game_creation_ms = data['info']['gameCreation']
        match_date = datetime.fromtimestamp(game_creation_ms / 1000)
        game_version = data['info']['gameVersion']
        season = int(game_version.split('.')[0])

        return {
            'match_date': match_date.isoformat(),
            'season': season,
            'version': game_version
        }
    else:
        print(f'[ERROR] Failed to fetch match {match_id}: {response.status_code}')
        return None

def main():
    # Get all match_stats records
    print('Fetching all match_stats records...')
    result = supabase.table('match_stats').select('id, match_id, match_date, season').execute()

    records_to_update = []
    for record in result.data:
        if record['match_date'] is None or record['season'] is None:
            records_to_update.append(record)

    print(f'Found {len(records_to_update)} records missing match_date/season')
    print(f'Total records: {len(result.data)}\n')

    if not records_to_update:
        print('[OK] All records already have match_date and season!')
        return

    # Update each record
    updated_count = 0
    for i, record in enumerate(records_to_update, 1):
        match_id = record['match_id']
        record_id = record['id']

        print(f'Processing {i}/{len(records_to_update)}: {match_id}')

        metadata = get_match_metadata(match_id)
        if metadata:
            # Update the record
            try:
                supabase.table('match_stats').update({
                    'match_date': metadata['match_date'],
                    'season': metadata['season']
                }).eq('id', record_id).execute()

                print(f'  [OK] Updated - Date: {metadata["match_date"]}, Season: {metadata["season"]} (v{metadata["version"]})')
                updated_count += 1
            except Exception as e:
                print(f'  [ERROR] Failed to update: {e}')

        # Rate limiting
        time.sleep(0.5)

    print(f'\n{"="*60}')
    print(f'[OK] Backfill complete!')
    print(f'Updated {updated_count}/{len(records_to_update)} records')
    print(f'{"="*60}')

if __name__ == '__main__':
    main()
