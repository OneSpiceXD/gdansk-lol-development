"""
Populate mock role-specific stats for testing
Creates realistic match_stats and role_percentiles data
"""
import os
import sys
import random
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import execute_values

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/gdansk_league')

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(DATABASE_URL)

def get_player_id(cursor, summoner_name='petRoXD'):
    """Get player ID for mock data"""
    cursor.execute(
        "SELECT id, tier FROM players WHERE LOWER(summoner_name) = LOWER(%s)",
        (summoner_name,)
    )
    result = cursor.fetchone()
    if result:
        return result[0], result[1]

    # If player doesn't exist, get first player
    cursor.execute("SELECT id, tier FROM players LIMIT 1")
    result = cursor.fetchone()
    if result:
        return result[0], result[1]

    print("ERROR: No players found in database")
    return None, None

def generate_match_stats(player_id, role, num_matches=20):
    """Generate realistic match stats for a role"""
    matches = []

    # Role-specific base stats
    role_stats = {
        'TOP': {
            'cs_per_min': (6.5, 7.5),
            'damage_per_min': (800, 1200),
            'solo_kills': (0, 3),
            'vision_score': (15, 30),
            'kill_participation': (0.35, 0.55),
        },
        'JUNGLE': {
            'cs_per_min': (4.5, 5.5),
            'damage_per_min': (600, 900),
            'vision_score': (30, 50),
            'kill_participation': (0.55, 0.75),
            'objective_control': (1, 4),
        },
        'MID': {
            'cs_per_min': (7.0, 8.5),
            'damage_per_min': (900, 1400),
            'solo_kills': (0, 2),
            'vision_score': (20, 35),
            'kill_participation': (0.50, 0.70),
        },
        'ADC': {
            'cs_per_min': (7.5, 9.0),
            'damage_per_min': (950, 1500),
            'vision_score': (10, 25),
            'kill_participation': (0.45, 0.65),
            'damage_share': (0.25, 0.35),
        },
        'SUPPORT': {
            'cs_per_min': (0.5, 1.5),
            'damage_per_min': (200, 400),
            'vision_score': (50, 80),
            'kill_participation': (0.60, 0.85),
            'crowd_control': (20, 60),
        },
    }

    base = role_stats.get(role, role_stats['MID'])

    for i in range(num_matches):
        # Random match outcome
        win = random.random() > 0.48  # ~52% winrate
        game_duration = random.randint(1200, 2400)  # 20-40 minutes
        game_minutes = game_duration / 60.0

        # Generate stats
        cs_per_min = random.uniform(*base['cs_per_min'])
        total_cs = int(cs_per_min * game_minutes)

        damage_per_min = random.uniform(*base['damage_per_min'])
        total_damage = int(damage_per_min * game_minutes)

        vision_score = int(random.uniform(*base['vision_score']) * (game_minutes / 30))
        vision_per_min = vision_score / game_minutes

        kill_participation = random.uniform(*base['kill_participation'])

        # KDA generation
        if win:
            kills = random.randint(3, 12)
            deaths = random.randint(1, 6)
            assists = random.randint(4, 15)
        else:
            kills = random.randint(1, 8)
            deaths = random.randint(3, 10)
            assists = random.randint(2, 10)

        # Role-specific metrics
        gold_earned = int(random.uniform(9000, 16000))
        damage_taken = int(random.uniform(15000, 35000))
        damage_mitigated = int(random.uniform(5000, 15000))

        # Calculate derived metrics
        gold_efficiency = total_damage / gold_earned if gold_earned > 0 else 0
        positioning_score = total_damage / max(deaths, 1)
        durability_score = int((damage_taken + damage_mitigated) / max(deaths, 1))

        match_data = {
            'player_id': player_id,
            'match_id': f'EUW1_mock_{role}_{i}_{random.randint(1000000, 9999999)}',
            'role': role,
            'champion_id': random.randint(1, 150),
            'game_duration': game_duration,
            'win': win,
            'kills': kills,
            'deaths': deaths,
            'assists': assists,
            'total_minions_killed': int(total_cs * 0.85),
            'neutral_minions_killed': int(total_cs * 0.15),
            'cs_per_minute': round(cs_per_min, 2),
            'total_damage_to_champions': total_damage,
            'damage_per_minute': round(damage_per_min, 2),
            'damage_share': round(random.uniform(0.15, 0.35), 4) if role != 'SUPPORT' else round(random.uniform(0.05, 0.15), 4),
            'total_damage_taken': damage_taken,
            'damage_self_mitigated': damage_mitigated,
            'gold_earned': gold_earned,
            'vision_score': vision_score,
            'vision_score_per_minute': round(vision_per_min, 2),
            'wards_placed': int(vision_score * 0.6),
            'wards_killed': int(vision_score * 0.2),
            'control_wards_purchased': random.randint(2, 8),
            'damage_to_turrets': random.randint(2000, 8000),
            'damage_to_objectives': random.randint(3000, 12000),
            'turret_plates_taken': random.randint(0, 3),
            'turrets_killed': random.randint(0, 2),
            'dragon_kills': random.randint(0, 2) if role == 'JUNGLE' else random.randint(0, 1),
            'baron_kills': random.randint(0, 1),
            'rift_herald_kills': random.randint(0, 1) if role == 'JUNGLE' else 0,
            'time_ccing_others': random.randint(10, 60) if role == 'SUPPORT' else random.randint(5, 30),
            'total_heal_on_teammates': random.randint(0, 5000) if role == 'SUPPORT' else 0,
            'total_damage_shielded_on_teammates': random.randint(0, 3000) if role == 'SUPPORT' else 0,
            'kill_participation': round(kill_participation, 4),
            'solo_kills': random.randint(0, 3) if role in ['TOP', 'MID'] else 0,
            'takedowns_first_15_min': random.randint(0, 5),
            'save_ally_from_death': random.randint(0, 3) if role == 'SUPPORT' else 0,
            'gold_efficiency': round(gold_efficiency, 2),
            'positioning_score': int(positioning_score),
            'death_efficiency': round((assists + random.randint(0, 2)) / max(deaths, 1), 2) if role == 'SUPPORT' else None,
            'objective_control_score': (random.randint(0, 2) + random.randint(0, 1) + random.randint(0, 1)) if role == 'JUNGLE' else None,
            'early_game_dominance': round(random.uniform(0.5, 3.0), 2) if role == 'TOP' else None,
            'durability_score': durability_score if role == 'TOP' else None,
            'split_push_pressure': round(random.uniform(5.0, 15.0), 1) if role == 'TOP' else None,
            'roaming_impact': random.randint(0, 4) if role in ['MID', 'SUPPORT'] else None,
            'jungle_proximity': None,  # Complex metric, skip for mock data
            'recorded_at': datetime.now() - timedelta(days=random.randint(0, 30)),
        }

        matches.append(match_data)

    return matches

