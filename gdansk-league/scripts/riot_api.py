"""
Riot API Integration for Gdansk LoL Project
Handles all interactions with Riot Games API for fetching player data
"""

import os
import requests
import time
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Configuration
API_KEY = os.getenv('RIOT_API_KEY')
if not API_KEY:
    raise ValueError("RIOT_API_KEY not found in environment variables. Please add it to .env file.")

REGION = "eun1"  # Europe Nordic & East (Poland server)
CONTINENT = "europe"  # For match history and other continental endpoints

# Rate limiting configuration
RATE_LIMIT_DELAY = 1.2  # Seconds between API calls (conservative to avoid rate limits)


class RiotAPIError(Exception):
    """Custom exception for Riot API errors"""
    pass


def _make_request(url: str, headers: Dict[str, str], max_retries: int = 3) -> Optional[Dict]:
    """
    Make API request with retry logic and rate limit handling

    Args:
        url: API endpoint URL
        headers: Request headers including API key
        max_retries: Maximum number of retry attempts

    Returns:
        JSON response as dictionary, or None if request fails
    """
    for attempt in range(max_retries):
        try:
            time.sleep(RATE_LIMIT_DELAY)  # Rate limit protection
            response = requests.get(url, headers=headers, timeout=10)

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                print(f"Resource not found (404): {url}")
                return None
            elif response.status_code == 429:
                # Rate limit exceeded
                retry_after = int(response.headers.get('Retry-After', 60))
                print(f"Rate limit exceeded. Waiting {retry_after} seconds...")
                time.sleep(retry_after)
                continue
            elif response.status_code == 403:
                raise RiotAPIError("API key is invalid or expired (403)")
            else:
                print(f"API request failed with status {response.status_code}: {response.text}")
                return None

        except requests.exceptions.Timeout:
            print(f"Request timeout (attempt {attempt + 1}/{max_retries})")
            if attempt == max_retries - 1:
                return None
        except requests.exceptions.RequestException as e:
            print(f"Request error: {str(e)}")
            return None

    return None


def get_summoner_by_name(summoner_name: str) -> Optional[Dict]:
    """
    Fetch summoner information by summoner name

    Args:
        summoner_name: In-game summoner name

    Returns:
        Dictionary containing summoner info (id, accountId, puuid, name, profileIconId, summonerLevel)
    """
    url = f"https://{REGION}.api.riotgames.com/lol/summoner/v4/summoners/by-name/{summoner_name}"
    headers = {"X-Riot-Token": API_KEY}

    print(f"Fetching summoner data for: {summoner_name}")
    return _make_request(url, headers)


def get_summoner_by_puuid(puuid: str) -> Optional[Dict]:
    """
    Fetch summoner information by PUUID

    Args:
        puuid: Player Universal Unique Identifier

    Returns:
        Dictionary containing summoner info
    """
    url = f"https://{REGION}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}"
    headers = {"X-Riot-Token": API_KEY}

    return _make_request(url, headers)


def get_ranked_stats(summoner_id: str) -> Optional[List[Dict]]:
    """
    Fetch ranked statistics for a summoner

    Args:
        summoner_id: Encrypted summoner ID

    Returns:
        List of ranked queue entries (RANKED_SOLO_5x5, RANKED_FLEX_SR, etc.)
        Each entry contains: tier, rank, leaguePoints, wins, losses
    """
    url = f"https://{REGION}.api.riotgames.com/lol/league/v4/entries/by-summoner/{summoner_id}"
    headers = {"X-Riot-Token": API_KEY}

    print(f"Fetching ranked stats for summoner ID: {summoner_id}")
    return _make_request(url, headers)


def get_match_history(puuid: str, count: int = 20, queue_type: int = 420) -> Optional[List[str]]:
    """
    Fetch match IDs for a player's match history

    Args:
        puuid: Player Universal Unique Identifier
        count: Number of matches to fetch (max 100)
        queue_type: Queue ID (420 = Ranked Solo/Duo, 440 = Ranked Flex)

    Returns:
        List of match IDs
    """
    url = f"https://{CONTINENT}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
    headers = {"X-Riot-Token": API_KEY}
    params = {
        "queue": queue_type,
        "count": count
    }

    print(f"Fetching {count} match IDs for PUUID: {puuid[:8]}...")
    try:
        time.sleep(RATE_LIMIT_DELAY)
        response = requests.get(url, headers=headers, params=params, timeout=10)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to fetch match history: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error fetching match history: {str(e)}")
        return None


def get_match_details(match_id: str) -> Optional[Dict]:
    """
    Fetch detailed match information

    Args:
        match_id: Match identifier

    Returns:
        Dictionary containing full match details including all player stats
    """
    url = f"https://{CONTINENT}.api.riotgames.com/lol/match/v5/matches/{match_id}"
    headers = {"X-Riot-Token": API_KEY}

    print(f"Fetching match details for: {match_id}")
    return _make_request(url, headers)


def get_player_full_data(summoner_name: str) -> Optional[Dict]:
    """
    Fetch complete player data (summoner info + ranked stats)
    Convenience function that combines multiple API calls

    Args:
        summoner_name: In-game summoner name

    Returns:
        Dictionary containing all player data or None if player not found
    """
    # Get summoner info
    summoner = get_summoner_by_name(summoner_name)
    if not summoner:
        print(f"Summoner not found: {summoner_name}")
        return None

    # Get ranked stats
    ranked_stats = get_ranked_stats(summoner['id'])

    # Find Ranked Solo/Duo queue stats
    solo_queue = None
    if ranked_stats:
        for queue in ranked_stats:
            if queue.get('queueType') == 'RANKED_SOLO_5x5':
                solo_queue = queue
                break

    # Compile full player data
    player_data = {
        'summoner_name': summoner['name'],
        'puuid': summoner['puuid'],
        'summoner_id': summoner['id'],
        'summoner_level': summoner['summonerLevel'],
        'profile_icon_id': summoner['profileIconId'],
        'tier': solo_queue.get('tier') if solo_queue else 'UNRANKED',
        'rank': solo_queue.get('rank') if solo_queue else '',
        'lp': solo_queue.get('leaguePoints', 0) if solo_queue else 0,
        'wins': solo_queue.get('wins', 0) if solo_queue else 0,
        'losses': solo_queue.get('losses', 0) if solo_queue else 0,
        'winrate': round(solo_queue.get('wins', 0) / (solo_queue.get('wins', 0) + solo_queue.get('losses', 1)) * 100, 1) if solo_queue else 0.0
    }

    print(f"✓ Successfully fetched data for {summoner_name}: {player_data['tier']} {player_data['rank']} ({player_data['lp']} LP)")
    return player_data


# Test function
def test_api():
    """Test the API with a known summoner"""
    print("\n=== Testing Riot API Connection ===\n")
    print(f"Region: {REGION}")
    print(f"Continent: {CONTINENT}")
    print(f"API Key: {'*' * 20}{API_KEY[-10:] if API_KEY else 'NOT SET'}")
    print("\nTesting with summoner name: 'Faker' (example)")
    print("\nPlease replace 'Faker' with your own summoner name or a Gdansk player name.\n")

    # Test with a summoner (replace with actual summoner name)
    test_summoner = "Faker"  # Replace this with your summoner name
    result = get_player_full_data(test_summoner)

    if result:
        print("\n✓ API Test Successful!")
        print(f"\nPlayer Data:")
        for key, value in result.items():
            print(f"  {key}: {value}")
    else:
        print("\n✗ API Test Failed - Check your API key and summoner name")


if __name__ == "__main__":
    test_api()
