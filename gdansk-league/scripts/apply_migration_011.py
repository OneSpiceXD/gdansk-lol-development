"""
Apply migration 011: Add team_id to tables for blue/red side filtering
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
    """Apply migration 011"""
    print("Applying migration 011: Add team_id columns for blue/red side filtering")

    # Read migration file
    migration_path = "../migrations/011_add_team_side_to_tables.sql"

    with open(migration_path, 'r') as f:
        sql = f.read()

    print(f"Migration SQL:\n{sql}\n")

    # Execute via Supabase SQL Editor (direct SQL execution requires PostgREST or SQL Editor)
    print("[INFO] Migration SQL loaded. You need to apply this via Supabase SQL Editor:")
    print("1. Go to Supabase Dashboard > SQL Editor")
    print("2. Paste the SQL from migrations/011_add_team_side_to_tables.sql")
    print("3. Click 'Run'")
    print("\nOr you can run it directly in psql if you have database credentials.")

if __name__ == "__main__":
    apply_migration()