def insert_match_stats(cursor, matches):
    """Insert match stats into database"""
    if not matches:
        return

    columns = matches[0].keys()
    values = [[m[col] for col in columns] for m in matches]

    insert_query = f"""
        INSERT INTO match_stats ({', '.join(columns)})
        VALUES %s
        ON CONFLICT (player_id, match_id) DO NOTHING
    """

    execute_values(cursor, insert_query, values)
    print(f"✓ Inserted {len(matches)} match records")

def generate_percentile_data(role, tier='PLATINUM', region='POLISH'):
    """Generate mock percentile data for benchmarking"""

    # Different base stats for different tiers
    tier_multipliers = {
        'IRON': 0.5,
        'BRONZE': 0.6,
        'SILVER': 0.75,
        'GOLD': 0.85,
        'PLATINUM': 1.0,
        'EMERALD': 1.1,
        'DIAMOND': 1.25,
        'MASTER': 1.4,
        'GRANDMASTER': 1.5,
        'CHALLENGER': 1.6,
    }

    multiplier = tier_multipliers.get(tier, 1.0)

    # Region differences (EUW slightly higher on average)
    region_mod = 1.05 if region == 'EUW' else 1.0

    # Metric base values
    metrics = {
        'TOP': {
            'cs_per_minute': 7.0,
            'damage_per_minute': 1000,
            'solo_kills': 1.5,
            'early_game_dominance': 1.8,
            'durability_score': 15000,
            'split_push_pressure': 10.0,
        },
        'JUNGLE': {
            'cs_per_minute': 5.0,
            'kill_participation': 0.65,
            'objective_control_score': 2.5,
            'takedowns_first_15_min': 3.0,
            'vision_score': 40,
        },
        'MID': {
            'damage_per_minute': 1100,
            'cs_per_minute': 7.5,
            'roaming_impact': 2.0,
            'kill_participation': 0.60,
            'solo_kills': 1.2,
            'vision_score': 25,
        },
        'ADC': {
            'damage_per_minute': 1200,
            'cs_per_minute': 8.0,
            'damage_share': 0.30,
            'gold_efficiency': 1.2,
            'positioning_score': 8000,
            'damage_to_objectives': 8000,
        },
        'SUPPORT': {
            'vision_score_per_minute': 2.0,
            'kill_participation': 0.70,
            'time_ccing_others': 40,
            'roaming_impact': 2.5,
            'gold_efficiency': 0.8,
            'death_efficiency': 4.0,
        },
    }

    role_metrics = metrics.get(role, {})
    percentile_data = []

    for metric_name, base_value in role_metrics.items():
        # Apply multipliers
        mean = base_value * multiplier * region_mod

        # Generate percentile distribution (assume normal-ish distribution)
        # p90 is top 10%, p10 is bottom 10%
        percentiles = {
            'p10': mean * 0.6,
            'p20': mean * 0.75,
            'p30': mean * 0.85,
            'p40': mean * 0.92,
            'p50': mean,  # median
            'p60': mean * 1.08,
            'p70': mean * 1.15,
            'p80': mean * 1.25,
            'p90': mean * 1.4,
        }

        percentile_data.append({
            'role': role,
            'tier': tier,
            'region': region,
            'metric_name': metric_name,
            **percentiles,
            'sample_size': random.randint(500, 2000),
            'mean_value': round(mean, 2),
            'std_dev': round(mean * 0.2, 2),  # 20% std dev
        })

    return percentile_data

