"""
Apply migration 007: Add champion_name column to match_stats
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

def apply_migration():
    """Apply migration 007"""
    print("Applying migration 007: Add champion_name column to match_stats")

    # Read migration file
    migration_path = "../migrations/007_add_champion_name_to_match_stats.sql"

    with open(migration_path, 'r') as f:
        sql = f.read()

    print(f"Migration SQL:\n{sql}\n")

    # Execute via Supabase RPC (note: direct SQL execution requires PostgREST or SQL Editor)
    # Since we can't execute raw SQL directly via supabase-py, we'll provide instructions
    print("[INFO] Migration SQL loaded. You need to apply this via Supabase SQL Editor:")
    print("1. Go to https://supabase.com/dashboard/project/xscghiegdbybqbubbywm/sql/new")
    print("2. Paste the SQL from migrations/007_add_champion_name_to_match_stats.sql")
    print("3. Click 'Run'")
    print("\nOr you can run it directly in psql if you have database credentials.")

if __name__ == "__main__":
    apply_migration()
