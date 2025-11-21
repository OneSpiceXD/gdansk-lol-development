"""
Find the specific game with the 3min death vs Garen
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY')

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def find_garen_death():
    """Find the match with 3min death vs Garen"""

    # Get player PUUID
    player_result = supabase.table('players').select('puuid, id').eq('summoner_name', 'petRoXD').single().execute()

    if not player_result.data:
        print("Player not found")
        return

    puuid = player_result.data['puuid']
    player_id = player_result.data['id']

    # Get the specific match
    analytics_result = supabase.table('match_analytics_summary') \
        .select('*') \
        .eq('player_puuid', puuid) \
        .eq('match_id', 'EUW1_7590011035') \
        .single() \
        .execute()

    if not analytics_result.data:
        print("Match not found")
        return

    match = analytics_result.data
    match_id = match['match_id']
    deaths = match.get('deaths', [])

    print("="*80)
    print(f"MATCH: {match_id}")
    print("="*80)

    # Get match stats for this game (to find role)
    match_stats = supabase.table('match_stats') \
        .select('*') \
        .eq('player_id', player_id) \
        .eq('match_id', match_id) \
        .execute()

    if match_stats.data and len(match_stats.data) > 0:
        stats = match_stats.data[0]
        print(f"\nRole: {stats.get('role', 'Unknown')}")
        print(f"Champion: {stats.get('champion_name', 'Unknown')}")
        print(f"Result: {'Win' if stats.get('win') else 'Loss'}")
        print(f"KDA: {stats.get('kills')}/{stats.get('deaths')}/{stats.get('assists')}")

        # Try to get match date
        if 'match_date' in stats:
            match_date = stats['match_date']
            if match_date:
                # Parse the date
                try:
                    dt = datetime.fromisoformat(match_date.replace('Z', '+00:00'))
                    print(f"Date: {dt.strftime('%Y-%m-%d %H:%M:%S UTC')}")
                except:
                    print(f"Date: {match_date}")
    else:
        print("\nNo match_stats found for this game")

    print("\n" + "="*80)
    print("ALL DEATHS IN THIS MATCH:")
    print("="*80)

    for i, death in enumerate(deaths, 1):
        timestamp_ms = death.get('timestamp', 0)
        timestamp_min = timestamp_ms / 60000
        x = death.get('x', 0)
        y = death.get('y', 0)
        killer = death.get('killer_champion', 'Unknown')

        marker = " <-- THIS ONE" if abs(timestamp_min - 3.0) < 0.1 and killer == 'Garen' else ""
        print(f"{i}. Time: {timestamp_min:.1f}min, Position: ({x}, {y}), Killer: {killer}{marker}")

    print("\n" + "="*80)
    print(f"Match ID for op.gg: {match_id}")
    print(f"https://www.op.gg/summoners/euw/petRoXD-EUW (look for this match)")
    print("="*80)

if __name__ == "__main__":
    find_garen_death()
