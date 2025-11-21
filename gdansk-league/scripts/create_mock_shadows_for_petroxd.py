"""
Create Mock Shadow Recommendations for petRoXD

Creates 3 mock shadow player recommendations for testing the shadow system.
Simulates the matching algorithm results.

Usage: python create_mock_shadows_for_petRoxd.py
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv(override=True)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY')

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_mock_shadows():
    """Create mock shadow recommendations for petRoXD"""

    print("=" * 80)
    print("CREATING MOCK SHADOW RECOMMENDATIONS FOR petRoXD")
    print("=" * 80)
    print()

    # Get petRoXD's PUUID
    try:
        result = supabase.table('players').select('puuid, tier, rank').eq('summoner_name', 'petRoXD').single().execute()
        user = result.data

        if not user:
            print("[ERROR] petRoXD not found in database")
            return

        print(f"Found user: petRoXD ({user['tier']} {user['rank']})")
        print(f"PUUID: {user['puuid']}")
        print()

        # Get shadow-eligible players
        shadows_result = supabase.table('players').select('puuid, summoner_name, tier, rank, main_role').eq('is_shadow_eligible', True).execute()
        shadow_players = shadows_result.data

        print(f"Available shadow-eligible players: {len(shadow_players)}")
        for player in shadow_players:
            print(f"  - {player['summoner_name']} ({player['tier']} {player['rank']}) - {player['main_role']}")
        print()

        # Create 3 mock recommendations
        mock_recommendations = [
            {
                'user_puuid': user['puuid'],
                'shadow_puuid': shadow_players[0]['puuid'] if len(shadow_players) > 0 else 'mock_puuid_1',
                'role': 'ADC',
                'similarity_score': 87.5,
                'shared_champions': ['Jinx', 'Caitlyn', 'Ashe'],
                'user_weakness': 'high_early_deaths',
                'shadow_strength': 'early_game_safety',
                'reasoning': {
                    'comparison': 'You die 38% early game -> They die 15%',
                    'champion_overlap': '3/5',
                    'detailed_stats': {
                        'user_early_death_rate': 38,
                        'shadow_early_death_rate': 15,
                        'user_cs_per_min': 6.2,
                        'shadow_cs_per_min': 8.1,
                        'user_vision_score': 0.9,
                        'shadow_vision_score': 1.4
                    },
                    'explanation': 'You struggle with early game deaths. This player excels at staying safe before 15min and has similar champion pool.'
                }
            },
            {
                'user_puuid': user['puuid'],
                'shadow_puuid': shadow_players[1]['puuid'] if len(shadow_players) > 1 else 'mock_puuid_2',
                'role': 'ADC',
                'similarity_score': 82.3,
                'shared_champions': ['Jinx', 'Kai\'Sa'],
                'user_weakness': 'low_vision',
                'shadow_strength': 'vision_control',
                'reasoning': {
                    'comparison': 'Your vision: 0.9/min -> Theirs: 1.8/min',
                    'champion_overlap': '2/5',
                    'detailed_stats': {
                        'user_vision_score': 0.9,
                        'shadow_vision_score': 1.8,
                        'user_wards_placed': 12,
                        'shadow_wards_placed': 22,
                        'user_control_wards': 2,
                        'shadow_control_wards': 5
                    },
                    'explanation': 'Your vision control needs work. This player averages high vision scores and wards strategically.'
                }
            },
            {
                'user_puuid': user['puuid'],
                'shadow_puuid': shadow_players[2]['puuid'] if len(shadow_players) > 2 else 'mock_puuid_3',
                'role': 'ADC',
                'similarity_score': 79.8,
                'shared_champions': ['Caitlyn', 'Ashe'],
                'user_weakness': 'poor_cs',
                'shadow_strength': 'farming_efficiency',
                'reasoning': {
                    'comparison': 'Your CS: 6.2/min -> Theirs: 8.5/min',
                    'champion_overlap': '2/5',
                    'detailed_stats': {
                        'user_cs_per_min': 6.2,
                        'shadow_cs_per_min': 8.5,
                        'user_cs_at_10': 72,
                        'shadow_cs_at_10': 89,
                        'user_gold_per_min': 320,
                        'shadow_gold_per_min': 415
                    },
                    'explanation': 'Your farm efficiency could improve. This player maintains high CS/min throughout the game.'
                }
            }
        ]

        # Insert recommendations
        print("Creating shadow recommendations...")
        for i, rec in enumerate(mock_recommendations, 1):
            try:
                # Delete existing recommendation if exists
                supabase.table('shadow_recommendations').delete().eq('user_puuid', rec['user_puuid']).eq('shadow_puuid', rec['shadow_puuid']).execute()

                # Insert new recommendation
                supabase.table('shadow_recommendations').insert(rec).execute()

                shadow_name = next((p['summoner_name'] for p in shadow_players if p['puuid'] == rec['shadow_puuid']), 'MockPlayer' + str(i))
                print(f"  [{i}/3] Created recommendation: {shadow_name} (Score: {rec['similarity_score']}%)")
            except Exception as e:
                print(f"  [ERROR] Failed to create recommendation {i}: {e}")

        print()
        print("=" * 80)
        print("MOCK DATA CREATED!")
        print("=" * 80)
        print()
        print("You can now test the shadow system with:")
        print(f"  GET /api/player/petRoXD/shadows")
        print()

    except Exception as e:
        print(f"\n[ERROR] Failed to create mock shadows: {e}")
        raise

if __name__ == "__main__":
    create_mock_shadows()
