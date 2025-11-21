"""
Validate map coordinate accuracy by checking known landmarks
This script queries building_kills and elite_monster_kills to verify coordinate ranges
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

# Known Summoner's Rift landmark coordinates (approximate)
KNOWN_LANDMARKS = {
    'Baron Nashor': {'x': 5200, 'y': 10200, 'tolerance': 500},
    'Dragon': {'x': 9800, 'y': 4400, 'tolerance': 500},
    'Blue Bot Outer Tower': {'x': 10504, 'y': 1029, 'tolerance': 100},
    'Blue Mid Outer Tower': {'x': 5846, 'y': 6396, 'tolerance': 100},
    'Red Top Outer Tower': {'x': 4318, 'y': 13875, 'tolerance': 200},
}

def analyze_coordinates():
    """Analyze actual coordinates from database"""

    print("="*80)
    print("SUMMONER'S RIFT COORDINATE VALIDATION")
    print("="*80)

    # Get all match analytics
    result = supabase.table('match_analytics_summary') \
        .select('building_kills, elite_monster_kills, deaths') \
        .limit(50) \
        .execute()

    if not result.data:
        print("No data found")
        return

    all_buildings = []
    all_monsters = []
    all_deaths = []

    for match in result.data:
        if match.get('building_kills'):
            all_buildings.extend(match['building_kills'])
        if match.get('elite_monster_kills'):
            all_monsters.extend(match['elite_monster_kills'])
        if match.get('deaths'):
            all_deaths.extend(match['deaths'])

    print(f"\nFound {len(all_buildings)} building kills")
    print(f"Found {len(all_monsters)} elite monster kills")
    print(f"Found {len(all_deaths)} deaths")

    # Analyze coordinate ranges
    print("\n" + "="*80)
    print("COORDINATE RANGES IN ACTUAL DATA")
    print("="*80)

    if all_deaths:
        x_coords = [d['x'] for d in all_deaths if d.get('x') is not None]
        y_coords = [d['y'] for d in all_deaths if d.get('y') is not None]

        if x_coords and y_coords:
            print(f"\nDeath coordinates:")
            print(f"  X: {min(x_coords)} to {max(x_coords)} (range: {max(x_coords) - min(x_coords)})")
            print(f"  Y: {min(y_coords)} to {max(y_coords)} (range: {max(y_coords) - min(y_coords)})")

    if all_buildings:
        building_coords = [(b['x'], b['y']) for b in all_buildings if b.get('x') is not None]
        if building_coords:
            x_coords = [c[0] for c in building_coords]
            y_coords = [c[1] for c in building_coords]
            print(f"\nBuilding coordinates:")
            print(f"  X: {min(x_coords)} to {max(x_coords)} (range: {max(x_coords) - min(x_coords)})")
            print(f"  Y: {min(y_coords)} to {max(y_coords)} (range: {max(y_coords) - min(y_coords)})")

            # Show sample tower positions
            print(f"\n  Sample tower positions:")
            tower_samples = {}
            for b in all_buildings[:20]:
                if b.get('type') == 'TOWER_BUILDING':
                    lane = b.get('lane', 'UNKNOWN')
                    tower_type = b.get('tower_type', 'UNKNOWN')
                    key = f"{lane}_{tower_type}"
                    if key not in tower_samples:
                        tower_samples[key] = (b['x'], b['y'])

            for key, (x, y) in sorted(tower_samples.items()):
                print(f"    {key}: ({x}, {y})")

    if all_monsters:
        monster_coords = {}
        for m in all_monsters:
            monster_type = m.get('type', 'UNKNOWN')
            if monster_type not in monster_coords:
                monster_coords[monster_type] = []
            if m.get('x') is not None and m.get('y') is not None:
                monster_coords[monster_type].append((m['x'], m['y']))

        print(f"\nElite monster coordinates:")
        for monster_type, coords in monster_coords.items():
            if coords:
                x_vals = [c[0] for c in coords]
                y_vals = [c[1] for c in coords]
                avg_x = sum(x_vals) / len(x_vals)
                avg_y = sum(y_vals) / len(y_vals)
                print(f"  {monster_type}: avg ({avg_x:.0f}, {avg_y:.0f}) from {len(coords)} kills")
                print(f"    X range: {min(x_vals)} to {max(x_vals)}")
                print(f"    Y range: {min(y_vals)} to {max(y_vals)}")

    # Validate against known landmarks
    print("\n" + "="*80)
    print("LANDMARK VALIDATION")
    print("="*80)

    # Check Baron coordinates
    if all_monsters:
        baron_kills = [m for m in all_monsters if m.get('type') == 'BARON_NASHOR']
        if baron_kills:
            baron_coords = [(b['x'], b['y']) for b in baron_kills if b.get('x') is not None]
            if baron_coords:
                avg_x = sum(c[0] for c in baron_coords) / len(baron_coords)
                avg_y = sum(c[1] for c in baron_coords) / len(baron_coords)
                expected = KNOWN_LANDMARKS['Baron Nashor']
                diff_x = abs(avg_x - expected['x'])
                diff_y = abs(avg_y - expected['y'])
                status = "OK" if diff_x < expected['tolerance'] and diff_y < expected['tolerance'] else "MISMATCH"
                print(f"\n[{status}] Baron Nashor:")
                print(f"  Expected: ({expected['x']}, {expected['y']})")
                print(f"  Actual avg: ({avg_x:.0f}, {avg_y:.0f})")
                print(f"  Difference: ({diff_x:.0f}, {diff_y:.0f})")

    # Check Dragon coordinates
    if all_monsters:
        dragon_kills = [m for m in all_monsters if m.get('type') == 'DRAGON']
        if dragon_kills:
            dragon_coords = [(d['x'], d['y']) for d in dragon_kills if d.get('x') is not None]
            if dragon_coords:
                avg_x = sum(c[0] for c in dragon_coords) / len(dragon_coords)
                avg_y = sum(c[1] for c in dragon_coords) / len(dragon_coords)
                expected = KNOWN_LANDMARKS['Dragon']
                diff_x = abs(avg_x - expected['x'])
                diff_y = abs(avg_y - expected['y'])
                status = "OK" if diff_x < expected['tolerance'] and diff_y < expected['tolerance'] else "MISMATCH"
                print(f"\n[{status}] Dragon:")
                print(f"  Expected: ({expected['x']}, {expected['y']})")
                print(f"  Actual avg: ({avg_x:.0f}, {avg_y:.0f})")
                print(f"  Difference: ({diff_x:.0f}, {diff_y:.0f})")

    # Recommendations
    print("\n" + "="*80)
    print("RECOMMENDATIONS")
    print("="*80)

    if all_deaths:
        x_coords = [d['x'] for d in all_deaths if d.get('x') is not None]
        y_coords = [d['y'] for d in all_deaths if d.get('y') is not None]

        if x_coords and y_coords:
            max_x = max(x_coords)
            max_y = max(y_coords)

            print(f"\nObserved maximum coordinates:")
            print(f"  Max X: {max_x}")
            print(f"  Max Y: {max_y}")

            print(f"\nRecommended MAP constants:")
            print(f"  MAP_WIDTH = {14870}  (Summoner's Rift standard)")
            print(f"  MAP_HEIGHT = {14980}  (Summoner's Rift standard)")

            print(f"\nCurrent code uses MAP_SIZE = 16000")
            print(f"  This causes {((16000 - 14870) / 16000 * 100):.1f}% horizontal compression")
            print(f"  This causes {((16000 - 14980) / 16000 * 100):.1f}% vertical compression")

if __name__ == "__main__":
    analyze_coordinates()
