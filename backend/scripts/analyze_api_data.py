"""
Analyze the Riot API data structure to extract all available fields.
"""
import json

# Load the match details
with open('match_details_sample.json', 'r', encoding='utf-8') as f:
    match = json.load(f)

# Load the timeline
with open('match_timeline_sample.json', 'r', encoding='utf-8') as f:
    timeline = json.load(f)

print("="*80)
print("RIOT API DATA STRUCTURE ANALYSIS FOR RANKED GAMES")
print("="*80)

# Analyze match metadata
print("\n### MATCH METADATA ###")
print("Fields available at match level:")
for key in sorted(match['metadata'].keys()):
    print(f"  - {key}: {type(match['metadata'][key]).__name__}")

# Analyze match info
print("\n### MATCH INFO ###")
print("Fields available at match.info level:")
for key in sorted(match['info'].keys()):
    if key != 'participants':
        value = match['info'][key]
        print(f"  - {key}: {type(value).__name__}")

# Analyze participant (player) data
print("\n### PLAYER/PARTICIPANT DATA (145 fields total) ###")
print("All fields available for each player in a match:\n")
participant = match['info']['participants'][0]

# Group fields by category
performance = ['kills', 'deaths', 'assists', 'goldEarned', 'totalMinionsKilled', 'neutralMinionsKilled',
               'champLevel', 'champExperience', 'totalDamageDealtToChampions', 'visionScore']
combat = ['physicalDamageDealtToChampions', 'magicDamageDealtToChampions', 'trueDamageDealtToChampions',
          'totalDamageTaken', 'damageSelfMitigated', 'totalHeal', 'timeCCingOthers']
objectives = ['turretKills', 'inhibitorKills', 'baronKills', 'dragonKills', 'damageDealtToObjectives']
items = ['item0', 'item1', 'item2', 'item3', 'item4', 'item5', 'item6']
player_info = ['puuid', 'summonerId', 'summonerName', 'summonerLevel', 'riotIdGameName', 'riotIdTagline',
               'championId', 'championName', 'teamId', 'teamPosition', 'individualPosition', 'win']

print("CORE PERFORMANCE METRICS:")
for field in sorted(performance):
    if field in participant:
        print(f"  - {field}: {participant[field]} ({type(participant[field]).__name__})")

print("\nCOMBAT STATS:")
for field in sorted(combat):
    if field in participant:
        print(f"  - {field}: {participant[field]} ({type(participant[field]).__name__})")

print("\nOBJECTIVE STATS:")
for field in sorted(objectives):
    if field in participant:
        print(f"  - {field}: {participant[field]} ({type(participant[field]).__name__})")

print("\nITEMS:")
for field in items:
    if field in participant:
        print(f"  - {field}: {participant[field]} (item ID)")

print("\nPLAYER IDENTIFICATION:")
for field in player_info:
    if field in participant:
        print(f"  - {field}: {participant[field]}")

print("\nCHALLENGES (Advanced Stats):")
challenges = participant.get('challenges', {})
print(f"  Total challenge metrics: {len(challenges)} fields")
print("  Key challenges:")
print(f"    - kda: {challenges.get('kda')}")
print(f"    - killParticipation: {challenges.get('killParticipation')}")
print(f"    - goldPerMinute: {challenges.get('goldPerMinute')}")
print(f"    - damagePerMinute: {challenges.get('damagePerMinute')}")
print(f"    - visionScorePerMinute: {challenges.get('visionScorePerMinute')}")
print(f"    - controlWardsPlaced: {challenges.get('controlWardsPlaced')}")
print(f"    - wardsGuarded: {challenges.get('wardsGuarded')}")

# Analyze timeline
print("\n### MATCH TIMELINE ###")
print(f"Number of frames: {len(timeline['info']['frames'])}")
print("Event types available:")
event_types = set()
for frame in timeline['info']['frames']:
    for event in frame['events']:
        event_types.add(event['type'])

for event_type in sorted(event_types):
    print(f"  - {event_type}")

# Sample kill event
print("\nSample CHAMPION_KILL event structure:")
for frame in timeline['info']['frames']:
    for event in frame['events']:
        if event['type'] == 'CHAMPION_KILL':
            print(json.dumps(event, indent=2))
            break
    else:
        continue
    break

print("\n" + "="*80)
print("ALL PARTICIPANT FIELDS (Alphabetical)")
print("="*80)
for key in sorted(participant.keys()):
    if key != 'challenges' and key != 'perks' and key != 'missions':
        print(f"  {key}")

print(f"\nTotal participant fields: {len(participant.keys())}")
print("(Excludes nested objects: challenges, perks, missions)")
