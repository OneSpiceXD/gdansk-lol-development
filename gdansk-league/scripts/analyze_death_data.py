"""
Analyze death data to find anomalies
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import json

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY')

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def analyze_deaths():
    """Analyze death data for petRoXD"""

    # Get player PUUID
    player_result = supabase.table('players').select('puuid').eq('summoner_name', 'petRoXD').single().execute()

    if not player_result.data:
        print("Player not found")
        return

    puuid = player_result.data['puuid']
    print(f"Analyzing deaths for petRoXD (PUUID: {puuid[:16]}...)")
    print("="*80)

    # Get all match analytics
    analytics_result = supabase.table('match_analytics_summary') \
        .select('*') \
        .eq('player_puuid', puuid) \
        .eq('queue_id', 420) \
        .order('created_at', desc=True) \
        .limit(20) \
        .execute()

    if not analytics_result.data:
        print("No analytics data found")
        return

    print(f"Found {len(analytics_result.data)} matches\n")

    all_deaths = []

    for i, match in enumerate(analytics_result.data, 1):
        match_id = match['match_id']
        deaths = match.get('deaths', [])

        print(f"\nMatch {i}: {match_id}")
        print(f"  Total deaths: {len(deaths)}")

        if deaths and len(deaths) > 0:
            print(f"  Sample deaths:")
            for j, death in enumerate(deaths[:3], 1):  # Show first 3 deaths
                timestamp_ms = death.get('timestamp', 0)
                timestamp_min = timestamp_ms / 60000
                x = death.get('x', 0)
                y = death.get('y', 0)
                killer = death.get('killer_champion', 'Unknown')

                print(f"    {j}. Time: {timestamp_min:.1f}min, Pos: ({x}, {y}), Killer: {killer}")

                all_deaths.append({
                    'match_id': match_id,
                    'timestamp': timestamp_ms,
                    'timestamp_min': timestamp_min,
                    'x': x,
                    'y': y,
                    'killer': killer
                })

    # Analyze coordinate distribution
    print("\n" + "="*80)
    print("COORDINATE ANALYSIS")
    print("="*80)

    if all_deaths:
        x_coords = [d['x'] for d in all_deaths]
        y_coords = [d['y'] for d in all_deaths]

        print(f"\nX coordinates:")
        print(f"  Min: {min(x_coords)}")
        print(f"  Max: {max(x_coords)}")
        print(f"  Range: {max(x_coords) - min(x_coords)}")

        print(f"\nY coordinates:")
        print(f"  Min: {min(y_coords)}")
        print(f"  Max: {max(y_coords)}")
        print(f"  Range: {max(y_coords) - min(y_coords)}")

        # Check for early game deaths (before 5 min)
        early_deaths = [d for d in all_deaths if d['timestamp_min'] < 5]
        print(f"\n\nEarly game deaths (< 5min): {len(early_deaths)}")
        if early_deaths:
            print("Details:")
            for death in early_deaths[:10]:
                print(f"  {death['timestamp_min']:.1f}min at ({death['x']}, {death['y']}) vs {death['killer']}")

        # Check for deaths in specific regions
        # Bot lane is roughly: x > 8000, y < 8000
        # Mid lane is roughly: 6000 < x < 10000, 6000 < y < 10000
        # Top lane is roughly: x < 8000, y > 8000

        bot_deaths = [d for d in all_deaths if d['x'] > 8000 and d['y'] < 8000]
        mid_deaths = [d for d in all_deaths if 6000 <= d['x'] <= 10000 and 6000 <= d['y'] <= 10000]
        top_deaths = [d for d in all_deaths if d['x'] < 8000 and d['y'] > 8000]

        print(f"\n\nLane distribution (approximate):")
        print(f"  Bot lane: {len(bot_deaths)} deaths ({len(bot_deaths)/len(all_deaths)*100:.1f}%)")
        print(f"  Mid lane: {len(mid_deaths)} deaths ({len(mid_deaths)/len(all_deaths)*100:.1f}%)")
        print(f"  Top lane: {len(top_deaths)} deaths ({len(top_deaths)/len(all_deaths)*100:.1f}%)")
        print(f"  Other: {len(all_deaths) - len(bot_deaths) - len(mid_deaths) - len(top_deaths)} deaths")

if __name__ == "__main__":
    analyze_deaths()
