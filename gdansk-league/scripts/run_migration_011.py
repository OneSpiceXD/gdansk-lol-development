"""
Run migration 011: Add team_id columns with direct database access
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def run_migration():
    """Execute migration via psycopg2"""
    try:
        import psycopg2
    except ImportError:
        print("[ERROR] psycopg2 not installed. Install with: pip install psycopg2-binary")
        print("\nAlternatively, run the SQL manually in Supabase SQL Editor:")
        print("migrations/011_add_team_side_to_tables.sql")
        return

    DATABASE_URL = os.getenv('DATABASE_URL')
    if not DATABASE_URL:
        print("[ERROR] DATABASE_URL not found in environment variables")
        print("\nAlternatively, run the SQL manually in Supabase SQL Editor:")
        print("migrations/011_add_team_side_to_tables.sql")
        return

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

    print("="*80)
    print("RUNNING MIGRATION 011")
    print("="*80)
    print()

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        print("Executing migration SQL...")
        cursor.execute(migration_sql)
        conn.commit()

        print("[OK] Migration 011 applied successfully!")
        print()
        print("Changes made:")
        print("  - Added team_id column to match_stats")
        print("  - Added team_id column to match_analytics_summary")
        print("  - Created indexes for team filtering")
        print()
        print("="*80)

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"[ERROR] Failed to run migration: {e}")
        raise

if __name__ == "__main__":
    run_migration()
