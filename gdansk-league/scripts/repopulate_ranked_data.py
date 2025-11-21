"""
Repopulate match analytics and stats with ONLY ranked solo/duo games
Usage: python repopulate_ranked_data.py
"""

import os
import time
import requests
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv(override=True)

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

def get_match_ids(puuid: str, count: int = 100, queue_id: int = 420) -> list:
    """Get recent match IDs for a player (filtered by queue)"""
    url = f"{MATCH_V5_BASE}/lol/match/v5/matches/by-puuid/{puuid}/ids"
    params = {
        "start": 0,
        "count": count,
        "queue": queue_id  # Only get ranked solo/duo
    }
    headers = {"X-Riot-Token": RIOT_API_KEY}

    print(f"Fetching up to {count} RANKED SOLO/DUO match IDs...")
    response = requests.get(url, headers=headers, params=params)

    if response.status_code != 200:
        raise Exception(f"Failed to get match IDs: {response.status_code} - {response.text}")

    match_ids = response.json()
    print(f"[OK] Found {len(match_ids)} ranked solo/duo matches")
    return match_ids

def get_match_data(match_id: str) -> dict:
    """Get match data"""
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

    print(f"  Fetching timeline...")
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise Exception(f"Failed to get timeline: {response.status_code} - {response.text}")

    return response.json()

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

    # Get queue_id and team_id from match data
    queue_id = match_data['info'].get('queueId', 420)

    # Get team_id from participant info
    team_id = None
    for participant in match_data['info']['participants']:
        if participant['puuid'] == target_puuid:
            team_id = participant.get('teamId', 100)
            break

    analytics = {
        'match_id': match_id,
        'player_puuid': target_puuid,
        'participant_id': participant_id,
        'queue_id': queue_id,
        'team_id': team_id,
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

        # Extract position at 5-minute intervals
        if timestamp % 300000 == 0 or timestamp == 0:
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

                # Death (player is victim)
                if victim_id == participant_id:
                    analytics['deaths'].append({
                        'x': position.get('x'),
                        'y': position.get('y'),
                        'timestamp': timestamp,
                        'killer_champion': get_champion_name(match_data, killer_id) if killer_id else None,
                        'assisting_champions': [get_champion_name(match_data, aid) for aid in assisting_ids]
                    })

                # Kill (player is killer)
                if killer_id == participant_id:
                    analytics['kills'].append({
                        'x': position.get('x'),
                        'y': position.get('y'),
                        'timestamp': timestamp,
                        'victim_champion': get_champion_name(match_data, victim_id),
                        'assisting_champions': [get_champion_name(match_data, aid) for aid in assisting_ids]
                    })

                # Assist (player assisted)
                if participant_id in assisting_ids:
                    analytics['assists'].append({
                        'x': position.get('x'),
                        'y': position.get('y'),
                        'timestamp': timestamp,
                        'killer_champion': get_champion_name(match_data, killer_id) if killer_id else None,
                        'victim_champion': get_champion_name(match_data, victim_id)
                    })

            # ELITE_MONSTER_KILL (dragons, baron, rift herald)
            elif event_type == 'ELITE_MONSTER_KILL':
                if event.get('killerId') == participant_id:
                    analytics['elite_monster_kills'].append({
                        'type': event.get('monsterType'),
                        'subtype': event.get('monsterSubType'),
                        'x': position.get('x'),
                        'y': position.get('y'),
                        'timestamp': timestamp
                    })

            # BUILDING_KILL (towers, inhibitors)
            elif event_type == 'BUILDING_KILL':
                if event.get('killerId') == participant_id:
                    analytics['building_kills'].append({
                        'type': event.get('buildingType'),
                        'lane': event.get('laneType'),
                        'tower_type': event.get('towerType'),
                        'x': position.get('x'),
                        'y': position.get('y'),
                        'timestamp': timestamp
                    })

    return analytics

def get_or_create_player(puuid: str) -> str:
    """Get player_id from players table"""
    try:
        result = supabase.table('players').select('id').eq('puuid', puuid).execute()

        if result.data and len(result.data) > 0:
            return result.data[0]['id']
        else:
            print(f"[INFO] Player not in database yet, skipping match_stats")
            return None
    except Exception as e:
        print(f"[WARN] Could not lookup player: {e}")
        return None

def store_match_stats(match_data: dict, target_puuid: str):
    """Store match stats in match_stats table"""
    participant = None
    for p in match_data['info']['participants']:
        if p['puuid'] == target_puuid:
            participant = p
            break

    if not participant:
        print("[WARN] Participant not found, skipping match_stats")
        return

    player_id = get_or_create_player(target_puuid)
    if not player_id:
        return

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

    # Extract match date and season
    from datetime import datetime
    game_creation_ms = match_data['info']['gameCreation']
    match_date = datetime.fromtimestamp(game_creation_ms / 1000)

    # Extract season from game version
    game_version = match_data['info']['gameVersion']
    version_parts = game_version.split('.')
    season = int(version_parts[0])
    patch_number = int(version_parts[1])
    patch = f"{season}.{patch_number}"

    # Calculate split
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
        'team_id': participant.get('teamId', 100),
        'game_duration': game_duration_seconds,
        'win': participant['win'],
        'match_date': match_date.isoformat(),
        'season': season,
        'split_number': split_number,
        'split_name': split_name,
        'patch': patch,
        'kills': participant['kills'],
        'deaths': participant['deaths'],
        'assists': participant['assists'],
        'total_minions_killed': participant.get('totalMinionsKilled', 0),
        'neutral_minions_killed': participant.get('neutralMinionsKilled', 0),
        'cs_per_minute': round(participant.get('totalMinionsKilled', 0) / game_duration_minutes, 2) if game_duration_minutes > 0 else 0,
        'total_damage_to_champions': participant.get('totalDamageDealtToChampions', 0),
        'damage_per_minute': round(participant.get('totalDamageDealtToChampions', 0) / game_duration_minutes, 2) if game_duration_minutes > 0 else 0,
        'damage_share': participant.get('challenges', {}).get('teamDamagePercentage', 0),
        'total_damage_taken': participant.get('totalDamageTaken', 0),
        'damage_self_mitigated': participant.get('damageSelfMitigated', 0),
        'gold_earned': participant.get('goldEarned', 0),
        'vision_score': participant.get('visionScore', 0),
        'vision_score_per_minute': round(participant.get('visionScore', 0) / game_duration_minutes, 2) if game_duration_minutes > 0 else 0,
        'wards_placed': participant.get('wardsPlaced', 0),
        'wards_killed': participant.get('wardsKilled', 0),
        'control_wards_purchased': participant.get('visionWardsBoughtInGame', 0),
        'damage_to_turrets': participant.get('damageDealtToTurrets', 0),
        'damage_to_objectives': participant.get('damageDealtToObjectives', 0),
        'turret_plates_taken': participant.get('challenges', {}).get('turretPlatesTaken', 0),
        'turrets_killed': participant.get('turretKills', 0),
        'dragon_kills': participant.get('dragonKills', 0),
        'baron_kills': participant.get('baronKills', 0),
        'rift_herald_kills': participant.get('challenges', {}).get('riftHeraldTakedowns', 0),
        'time_ccing_others': participant.get('timeCCingOthers', 0),
        'total_heal_on_teammates': participant.get('totalHealsOnTeammates', 0),
        'total_damage_shielded_on_teammates': participant.get('totalDamageShieldedOnTeammates', 0),
        'kill_participation': participant.get('challenges', {}).get('killParticipation', 0),
        'solo_kills': participant.get('challenges', {}).get('soloKills', 0),
        'takedowns_first_15_min': participant.get('challenges', {}).get('takedownsFirst15Minutes', 0),
        'save_ally_from_death': participant.get('challenges', {}).get('saveAllyFromDeath', 0),
    }

    try:
        result = supabase.table('match_stats').insert(match_stats).execute()
        print(f"  [OK] Match stats stored")
    except Exception as e:
        if 'duplicate key' in str(e).lower() or 'unique' in str(e).lower():
            print(f"  [SKIP] Match stats already exist")
        else:
            print(f"  [ERROR] Failed to store match stats: {e}")

