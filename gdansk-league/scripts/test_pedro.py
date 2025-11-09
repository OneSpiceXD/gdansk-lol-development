"""
Quick test script for petRoXD account
"""

from riot_api import get_player_full_data

# Test with petRoXD#EUW (Riot ID format)
summoner_name = "petRoXD#EUW"

print("=" * 60)
print("  Testing Riot API with petRoXD")
print("=" * 60)
print()

result = get_player_full_data(summoner_name)

if result:
    print("\n" + "=" * 60)
    print("  SUCCESS! Your Account Data:")
    print("=" * 60)
    print(f"\nSummoner Name: {result['summoner_name']}")
    print(f"Level: {result['summoner_level']}")
    print(f"\nRanked Solo/Duo Stats:")
    print(f"  Rank: {result['tier']} {result['rank']}")
    print(f"  LP: {result['lp']}")
    print(f"  Wins: {result['wins']}")
    print(f"  Losses: {result['losses']}")
    print(f"  Winrate: {result['winrate']}%")
    print(f"\nRecord: {result['wins']}W - {result['losses']}L")
    print(f"\nPUUID: {result['puuid'][:20]}...")
    print(f"Summoner ID: {result['summoner_id'][:20] if result['summoner_id'] else 'N/A'}...")
    print("\n" + "=" * 60)
    print("  Riot API is working perfectly!")
    print("=" * 60)
    print("\nYou're ready to collect data from other players!")
else:
    print("\n❌ Could not fetch data for petRoXD")
    print("\nTroubleshooting:")
    print("  1. Make sure 'petRoXD' is the exact summoner name (without #EUW)")
    print("  2. Verify the account is on EUNE server")
    print("  3. Check if the API key is valid")
    print("\nIf the summoner name is different, try:")
    print("  - Checking in-game profile")
    print("  - Searching on op.gg")
