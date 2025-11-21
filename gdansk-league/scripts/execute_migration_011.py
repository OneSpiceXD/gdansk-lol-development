"""
Execute migration 011 using Supabase REST API
"""
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('SUPABASE_ANON_KEY')

def execute_sql(sql: str):
    """Execute SQL via Supabase REST API"""
    # Supabase REST API doesn't support arbitrary SQL execution for security reasons
    # We need to use the Supabase SQL Editor or a database connection
    print("="*80)
    print("MIGRATION 011: Add team_id columns")
    print("="*80)
    print()
    print("Unfortunately, Supabase doesn't allow SQL execution via the REST API.")
    print("You have two options:")
    print()
    print("OPTION 1: Supabase SQL Editor (Recommended)")
    print("-" * 80)
    print("1. Go to your Supabase Dashboard: https://supabase.com/dashboard")
    print("2. Navigate to: SQL Editor > New Query")
    print("3. Copy and paste the following SQL:")
    print()
    print(sql)
    print()
    print("4. Click 'Run' to execute")
    print()
    print("OPTION 2: Install psycopg2 for direct database access")
    print("-" * 80)
    print("1. pip install psycopg2-binary")
    print("2. Add DATABASE_URL to your .env file")
    print("3. Run this script again")
    print()
    print("="*80)

if __name__ == "__main__":
    migration_sql = """
-- Add team_id to match_stats
ALTER TABLE match_stats
ADD COLUMN IF NOT EXISTS team_id INTEGER;

-- Add team_id to match_analytics_summary
ALTER TABLE match_analytics_summary
ADD COLUMN IF NOT EXISTS team_id INTEGER;

-- Add indexes for team filtering
CREATE INDEX IF NOT EXISTS idx_match_stats_team ON match_stats(team_id);
CREATE INDEX IF NOT EXISTS idx_analytics_team ON match_analytics_summary(team_id);

-- Add comments
COMMENT ON COLUMN match_stats.team_id IS 'Team ID from Riot API (100 = Blue Side, 200 = Red Side)';
COMMENT ON COLUMN match_analytics_summary.team_id IS 'Team ID from Riot API (100 = Blue Side, 200 = Red Side)';
"""
    execute_sql(migration_sql)
