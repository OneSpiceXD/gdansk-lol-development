"""
Test fetching a batch of players
"""

from riot_api import get_player_full_data

# Test players
players = [
    "petRoXD#EUW",
    "twtv shiftlol5#2005",
    "TwTv Keksereslol#katar",
    "QQ Pawelek6#EUW"
]

print("=" * 60)
print("  Testing Batch Player Fetch")
print("=" * 60)
print(f"\nTesting {len(players)} players...\n")

successful = []
failed = []

for i, player_name in enumerate(players, 1):
    print(f"\n[{i}/{len(players)}] Testing: {player_name}")
    print("-" * 60)

    result = get_player_full_data(player_name)

    if result:
        successful.append(result)
        print(f"SUCCESS: {result['summoner_name']}")
        print(f"  Rank: {result['tier']} {result['rank']}")
        print(f"  LP: {result['lp']}")
        print(f"  Level: {result['summoner_level']}")
        print(f"  Winrate: {result['winrate']}%")
    else:
        failed.append(player_name)
        print(f"FAILED: Could not fetch data for {player_name}")

# Summary
print("\n" + "=" * 60)
print("  BATCH TEST RESULTS")
print("=" * 60)
print(f"\nSuccessful: {len(successful)}/{len(players)}")
print(f"Failed: {len(failed)}/{len(players)}")

if successful:
    print("\nSuccessful players:")
    for player in successful:
        print(f"  - {player['summoner_name']}: {player['tier']} {player['rank']} ({player['lp']} LP)")

if failed:
    print("\nFailed players:")
    for player_name in failed:
        print(f"  - {player_name}")

print("\n" + "=" * 60)
