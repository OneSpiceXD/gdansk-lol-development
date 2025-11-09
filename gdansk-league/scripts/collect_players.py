"""
Player Data Collection Script
Reads player names from file and fetches their stats from Riot API
Outputs to CSV for analysis or database import
"""

import csv
import os
from datetime import datetime
from typing import List, Dict
from riot_api import get_player_full_data, RiotAPIError


# Paths
PLAYER_NAMES_FILE = "../data/player_names.txt"
OUTPUT_CSV_FILE = "../data/collected_players.csv"


def read_player_names(file_path: str) -> List[str]:
    """
    Read player names from text file

    Args:
        file_path: Path to file containing player names (one per line)

    Returns:
        List of player names (stripped and non-empty)
    """
    if not os.path.exists(file_path):
        print(f"Error: File not found: {file_path}")
        print(f"Please create {file_path} and add player names (one per line)")
        return []

    with open(file_path, 'r', encoding='utf-8') as f:
        names = [line.strip() for line in f if line.strip() and not line.startswith('#')]

    print(f"Loaded {len(names)} player names from {file_path}")
    return names


def save_to_csv(players_data: List[Dict], output_file: str):
    """
    Save player data to CSV file

    Args:
        players_data: List of player data dictionaries
        output_file: Output CSV file path
    """
    if not players_data:
        print("No data to save")
        return

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    # CSV headers
    headers = [
        'summoner_name',
        'puuid',
        'summoner_id',
        'summoner_level',
        'tier',
        'rank',
        'lp',
        'wins',
        'losses',
        'winrate',
        'collected_at'
    ]

    # Write to CSV
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()

        for player in players_data:
            # Add timestamp
            player['collected_at'] = datetime.now().isoformat()
            writer.writerow(player)

    print(f"\n✓ Saved {len(players_data)} players to {output_file}")


def collect_players(player_names: List[str], save_partial: bool = True) -> List[Dict]:
    """
    Collect data for multiple players from Riot API

    Args:
        player_names: List of summoner names to fetch
        save_partial: If True, save partial results even if some players fail

    Returns:
        List of successfully collected player data
    """
    collected_players = []
    failed_players = []

    total = len(player_names)
    print(f"\n=== Starting Collection for {total} Players ===\n")

    for i, name in enumerate(player_names, 1):
        print(f"[{i}/{total}] Processing: {name}")

        try:
            player_data = get_player_full_data(name)

            if player_data:
                collected_players.append(player_data)
                print(f"  ✓ Success: {player_data['tier']} {player_data['rank']} ({player_data['lp']} LP)")
            else:
                failed_players.append(name)
                print(f"  ✗ Failed: Player not found or API error")

        except RiotAPIError as e:
            print(f"  ✗ API Error: {str(e)}")
            failed_players.append(name)
            break  # Stop on critical API errors (e.g., invalid key)

        except Exception as e:
            print(f"  ✗ Unexpected error: {str(e)}")
            failed_players.append(name)

        # Save partial results every 10 players
        if save_partial and len(collected_players) % 10 == 0:
            save_to_csv(collected_players, OUTPUT_CSV_FILE)
            print(f"\n  💾 Autosaved {len(collected_players)} players\n")

    # Summary
    print(f"\n=== Collection Complete ===")
    print(f"✓ Successful: {len(collected_players)}/{total}")
    print(f"✗ Failed: {len(failed_players)}/{total}")

    if failed_players:
        print(f"\nFailed players:")
        for name in failed_players:
            print(f"  - {name}")

    return collected_players


def main():
    """Main execution function"""
    print("=" * 60)
    print("  Gdansk LoL Project - Player Data Collection")
    print("=" * 60)

    # Check if player names file exists
    if not os.path.exists(PLAYER_NAMES_FILE):
        print(f"\n✗ Error: {PLAYER_NAMES_FILE} not found")
        print(f"\nCreating sample file at {PLAYER_NAMES_FILE}...")

        # Create sample file
        os.makedirs(os.path.dirname(PLAYER_NAMES_FILE), exist_ok=True)
        with open(PLAYER_NAMES_FILE, 'w', encoding='utf-8') as f:
            f.write("# Add summoner names here (one per line)\n")
            f.write("# Lines starting with # are ignored\n\n")
            f.write("# Example:\n")
            f.write("# Faker\n")
            f.write("# Caps\n")
            f.write("# Jankos\n\n")

        print(f"✓ Created template file: {PLAYER_NAMES_FILE}")
        print("\nPlease add player names to this file and run the script again.")
        return

    # Read player names
    player_names = read_player_names(PLAYER_NAMES_FILE)

    if not player_names:
        print("\n✗ No player names found in file")
        print(f"Please add player names to {PLAYER_NAMES_FILE} (one per line)")
        return

    # Collect player data
    collected_data = collect_players(player_names, save_partial=True)

    # Save final results
    if collected_data:
        save_to_csv(collected_data, OUTPUT_CSV_FILE)

        # Display summary stats
        print(f"\n=== Data Summary ===")

        # Rank distribution
        rank_counts = {}
        for player in collected_data:
            rank = f"{player['tier']} {player['rank']}" if player['rank'] else player['tier']
            rank_counts[rank] = rank_counts.get(rank, 0) + 1

        print(f"\nRank Distribution:")
        for rank, count in sorted(rank_counts.items(), reverse=True):
            print(f"  {rank}: {count} players")

        # Average stats
        total_lp = sum(p['lp'] for p in collected_data)
        total_wins = sum(p['wins'] for p in collected_data)
        total_losses = sum(p['losses'] for p in collected_data)
        avg_winrate = sum(p['winrate'] for p in collected_data) / len(collected_data)

        print(f"\nAverage Stats:")
        print(f"  LP: {total_lp / len(collected_data):.1f}")
        print(f"  Wins: {total_wins / len(collected_data):.1f}")
        print(f"  Losses: {total_losses / len(collected_data):.1f}")
        print(f"  Winrate: {avg_winrate:.1f}%")

        print(f"\n✓ Collection complete! Data saved to {OUTPUT_CSV_FILE}")
        print(f"\nNext steps:")
        print(f"  1. Review the CSV file: {OUTPUT_CSV_FILE}")
        print(f"  2. Set up Supabase database")
        print(f"  3. Import CSV data to Supabase")

    else:
        print("\n✗ No data collected. Check your player names and API key.")


if __name__ == "__main__":
    main()
