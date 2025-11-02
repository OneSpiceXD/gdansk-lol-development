"""
Riot API client for fetching League of Legends player data.
"""
import os
import requests
import time
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('RIOT_API_KEY')
REGION = os.getenv('RIOT_REGION', 'eun1')  # Europe Nordic & East
CONTINENT = os.getenv('RIOT_CONTINENT', 'europe')


class RiotAPI:
    """Client for interacting with Riot Games API."""

    def __init__(self, api_key=None):
        self.api_key = api_key or API_KEY
        self.region = REGION
        self.continent = CONTINENT
        self.headers = {"X-Riot-Token": self.api_key}

    def get_summoner_by_name(self, summoner_name):
        """
        Get summoner info by name.

        Args:
            summoner_name (str): Summoner name

        Returns:
            dict: Summoner data including id, puuid, summonerLevel
        """
        url = f"https://{self.region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/{summoner_name}"
        response = requests.get(url, headers=self.headers)

        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            print(f"Summoner not found: {summoner_name}")
            return None
        else:
            print(f"Error fetching summoner: {response.status_code}")
            return None

    def get_ranked_stats(self, summoner_id):
        """
        Get ranked stats for a summoner.

        Args:
            summoner_id (str): Summoner ID

        Returns:
            list: List of ranked stats (Solo/Duo, Flex)
        """
        url = f"https://{self.region}.api.riotgames.com/lol/league/v4/entries/by-summoner/{summoner_id}"
        response = requests.get(url, headers=self.headers)

        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error fetching ranked stats: {response.status_code}")
            return []

    def get_match_history(self, puuid, count=20, queue=420):
        """
        Get match history IDs for a player.

        Args:
            puuid (str): Player PUUID
            count (int): Number of matches to fetch (max 100)
            queue (int): Queue type (420 = Ranked Solo/Duo)

        Returns:
            list: List of match IDs
        """
        url = f"https://{self.continent}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
        params = {
            "count": count,
            "queue": queue
        }
        response = requests.get(url, headers=self.headers, params=params)

        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error fetching match history: {response.status_code}")
            return []

    def get_match_details(self, match_id):
        """
        Get detailed match data.

        Args:
            match_id (str): Match ID

        Returns:
            dict: Detailed match data
        """
        url = f"https://{self.continent}.api.riotgames.com/lol/match/v5/matches/{match_id}"
        response = requests.get(url, headers=self.headers)

        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error fetching match details: {response.status_code}")
            return None

    def get_match_timeline(self, match_id):
        """
        Get match timeline with event data.

        Args:
            match_id (str): Match ID

        Returns:
            dict: Timeline data with events (kills, deaths, objectives)
        """
        url = f"https://{self.continent}.api.riotgames.com/lol/match/v5/matches/{match_id}/timeline"
        response = requests.get(url, headers=self.headers)

        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error fetching match timeline: {response.status_code}")
            return None


# Example usage
if __name__ == "__main__":
    # Test the API
    client = RiotAPI()

    # Replace with your own summoner name
    test_summoner = "YourSummonerName"

    print(f"Testing Riot API with summoner: {test_summoner}")
    summoner = client.get_summoner_by_name(test_summoner)

    if summoner:
        print(f"\n✓ Summoner found:")
        print(f"  Name: {summoner['name']}")
        print(f"  Level: {summoner['summonerLevel']}")
        print(f"  ID: {summoner['id']}")

        # Get ranked stats
        ranked = client.get_ranked_stats(summoner['id'])
        if ranked:
            for queue in ranked:
                if queue['queueType'] == 'RANKED_SOLO_5x5':
                    print(f"\n✓ Ranked Solo/Duo:")
                    print(f"  Rank: {queue['tier']} {queue['rank']}")
                    print(f"  LP: {queue['leaguePoints']}")
                    print(f"  Wins: {queue['wins']}")
                    print(f"  Losses: {queue['losses']}")
    else:
        print("✗ Summoner not found. Make sure to use a valid EUNE summoner name.")
