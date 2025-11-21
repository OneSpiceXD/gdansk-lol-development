"""
Test fetching top 3 champions for a player
"""

import os
import requests
import time
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('RIOT_API_KEY')
REGION = "euw1"

def get_top_champions(puuid: str, count: int = 3):
    """
    Fetch top champions by mastery points

    Args:
        puuid: Player's PUUID
        count: Number of top champions to return (default 3)

    Returns:
        List of champion mastery data
    """
    url = f"https://{REGION}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top"
    headers = {"X-Riot-Token": API_KEY}
    params = {"count": count}

    print(f"Fetching top {count} champions for PUUID: {puuid[:20]}...")

    try:
        time.sleep(1.2)  # Rate limit protection
        response = requests.get(url, headers=headers, params=params, timeout=10)

        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"Error: {str(e)}")
        return None


# Test with petRoXD's PUUID (from earlier test)
test_puuid = "tsVk_HdI9hvmq0saPBuhGB8E_OOGcRQfbtdLf8FVGOWu2jO0SnDNTVdff6hOdS2mHaHusik-7ItNVw"

print("=" * 60)
print("  Testing Champion Mastery API")
print("=" * 60)
print()

champions = get_top_champions(test_puuid, count=3)

if champions:
    print(f"\n[OK] Found {len(champions)} champions!")
    print("\nTop 3 Champions:")
    print("-" * 60)

    for i, champ in enumerate(champions, 1):
        print(f"\n{i}. Champion ID: {champ.get('championId')}")
        print(f"   Mastery Level: {champ.get('championLevel')}")
        print(f"   Mastery Points: {champ.get('championPoints'):,}")
        print(f"   Chest Granted: {champ.get('chestGranted')}")
        print(f"   Last Play Time: {champ.get('lastPlayTime')}")

    print("\n" + "=" * 60)
    print("Champion Mastery API is working!")
    print("=" * 60)
    print("\nNote: Champion IDs need to be mapped to champion names")
    print("We'll need Data Dragon API for that conversion")
else:
    print("\n[FAIL] Could not fetch champion mastery data")
