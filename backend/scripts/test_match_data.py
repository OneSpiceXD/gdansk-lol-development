"""
Test script to fetch and analyze ranked match data structure.
"""
import json
from riot_api import RiotAPI

client = RiotAPI()

# Test with rhalenessach#EUW (has ranked games)
game_name = "rhalenessach"
tag_line = "EUW"

print(f"Fetching data for {game_name}#{tag_line}...")

# Get summoner data
summoner = client.get_summoner_by_riot_id(game_name, tag_line)
if not summoner:
    print("Failed to get summoner")
    exit(1)

puuid = summoner['puuid']
print(f"\nPUUID: {puuid[:20]}...")

# Get ranked match history (queue 420 = Ranked Solo/Duo)
print("\n=== FETCHING MATCH HISTORY ===")
match_ids = client.get_match_history(puuid, count=5, queue=420)
print(f"Found {len(match_ids)} ranked matches")

if len(match_ids) > 0:
    # Get detailed match data for the first match
    match_id = match_ids[0]
    print(f"\n=== FETCHING MATCH DETAILS FOR: {match_id} ===")
    match_details = client.get_match_details(match_id)

    if match_details:
        # Save full response to file for analysis
        with open('match_details_sample.json', 'w', encoding='utf-8') as f:
            json.dump(match_details, f, indent=2, ensure_ascii=False)
        print("[SUCCESS] Match details saved to match_details_sample.json")

        # Print key structure
        print("\n=== MATCH INFO STRUCTURE ===")
        if 'info' in match_details:
            info = match_details['info']
            print(f"Game Duration: {info.get('gameDuration')} seconds")
            print(f"Game Mode: {info.get('gameMode')}")
            print(f"Queue ID: {info.get('queueId')}")
            print(f"Number of participants: {len(info.get('participants', []))}")

            # Find our player's data
            print("\n=== PLAYER DATA STRUCTURE (First 5 fields) ===")
            participants = info.get('participants', [])
            if participants:
                player_data = participants[0]
                field_count = 0
                for key in sorted(player_data.keys()):
                    print(f"  {key}: {type(player_data[key]).__name__}")
                    field_count += 1
                    if field_count >= 20:
                        print(f"  ... and {len(player_data.keys()) - 20} more fields")
                        break

                print(f"\nTotal fields available: {len(player_data.keys())}")

    # Get match timeline
    print(f"\n=== FETCHING MATCH TIMELINE FOR: {match_id} ===")
    timeline = client.get_match_timeline(match_id)

    if timeline:
        # Save timeline to file
        with open('match_timeline_sample.json', 'w', encoding='utf-8') as f:
            json.dump(timeline, f, indent=2, ensure_ascii=False)
        print("[SUCCESS] Match timeline saved to match_timeline_sample.json")

        # Print timeline structure
        print("\n=== TIMELINE STRUCTURE ===")
        if 'info' in timeline:
            frames = timeline['info'].get('frames', [])
            print(f"Number of frames: {len(frames)}")
            if frames:
                print(f"Events in first frame: {len(frames[0].get('events', []))}")
                if frames[0].get('events'):
                    event_types = set(event.get('type') for event in frames[0]['events'])
                    print(f"Event types in first frame: {', '.join(event_types)}")

print("\n=== ANALYSIS COMPLETE ===")
print("Check match_details_sample.json and match_timeline_sample.json for full data structure")