def store_analytics(analytics: dict):
    """Store aggregated analytics in database"""
    try:
        result = supabase.table('match_analytics_summary').insert(analytics).execute()
        print(f"  [OK] Analytics stored")
    except Exception as e:
        if 'duplicate key' in str(e).lower() or 'unique' in str(e).lower():
            print(f"  [SKIP] Analytics already exist")
        else:
            raise

def main():
    """Main function"""
    try:
        print("="*80)
        print("REPOPULATING WITH RANKED SOLO/DUO GAMES ONLY")
        print("="*80)
        print()

        # Get PUUID
        puuid = get_puuid("petRoXD", "EUW")

        # Get ranked solo/duo matches only
        match_ids = get_match_ids(puuid, count=100, queue_id=420)

        print(f"\n{'='*80}")
        print(f"Processing {len(match_ids)} ranked solo/duo matches")
        print(f"{'='*80}\n")

        # Process each match
        successful = 0
        skipped = 0

        for i, match_id in enumerate(match_ids, 1):
            print(f"\n[{i}/{len(match_ids)}] {match_id}")
            print("-" * 60)

            try:
                # Fetch match data
                match_data = get_match_data(match_id)

                # Double-check queue_id (should always be 420 since we filtered)
                queue_id = match_data['info'].get('queueId')
                if queue_id != 420:
                    print(f"  [SKIP] Not ranked solo/duo (queue_id: {queue_id})")
                    skipped += 1
                    continue

                print(f"  [OK] Ranked Solo/Duo confirmed (queue_id: 420)")

                # Fetch timeline
                timeline = get_match_timeline(match_id)

                # Store match stats
                store_match_stats(match_data, puuid)

                # Aggregate and store analytics
                analytics = aggregate_match_analytics(match_id, match_data, timeline, puuid)
                store_analytics(analytics)

                successful += 1
                print(f"  [OK] Match processed successfully")

                # Rate limiting
                if i < len(match_ids):
                    time.sleep(1.2)  # Be safe with rate limits

            except Exception as e:
                print(f"  [ERROR] Failed to process match: {e}")
                continue

        print(f"\n{'='*80}")
        print(f"COMPLETE!")
        print(f"{'='*80}")
        print(f"Successful: {successful}")
        print(f"Skipped: {skipped}")
        print(f"Total: {len(match_ids)}")
        print(f"{'='*80}")

    except Exception as e:
        print(f"\n[ERROR] {e}")
        raise

if __name__ == "__main__":
    main()
