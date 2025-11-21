"""
Clean match data before repopulation
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

def clean_data():
    """Delete all match data to prepare for repopulation"""
    print("="*80)
    print("CLEANING MATCH DATA")
    print("="*80)
    print()

    try:
        # Delete from match_analytics_summary
        print("Deleting from match_analytics_summary...")
        result1 = supabase.table('match_analytics_summary').delete().neq('match_id', '').execute()
        print(f"[OK] Deleted records from match_analytics_summary")

        # Delete from match_stats
        print("Deleting from match_stats...")
        result2 = supabase.table('match_stats').delete().neq('match_id', '').execute()
        print(f"[OK] Deleted records from match_stats")

        print()
        print("="*80)
        print("CLEANUP COMPLETE")
        print("="*80)
        print("You can now run repopulate_ranked_data.py to fetch fresh data with team_id")

    except Exception as e:
        print(f"[ERROR] Failed to clean data: {e}")
        raise

if __name__ == "__main__":
    clean_data()
