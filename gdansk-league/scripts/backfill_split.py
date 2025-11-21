"""
Backfill split column for existing match_stats records based on patch version
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

def get_split_info(patch_number: int) -> dict:
    """Calculate split info based on patch number"""
    # Season 15 splits: 1-8 (Split 1), 9-16 (Split 2), 17-22 (Split 3)
    if patch_number <= 8:
        return {
            'split_number': 1,
            'split_name': 'Welcome to Noxus'
        }
    elif patch_number <= 16:
        return {
            'split_number': 2,
            'split_name': 'Spirit Blossom Beyond'
        }
    else:
        return {
            'split_number': 3,
            'split_name': 'Trials of Twilight'
        }

def get_match_patch(match_id: str):
    """Get patch version from Riot API"""
    url = f'{MATCH_V5_BASE}/lol/match/v5/matches/{match_id}'
    headers = {'X-Riot-Token': RIOT_API_KEY}

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        game_version = data['info']['gameVersion']
        version_parts = game_version.split('.')
        season = int(version_parts[0])
        patch_number = int(version_parts[1])
        patch = f"{season}.{patch_number}"

        split_info = get_split_info(patch_number)

        return {
            'version': game_version,
            'patch': patch,
            'patch_number': patch_number,
            'split_number': split_info['split_number'],
            'split_name': split_info['split_name']
        }
    else:
        print(f'[ERROR] Failed to fetch match {match_id}: {response.status_code}')
        return None

def main():
    # Get all match_stats records
    print('Fetching all match_stats records...')
    result = supabase.table('match_stats').select('id, match_id, split_number, split_name, patch').execute()

    records_to_update = []
    for record in result.data:
        if record['split_number'] is None or record['split_name'] is None or record['patch'] is None:
            records_to_update.append(record)

    print(f'Found {len(records_to_update)} records missing split/patch data')
    print(f'Total records: {len(result.data)}\n')

    if not records_to_update:
        print('[OK] All records already have split and patch data!')
        return

    # Update each record
    updated_count = 0
    for i, record in enumerate(records_to_update, 1):
        match_id = record['match_id']
        record_id = record['id']

        print(f'Processing {i}/{len(records_to_update)}: {match_id}')

        patch_data = get_match_patch(match_id)
        if patch_data:
            # Update the record
            try:
                supabase.table('match_stats').update({
                    'split_number': patch_data['split_number'],
                    'split_name': patch_data['split_name'],
                    'patch': patch_data['patch']
                }).eq('id', record_id).execute()

                print(f'  [OK] Updated - Patch {patch_data["patch"]} | Split {patch_data["split_number"]}: {patch_data["split_name"]}')
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
