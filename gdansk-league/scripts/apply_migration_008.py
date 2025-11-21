"""
Apply Migration 008: Add Shadow Player System

This migration adds the shadow player system for matching users with higher-ranked
players they can learn from.

Usage: python apply_migration_008.py
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

def read_migration_file():
    """Read the migration SQL file"""
    migration_path = os.path.join(
        os.path.dirname(__file__),
        '..',
        'migrations',
        '008_add_shadow_system.sql'
    )

    with open(migration_path, 'r') as f:
        return f.read()

def apply_migration():
    """Apply the migration using Supabase SQL editor or direct PostgreSQL connection"""
    migration_sql = read_migration_file()

    print("=" * 80)
    print("MIGRATION 008: Shadow Player System")
    print("=" * 80)
    print()
    print("This migration will:")
    print("1. Add main_role, is_shadow_eligible, shadow_tier to players table")
    print("2. Create shadow_recommendations table")
    print("3. Add necessary indexes")
    print()

    # Note: Supabase Python client doesn't support raw SQL execution
    # You need to apply this migration through Supabase Dashboard SQL Editor
    print("⚠️  MANUAL STEP REQUIRED:")
    print("   1. Copy the SQL from migrations/008_add_shadow_system.sql")
    print("   2. Go to Supabase Dashboard → SQL Editor")
    print("   3. Paste and run the SQL")
    print()
    print("Or run directly with psql:")
    print(f"   psql {SUPABASE_URL} -f migrations/008_add_shadow_system.sql")
    print()
    print("=" * 80)

    # Display the SQL for easy copying
    print("\nMIGRATION SQL:")
    print("-" * 80)
    print(migration_sql)
    print("-" * 80)

if __name__ == "__main__":
    apply_migration()
