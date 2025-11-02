"""
Riot API client for fetching League of Legends player data.
"""
import os
import requests
import time
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('RIOT_API_KEY')
REGION = os.getenv('RIOT_REGION', 'euw1')  # Europe West (default for testing, will switch to EUNE for production)
CONTINENT = os.getenv('RIOT_CONTINENT', 'europe')


class RiotAPI:
    """Client for interacting with Riot Games API."""

    def __init__(self, api_key=None):
        self.api_key = api_key or API_KEY
        self.region = REGION
        self.continent = CONTINENT
        self.headers = {"X-Riot-Token": self.api_key}

    def get_puuid_by_riot_id(self, game_name, tag_line):
        """
        Get PUUID from Riot ID (gameName + tagLine).
        This is the NEW recommended method as of Nov 2023.

        Args:
            game_name (str): Riot ID game name (e.g., "petRoXD")
            tag_line (str): Riot ID tag line (e.g., "EUW" or "2847")

        Returns:
            dict: Account data including puuid
        """
        url = f"https://{self.continent}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
        response = requests.get(url, headers=self.headers)

        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            print(f"Riot ID not found: {game_name}#{tag_line}")
            return None
        elif response.status_code == 403:
            print(f"Error 403: API key forbidden.")
            print(f"  URL attempted: {url}")
            return None
        else:
            print(f"Error fetching Riot ID: {response.status_code}")
            print(f"Response: {response.text}")
            return None

    def get_summoner_by_puuid(self, puuid):
        """
        Get summoner info by PUUID.

        Args:
            puuid (str): Player PUUID

        Returns:
            dict: Summoner data including summonerLevel, profileIconId
            Note: 'id' field may not be present in newer API versions
        """
        url = f"https://{self.region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}"
        response = requests.get(url, headers=self.headers)

        if response.status_code == 200:
            data = response.json()
            # The API now returns: puuid, summonerLevel, profileIconId, revisionDate
            # 'id' and 'accountId' fields are deprecated/removed
            return data
        else:
            print(f"Error fetching summoner by PUUID: {response.status_code}")
            return None

    def get_summoner_by_riot_id(self, game_name, tag_line):
        """
        Get complete summoner info from Riot ID (NEW recommended method).

        Args:
            game_name (str): Riot ID game name
            tag_line (str): Riot ID tag line

        Returns:
            dict: Complete summoner data with both account and summoner info
        """
        # First get PUUID from account endpoint
        account = self.get_puuid_by_riot_id(game_name, tag_line)
        if not account:
            return None

        # Then get summoner data from summoner endpoint
        summoner = self.get_summoner_by_puuid(account['puuid'])
        if not summoner:
            return None

        # Merge account info (gameName, tagLine) with summoner info
        summoner['gameName'] = account.get('gameName')
        summoner['tagLine'] = account.get('tagLine')

        return summoner

    def get_summoner_by_name(self, summoner_name):
        """
        DEPRECATED: Get summoner info by name.
        Use get_summoner_by_riot_id() instead.

        Args:
            summoner_name (str): Summoner name

        Returns:
            dict: Summoner data including id, puuid, summonerLevel
        """
        print("WARNING: summoner-by-name endpoint is deprecated. Use Riot ID (gameName#tagLine) instead.")
        url = f"https://{self.region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/{summoner_name}"
        response = requests.get(url, headers=self.headers)

        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            print(f"Summoner not found: {summoner_name}")
            return None
        elif response.status_code == 403:
            print(f"Error 403: API key forbidden or endpoint deprecated.")
            print(f"  URL attempted: {url}")
            return None
        else:
            print(f"Error fetching summoner: {response.status_code}")
            print(f"Response: {response.text}")
            return None

    def get_ranked_stats_by_puuid(self, puuid):
        """
        Get ranked stats for a player by PUUID.

        Args:
            puuid (str): Player PUUID

        Returns:
            list: List of ranked stats (Solo/Duo, Flex)
        """
        # Note: There's no direct PUUID endpoint for ranked stats
        # We need to get summoner data first to get the encryptedSummonerId
        # For now, we'll use a workaround
        url = f"https://{self.region}.api.riotgames.com/lol/league/v4/entries/by-puuid/{puuid}"
        response = requests.get(url, headers=self.headers)

        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            # Endpoint might not exist, fallback to old method if we have summoner_id
            return []
        else:
            print(f"Error fetching ranked stats: {response.status_code}")
            return []

    def get_ranked_stats(self, summoner_id):
        """
        DEPRECATED: Get ranked stats for a summoner by ID.
        Use get_ranked_stats_by_puuid() for newer implementations.

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

    # Replace with your own Riot ID
    game_name = "petRoXD"
    tag_line = "EUW"

    print(f"Testing Riot API with Riot ID: {game_name}#{tag_line}")
    summoner = client.get_summoner_by_riot_id(game_name, tag_line)

    if summoner:
        print(f"\n[SUCCESS] Summoner found:")
        print(f"  Game Name: {summoner.get('gameName', game_name)}#{summoner.get('tagLine', tag_line)}")
        print(f"  Level: {summoner.get('summonerLevel', 'N/A')}")
        print(f"  ID: {summoner.get('id', 'N/A')}")
        print(f"  PUUID: {summoner.get('puuid', 'N/A')[:20]}...")

        # Get ranked stats using PUUID
        ranked = None
        if 'puuid' in summoner:
            ranked = client.get_ranked_stats_by_puuid(summoner['puuid'])

        if ranked:
            print(f"\n[SUCCESS] Found {len(ranked)} ranked queue(s)")
            for queue in ranked:
                if queue['queueType'] == 'RANKED_SOLO_5x5':
                    print(f"\n  Ranked Solo/Duo:")
                    print(f"    Rank: {queue['tier']} {queue['rank']}")
                    print(f"    LP: {queue['leaguePoints']}")
                    print(f"    Wins: {queue['wins']}")
                    print(f"    Losses: {queue['losses']}")
                    winrate = (queue['wins'] / (queue['wins'] + queue['losses']) * 100)
                    print(f"    Winrate: {winrate:.1f}%")
        else:
            print("\n[INFO] No ranked stats found (unranked or no games played)")
    else:
        print(f"[ERROR] Summoner not found. Make sure {game_name}#{tag_line} is a valid Riot ID on EUW.")
