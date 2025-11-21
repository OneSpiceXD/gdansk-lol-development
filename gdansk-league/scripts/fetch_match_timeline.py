"""
Fetch match timeline data for a player and store in match_events and match_timeline_snapshots tables
Usage: python fetch_match_timeline.py
"""

import os
import time
import requests
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

RIOT_API_KEY = os.getenv('RIOT_API_KEY')
SUPABASE_URL = os.getenv('SUPABASE_URL')
# Use service role key for bypassing RLS (server-side only, never expose to frontend)
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY')

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Riot API endpoints
ACCOUNT_V1_BASE = "https://europe.api.riotgames.com"
MATCH_V5_BASE = "https://europe.api.riotgames.com"

def get_puuid(game_name: str, tag_line: str) -> str:
    """Get PUUID from Riot ID (game name + tag line)"""
    url = f"{ACCOUNT_V1_BASE}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
    headers = {"X-Riot-Token": RIOT_API_KEY}

    print(f"Fetching PUUID for {game_name}#{tag_line}...")
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise Exception(f"Failed to get PUUID: {response.status_code} - {response.text}")

    data = response.json()
    puuid = data['puuid']
    print(f"[OK] Found PUUID: {puuid}")
    return puuid

def get_match_ids(puuid: str, count: int = 3) -> list:
    """Get recent match IDs for a player"""
    url = f"{MATCH_V5_BASE}/lol/match/v5/matches/by-puuid/{puuid}/ids"
    params = {"start": 0, "count": count}
    headers = {"X-Riot-Token": RIOT_API_KEY}

    print(f"Fetching last {count} match IDs...")
    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        raise Exception(f"Failed to get match IDs: {response.status_code} - {response.text}")

    match_ids = response.json()
    print(f"[OK] Found {len(match_ids)} matches: {match_ids}")
    return match_ids

def get_match_timeline(match_id: str) -> dict:
    """Get timeline data for a specific match"""
    url = f"{MATCH_V5_BASE}/lol/match/v5/matches/{match_id}/timeline"
    headers = {"X-Riot-Token": RIOT_API_KEY}

    print(f"Fetching timeline for match {match_id}...")
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise Exception(f"Failed to get timeline: {response.status_code} - {response.text}")

    timeline = response.json()
    print(f"[OK] Timeline fetched successfully")
    return timeline

def store_match_events(match_id: str, timeline: dict):
    """Extract and store match events from timeline"""
    events_to_insert = []

    # Process all frames to extract events
    for frame in timeline['info']['frames']:
        if 'events' not in frame:
            continue

        for event in frame['events']:
            event_type = event.get('type')

            # We're interested in: CHAMPION_KILL, BUILDING_KILL, ELITE_MONSTER_KILL
            if event_type not in ['CHAMPION_KILL', 'BUILDING_KILL', 'ELITE_MONSTER_KILL']:
                continue

            # Extract common fields
            event_data = {
                'match_id': match_id,
                'timestamp_ms': event.get('timestamp'),
                'event_type': event_type,
                'event_data': event  # Store full event as JSONB
            }

            # Extract position if available
            if 'position' in event:
                event_data['position_x'] = event['position'].get('x')
                event_data['position_y'] = event['position'].get('y')

            # Extract participants based on event type
            if event_type == 'CHAMPION_KILL':
                event_data['killer_id'] = event.get('killerId')
                event_data['victim_id'] = event.get('victimId')
                event_data['participant_id'] = event.get('killerId')

                # Store assisting participants as array
                assisting = event.get('assistingParticipantIds', [])
                if assisting:
                    event_data['assisting_participant_ids'] = assisting

            elif event_type == 'BUILDING_KILL':
                event_data['killer_id'] = event.get('killerId')
                event_data['participant_id'] = event.get('killerId')

            elif event_type == 'ELITE_MONSTER_KILL':
                event_data['killer_id'] = event.get('killerId')
                event_data['participant_id'] = event.get('killerId')

            events_to_insert.append(event_data)

    # Insert into Supabase
    if events_to_insert:
        print(f"Storing {len(events_to_insert)} events...")
        result = supabase.table('match_events').insert(events_to_insert).execute()
        print(f"[OK] Stored {len(events_to_insert)} events")
    else:
        print("[WARN] No events found to store")

def store_timeline_snapshots(match_id: str, timeline: dict):
    """Extract and store timeline snapshots from frames"""
    snapshots_to_insert = []

    # Process frames (typically every 60 seconds)
    for frame in timeline['info']['frames']:
        timestamp_ms = frame['timestamp']

        # Skip frame 0 (game start has no meaningful position data)
        if timestamp_ms == 0:
            continue

        # Extract participant frames
        participant_frames = frame.get('participantFrames', {})

        for participant_id_str, participant_data in participant_frames.items():
            participant_id = int(participant_id_str)

            # Extract position
            position = participant_data.get('position', {})
            if not position or position.get('x') is None:
                continue  # Skip if no position data

            snapshot_data = {
                'match_id': match_id,
                'participant_id': participant_id,
                'timestamp_ms': timestamp_ms,
                'position_x': position.get('x'),
                'position_y': position.get('y'),
                'level': participant_data.get('level'),
                'total_gold': participant_data.get('totalGold'),
                'current_gold': participant_data.get('currentGold'),
                'xp': participant_data.get('xp'),
                'minions_killed': participant_data.get('minionsKilled'),
                'jungle_minions_killed': participant_data.get('jungleMinionsKilled'),
                'stats': participant_data.get('championStats', {})  # Store as JSONB
            }

            snapshots_to_insert.append(snapshot_data)

    # Insert into Supabase
    if snapshots_to_insert:
        print(f"Storing {len(snapshots_to_insert)} timeline snapshots...")
        result = supabase.table('match_timeline_snapshots').insert(snapshots_to_insert).execute()
        print(f"[OK] Stored {len(snapshots_to_insert)} snapshots")
    else:
        print("[WARN] No snapshots found to store")

def main():
    """Main function to fetch and store timeline data"""
    try:
        # Get PUUID for petRoXD#EUW
        puuid = get_puuid("petRoXD", "EUW")

        # Get last 3 match IDs
        match_ids = get_match_ids(puuid, count=3)

        # Process each match
        for i, match_id in enumerate(match_ids, 1):
            print(f"\n{'='*60}")
            print(f"Processing match {i}/{len(match_ids)}: {match_id}")
            print(f"{'='*60}")

            # Fetch timeline
            timeline = get_match_timeline(match_id)

            # Store events
            store_match_events(match_id, timeline)

            # Store snapshots
            store_timeline_snapshots(match_id, timeline)

            print(f"[OK] Match {match_id} processed successfully\n")

            # Rate limiting: wait 1 second between requests
            if i < len(match_ids):
                print("Waiting 1 second before next match...")
                time.sleep(1)

        print(f"\n{'='*60}")
        print(f"[OK] ALL DONE! Processed {len(match_ids)} matches")
        print(f"{'='*60}")

    except Exception as e:
        print(f"\n[ERROR] {e}")
        raise

if __name__ == "__main__":
    main()
