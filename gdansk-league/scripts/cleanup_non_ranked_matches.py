"""
Clean up non-ranked solo/duo matches from database
This script removes any matches with queue_id != 420 from both tables
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY')

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def cleanup_match_analytics():
    """Remove non-ranked solo/duo matches from match_analytics_summary"""
    print("Cleaning up match_analytics_summary...")

    # First, check how many non-ranked matches we have
    try:
        result = supabase.table('match_analytics_summary') \
            .select('id', count='exact') \
            .neq('queue_id', 420) \
            .execute()

        count = result.count if hasattr(result, 'count') else len(result.data)
        print(f"Found {count} non-ranked solo/duo matches in match_analytics_summary")

        if count == 0:
            print("[OK] No non-ranked matches to clean up")
            return

        # Ask for confirmation
        response = input(f"Delete {count} non-ranked matches? (yes/no): ")
        if response.lower() != 'yes':
            print("[SKIP] Cleanup cancelled")
            return

        # Delete non-ranked matches
        delete_result = supabase.table('match_analytics_summary') \
            .delete() \
            .neq('queue_id', 420) \
            .execute()

        print(f"[OK] Deleted {count} non-ranked matches from match_analytics_summary")

    except Exception as e:
        print(f"[ERROR] Failed to clean up match_analytics_summary: {e}")

def cleanup_match_stats():
    """Check match_stats table (this table doesn't have queue_id yet)"""
    print("\nNote: match_stats table doesn't have queue_id column")
    print("If needed, we can add it in a future migration")

def main():
    print("="*60)
    print("Cleanup Non-Ranked Solo/Duo Matches")
    print("="*60)
    print("\nThis script will remove matches where queue_id != 420")
    print("Queue IDs:")
    print("  420 = Ranked Solo/Duo (KEEP)")
    print("  440 = Ranked Flex (DELETE)")
    print("  450 = ARAM (DELETE)")
    print("  Others = Normal games, etc. (DELETE)")
    print()

    cleanup_match_analytics()
    cleanup_match_stats()

    print("\n" + "="*60)
    print("[OK] Cleanup complete!")
    print("="*60)

if __name__ == "__main__":
    main()
