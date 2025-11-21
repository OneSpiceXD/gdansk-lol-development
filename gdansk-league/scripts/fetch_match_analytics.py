"""
Fetch match timeline data and store aggregated analytics (98% storage reduction)
Usage: python fetch_match_analytics.py
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
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY')

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Riot API endpoints
ACCOUNT_V1_BASE = "https://europe.api.riotgames.com"
MATCH_V5_BASE = "https://europe.api.riotgames.com"

def get_puuid(game_name: str, tag_line: str) -> str:
    """Get PUUID from Riot ID"""
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

def get_match_ids(puuid: str, count: int = 100) -> list:
    """Get recent match IDs for a player"""
    url = f"{MATCH_V5_BASE}/lol/match/v5/matches/by-puuid/{puuid}/ids"
    params = {"start": 0, "count": count}
    headers = {"X-Riot-Token": RIOT_API_KEY}

    print(f"Fetching up to {count} match IDs...")
    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        raise Exception(f"Failed to get match IDs: {response.status_code} - {response.text}")

    match_ids = response.json()
    print(f"[OK] Found {len(match_ids)} matches")
    return match_ids

def get_match_data(match_id: str) -> dict:
    """Get match data (for participant mapping)"""
    url = f"{MATCH_V5_BASE}/lol/match/v5/matches/{match_id}"
    headers = {"X-Riot-Token": RIOT_API_KEY}

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception(f"Failed to get match data: {response.status_code}")

    return response.json()

def get_match_timeline(match_id: str) -> dict:
    """Get timeline data for a specific match"""
    url = f"{MATCH_V5_BASE}/lol/match/v5/matches/{match_id}/timeline"
    headers = {"X-Riot-Token": RIOT_API_KEY}

    print(f"Fetching timeline for match {match_id}...")
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise Exception(f"Failed to get timeline: {response.status_code} - {response.text}")

    timeline = response.json()
    print(f"[OK] Timeline fetched")
    return timeline

def find_participant_id(match_data: dict, target_puuid: str) -> int:
    """Find the participant ID for the target player"""
    for participant in match_data['info']['participants']:
        if participant['puuid'] == target_puuid:
            return participant['participantId']
    raise Exception(f"Player {target_puuid} not found in match")

def get_champion_name(match_data: dict, participant_id: int) -> str:
    """Get champion name for a participant"""
    for participant in match_data['info']['participants']:
        if participant['participantId'] == participant_id:
            return participant['championName']
    return "Unknown"

def aggregate_match_analytics(match_id: str, match_data: dict, timeline: dict, target_puuid: str) -> dict:
    """Aggregate all analytics for a player in a match"""

    # Find player's participant ID
    participant_id = find_participant_id(match_data, target_puuid)
    print(f"[OK] Player is participant #{participant_id}")

    # Get queue_id from match data
    queue_id = match_data['info'].get('queueId', 420)  # Default to 420 (Ranked Solo/Duo)

    analytics = {
        'match_id': match_id,
        'player_puuid': target_puuid,
        'participant_id': participant_id,
        'queue_id': queue_id,
        'deaths': [],
        'kills': [],
        'assists': [],
        'elite_monster_kills': [],
        'building_kills': [],
        'position_timeline': []
    }

    # Process all frames for events and position snapshots
    for frame in timeline['info']['frames']:
        timestamp = frame['timestamp']

        # Extract position at 5-minute intervals (0, 300000, 600000, ...)
        if timestamp % 300000 == 0 or timestamp == 0:  # Every 5 minutes
            participant_frames = frame.get('participantFrames', {})
            player_frame = participant_frames.get(str(participant_id))

            if player_frame and 'position' in player_frame:
                position = player_frame['position']
                if position.get('x') is not None:
                    analytics['position_timeline'].append({
                        'timestamp': timestamp,
                        'x': position['x'],
                        'y': position['y'],
                        'level': player_frame.get('level'),
                        'total_gold': player_frame.get('totalGold'),
                        'current_gold': player_frame.get('currentGold'),
                        'cs': player_frame.get('minionsKilled', 0),
                        'jungle_cs': player_frame.get('jungleMinionsKilled', 0)
                    })

        # Process events
        if 'events' not in frame:
            continue

        for event in frame['events']:
            event_type = event.get('type')
            position = event.get('position', {})

            # CHAMPION_KILL events
            if event_type == 'CHAMPION_KILL':
                killer_id = event.get('killerId')
                victim_id = event.get('victimId')
                assisting_ids = event.get('assistingParticipantIds', [])

                # Player died
                if victim_id == participant_id:
                    analytics['deaths'].append({
                        'x': position.get('x'),
                        'y': position.get('y'),
                        'timestamp': timestamp,
                        'killer_champion': get_champion_name(match_data, killer_id),
                        'assisting_champions': [get_champion_name(match_data, aid) for aid in assisting_ids]
                    })

                # Player got a kill
                elif killer_id == participant_id:
                    analytics['kills'].append({
                        'x': position.get('x'),
                        'y': position.get('y'),
                        'timestamp': timestamp,
                        'victim_champion': get_champion_name(match_data, victim_id),
                        'assisting_champions': [get_champion_name(match_data, aid) for aid in assisting_ids]
                    })

                # Player got an assist
                elif participant_id in assisting_ids:
                    analytics['assists'].append({
                        'x': position.get('x'),
                        'y': position.get('y'),
                        'timestamp': timestamp,
                        'killer_champion': get_champion_name(match_data, killer_id),
                        'victim_champion': get_champion_name(match_data, victim_id)
                    })

            # ELITE_MONSTER_KILL events (Dragon, Baron, Rift Herald)
            elif event_type == 'ELITE_MONSTER_KILL':
                killer_id = event.get('killerId')
                if killer_id == participant_id:
                    analytics['elite_monster_kills'].append({
                        'type': event.get('monsterType'),  # 'DRAGON', 'BARON_NASHOR', 'RIFTHERALD'
                        'subtype': event.get('monsterSubType'),  # 'FIRE_DRAGON', 'ELDER_DRAGON', etc.
                        'x': position.get('x'),
                        'y': position.get('y'),
                        'timestamp': timestamp
                    })

            # BUILDING_KILL events (Towers, Inhibitors)
            elif event_type == 'BUILDING_KILL':
                killer_id = event.get('killerId')
                if killer_id == participant_id:
                    analytics['building_kills'].append({
                        'type': event.get('buildingType'),  # 'TOWER_BUILDING', 'INHIBITOR_BUILDING'
                        'lane': event.get('laneType'),  # 'TOP_LANE', 'MID_LANE', 'BOT_LANE'
                        'tower_type': event.get('towerType'),  # 'OUTER_TURRET', 'INNER_TURRET', etc.
                        'x': position.get('x'),
                        'y': position.get('y'),
                        'timestamp': timestamp
                    })

    return analytics

def get_or_create_player(puuid: str, summoner_name: str) -> str:
    """Get player_id from players table, or return None if not found"""
    try:
        # Try to find existing player by puuid
        result = supabase.table('players').select('id').eq('puuid', puuid).execute()

        if result.data and len(result.data) > 0:
            return result.data[0]['id']
        else:
            print(f"[INFO] Player not in database yet, skipping match_stats")
            return None
    except Exception as e:
        print(f"[WARN] Could not lookup player: {e}")
        return None

def store_match_stats(match_data: dict, target_puuid: str, summoner_name: str):
    """Store match stats in match_stats table"""
    participant = None
    for p in match_data['info']['participants']:
        if p['puuid'] == target_puuid:
            participant = p
            break

    if not participant:
        print("[WARN] Participant not found, skipping match_stats")
        return

    # Get player_id from database
    player_id = get_or_create_player(target_puuid, summoner_name)
    if not player_id:
        return  # Player not in database yet, skip match_stats

    # Map role from API to database format
    role_mapping = {
        'TOP': 'TOP',
        'JUNGLE': 'JUNGLE',
        'MIDDLE': 'MID',
        'BOTTOM': 'ADC',
        'UTILITY': 'SUPPORT'
    }
    role = role_mapping.get(participant.get('teamPosition'), 'MID')

    game_duration_seconds = match_data['info']['gameDuration']
    game_duration_minutes = game_duration_seconds / 60

    # Extract match date and season from game data
    from datetime import datetime
    game_creation_ms = match_data['info']['gameCreation']
    match_date = datetime.fromtimestamp(game_creation_ms / 1000)

    # Extract season from game version (e.g., "15.22.724.5161" -> season 15)
    game_version = match_data['info']['gameVersion']
    version_parts = game_version.split('.')
    season = int(version_parts[0])
    patch_number = int(version_parts[1])
    patch = f"{season}.{patch_number}"

    # Calculate split based on patch number
    # Season 15 splits: 1-8 (Split 1), 9-16 (Split 2), 17-22 (Split 3)
    if patch_number <= 8:
        split_number = 1
        split_name = "Welcome to Noxus"
    elif patch_number <= 16:
        split_number = 2
        split_name = "Spirit Blossom Beyond"
    else:
        split_number = 3
        split_name = "Trials of Twilight"

    match_stats = {
        'match_id': match_data['metadata']['matchId'],
        'player_id': player_id,
        'champion_id': participant['championId'],
        'champion_name': participant['championName'],
        'role': role,
        'game_duration': game_duration_seconds,
        'win': participant['win'],
        'match_date': match_date.isoformat(),
        'season': season,
        'split_number': split_number,
        'split_name': split_name,
        'patch': patch,

        # Core stats
        'kills': participant['kills'],
        'deaths': participant['deaths'],
        'assists': participant['assists'],

        # Farm stats
        'total_minions_killed': participant['totalMinionsKilled'],
        'neutral_minions_killed': participant['neutralMinionsKilled'],
        'cs_per_minute': (participant['totalMinionsKilled'] + participant['neutralMinionsKilled']) / max(game_duration_minutes, 1),

        # Damage stats
        'total_damage_to_champions': participant['totalDamageDealtToChampions'],
        'damage_per_minute': participant['totalDamageDealtToChampions'] / max(game_duration_minutes, 1),
        'total_damage_taken': participant['totalDamageTaken'],
        'damage_self_mitigated': participant.get('damageSelfMitigated', 0),

        # Gold stats
        'gold_earned': participant['goldEarned'],

        # Vision stats
        'vision_score': participant['visionScore'],
        'vision_score_per_minute': participant['visionScore'] / max(game_duration_minutes, 1),
        'wards_placed': participant.get('wardsPlaced', 0),
        'wards_killed': participant.get('wardsKilled', 0),
        'control_wards_purchased': participant.get('visionWardsBoughtInGame', 0),

        # Objective stats
        'damage_to_turrets': participant.get('damageDealtToTurrets', 0),
        'damage_to_objectives': participant.get('damageDealtToObjectives', 0),
        'turret_plates_taken': participant.get('turretPlatesTaken', 0),
        'turrets_killed': participant.get('turretKills', 0),
        'dragon_kills': participant.get('dragonKills', 0),
        'baron_kills': participant.get('baronKills', 0),
        'rift_herald_kills': participant.get('challenges', {}).get('takedownsOnRiftHerald', 0),

        # Combat stats
        'time_ccing_others': participant.get('timeCCingOthers', 0),
        'total_heal_on_teammates': participant.get('totalHealOnTeammates', 0),
        'total_damage_shielded_on_teammates': participant.get('totalDamageShieldedOnTeammates', 0),

        # Challenge-based stats
        'kill_participation': participant.get('challenges', {}).get('killParticipation', 0),
        'solo_kills': participant.get('challenges', {}).get('soloKills', 0),
        'takedowns_first_15_min': participant.get('challenges', {}).get('takedownsFirst15Minutes', 0),
        'save_ally_from_death': participant.get('challenges', {}).get('saveAllyFromDeath', 0)
    }

    # Try to insert, skip if already exists
    try:
        supabase.table('match_stats').insert(match_stats).execute()
        print(f"[OK] Match stats stored")
    except Exception as e:
        if 'duplicate key' in str(e).lower() or 'unique' in str(e).lower():
            print(f"[SKIP] Match stats already exist")
        else:
            print(f"[WARN] Failed to store match stats: {e}")

def store_analytics(analytics: dict):
    """Store aggregated analytics in Supabase"""
    print(f"Storing analytics summary...")
    print(f"  - Deaths: {len(analytics['deaths'])}")
    print(f"  - Kills: {len(analytics['kills'])}")
    print(f"  - Assists: {len(analytics['assists'])}")
    print(f"  - Elite monsters: {len(analytics['elite_monster_kills'])}")
    print(f"  - Buildings: {len(analytics['building_kills'])}")
    print(f"  - Position snapshots: {len(analytics['position_timeline'])}")

    try:
        result = supabase.table('match_analytics_summary').insert(analytics).execute()
        print(f"[OK] Analytics stored (1 row)")
    except Exception as e:
        if 'duplicate key' in str(e).lower() or 'unique' in str(e).lower():
            print(f"[SKIP] Analytics already exist")
        else:
            raise

def main():
    """Main function"""
    try:
        # Get PUUID
        puuid = get_puuid("petRoXD", "EUW")

        # Get all recent matches (up to 100)
        match_ids = get_match_ids(puuid, count=100)

        # Process each match
        for i, match_id in enumerate(match_ids, 1):
            print(f"\n{'='*60}")
            print(f"Processing match {i}/{len(match_ids)}: {match_id}")
            print(f"{'='*60}")

            # Fetch match data and timeline
            match_data = get_match_data(match_id)

            # Check queue_id - only process Ranked Solo/Duo (420)
            queue_id = match_data['info'].get('queueId')
            if queue_id != 420:
                print(f"[SKIP] Not ranked solo/duo (queue_id: {queue_id})")
                continue

            print(f"[OK] Ranked Solo/Duo match (queue_id: 420)")

            timeline = get_match_timeline(match_id)

            # Store match stats (basic stats table)
            store_match_stats(match_data, puuid, "petRoXD")

            # Aggregate analytics
            analytics = aggregate_match_analytics(match_id, match_data, timeline, puuid)

            # Store aggregated analytics
            store_analytics(analytics)

            print(f"[OK] Match {match_id} processed\n")

            # Rate limiting
            if i < len(match_ids):
                print("Waiting 1 second...")
                time.sleep(1)

        print(f"\n{'='*60}")
        print(f"[OK] ALL DONE! Processed {len(match_ids)} matches")
        print(f"{'='*60}")

    except Exception as e:
        print(f"\n[ERROR] {e}")
        raise

if __name__ == "__main__":
    main()
