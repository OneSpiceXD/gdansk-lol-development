"""
Populate champions table with data from Riot Data Dragon API
One-time setup to get all champion data
"""

import os
import requests
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in .env file")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Data Dragon API (no API key needed - public CDN)
# Get latest version first
VERSION_URL = "https://ddragon.leagueoflegends.com/api/versions.json"
CHAMPION_DATA_URL = "https://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/champion.json"
CHAMPION_IMAGE_URL = "https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{champion_key}.png"

print("=" * 60)
print("  Populating Champions Table from Data Dragon")
print("=" * 60)
print()

# Step 1: Get latest version
print("[1/3] Fetching latest Data Dragon version...")
try:
    versions_response = requests.get(VERSION_URL, timeout=10)
    versions = versions_response.json()
    latest_version = versions[0]
    print(f"  [OK] Latest version: {latest_version}")
except Exception as e:
    print(f"  [FAIL] Error fetching versions: {str(e)}")
    exit(1)

# Step 2: Fetch all champion data
print(f"\n[2/3] Fetching champion data for version {latest_version}...")
try:
    champion_url = CHAMPION_DATA_URL.format(version=latest_version)
    champion_response = requests.get(champion_url, timeout=10)
    champion_data = champion_response.json()
    champions = champion_data['data']
    print(f"  [OK] Found {len(champions)} champions")
except Exception as e:
    print(f"  [FAIL] Error fetching champions: {str(e)}")
    exit(1)

# Step 3: Insert champions into Supabase
print(f"\n[3/3] Inserting {len(champions)} champions into Supabase...")
successful = 0
failed = 0

for champ_key, champ_info in champions.items():
    champion_id = int(champ_info['key'])
    champion_name = champ_info['name']
    champion_title = champ_info['title']
    image_url = CHAMPION_IMAGE_URL.format(version=latest_version, champion_key=champ_info['id'])

    champion_record = {
        'id': champion_id,
        'name': champion_name,
        'champion_key': champ_info['id'],
        'title': champion_title,
        'image_url': image_url
    }

    try:
        # Upsert (insert or update if exists)
        result = supabase.table('champions').upsert(champion_record, on_conflict='id').execute()
        if result.data:
            successful += 1
            if successful % 20 == 0:  # Progress update every 20 champions
                print(f"  Progress: {successful}/{len(champions)} champions inserted...")
        else:
            failed += 1
    except Exception as e:
        failed += 1
        print(f"  [FAIL] Error inserting {champion_name}: {str(e)}")

# Summary
print()
print("=" * 60)
print("  CHAMPION POPULATION COMPLETE")
print("=" * 60)
print(f"Successful: {successful}/{len(champions)}")
print(f"Failed: {failed}/{len(champions)}")
print()

if successful > 0:
    print("[SUCCESS] Champions table populated!")
    print()
    print("Sample champions in database:")
    # Query a few champions to verify
    sample = supabase.table('champions').select('*').limit(5).execute()
    if sample.data:
        for champ in sample.data:
            print(f"  - {champ['name']} (ID: {champ['id']}) - {champ['title']}")
    print()
    print(f"Image URL example: {image_url}")
else:
    print("[FAIL] No champions were inserted. Check errors above.")