def insert_percentile_data(cursor, percentiles):
    """Insert percentile data into database"""
    if not percentiles:
        return

    columns = percentiles[0].keys()
    values = [[p[col] for col in columns] for p in percentiles]

    insert_query = f"""
        INSERT INTO role_percentiles ({', '.join(columns)})
        VALUES %s
        ON CONFLICT (role, tier, region, metric_name) DO UPDATE
        SET p10 = EXCLUDED.p10,
            p20 = EXCLUDED.p20,
            p30 = EXCLUDED.p30,
            p40 = EXCLUDED.p40,
            p50 = EXCLUDED.p50,
            p60 = EXCLUDED.p60,
            p70 = EXCLUDED.p70,
            p80 = EXCLUDED.p80,
            p90 = EXCLUDED.p90,
            sample_size = EXCLUDED.sample_size,
            mean_value = EXCLUDED.mean_value,
            std_dev = EXCLUDED.std_dev,
            last_updated = NOW()
    """

    execute_values(cursor, insert_query, values)
    print(f"✓ Inserted/updated {len(percentiles)} percentile records")

def main():
    """Main function to populate mock data"""
    print("Populating mock role-specific stats...")

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get player to populate data for
        player_id, player_tier = get_player_id(cursor)
        if not player_id:
            print("ERROR: No players found in database")
            return

        print(f"Generating data for player: {player_id} (Tier: {player_tier})")

        # Generate match stats for each role
        roles = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT']

        for role in roles:
            print(f"\nGenerating {role} stats...")

            # Generate match stats (more games for main role)
            num_matches = 50 if role == 'TOP' else random.randint(15, 30)
            matches = generate_match_stats(player_id, role, num_matches)
            insert_match_stats(cursor, matches)

        # Generate percentile data for all roles and tiers
        print("\nGenerating percentile benchmarks...")

        tiers = ['IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'EMERALD', 'DIAMOND']
        regions = ['POLISH', 'EUW']

        all_percentiles = []
        for role in roles:
            for tier in tiers:
                for region in regions:
                    percentiles = generate_percentile_data(role, tier, region)
                    all_percentiles.extend(percentiles)

        insert_percentile_data(cursor, all_percentiles)

        conn.commit()
        print("\nMock data population complete!")
        print(f"   - Match stats for {len(roles)} roles")
        print(f"   - Percentile data for {len(tiers)} tiers x {len(regions)} regions")

    except Exception as e:
        conn.rollback()
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main()
