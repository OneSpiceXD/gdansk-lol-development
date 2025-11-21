"""
Check the queue_id for the specific match
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

def check_match():
    """Check queue_id for EUW1_7590011035"""

    match_id = 'EUW1_7590011035'

    # Check match_analytics_summary
    analytics = supabase.table('match_analytics_summary') \
        .select('match_id, queue_id, created_at') \
        .eq('match_id', match_id) \
        .execute()

    print("="*80)
    print(f"MATCH: {match_id}")
    print("="*80)

    if analytics.data and len(analytics.data) > 0:
        for record in analytics.data:
            queue_id = record.get('queue_id')
            queue_name = {
                420: "Ranked Solo/Duo",
                440: "Ranked Flex",
                450: "ARAM",
                400: "Normal Draft",
                430: "Normal Blind"
            }.get(queue_id, f"Unknown ({queue_id})")

            print(f"\nQueue ID: {queue_id}")
            print(f"Queue Type: {queue_name}")
            print(f"Created: {record.get('created_at')}")
    else:
        print("\nNo match found in match_analytics_summary")

    # Check all matches with queue_id info
    print("\n" + "="*80)
    print("ALL MATCHES IN DATABASE (showing queue_id)")
    print("="*80)

    all_analytics = supabase.table('match_analytics_summary') \
        .select('match_id, queue_id') \
        .order('created_at', desc=True) \
        .limit(30) \
        .execute()

    queue_counts = {}

    if all_analytics.data:
        print(f"\nFound {len(all_analytics.data)} recent matches:")
        for record in all_analytics.data:
            queue_id = record.get('queue_id')
            queue_counts[queue_id] = queue_counts.get(queue_id, 0) + 1

        print("\nQueue distribution:")
        for queue_id, count in sorted(queue_counts.items()):
            queue_name = {
                420: "Ranked Solo/Duo",
                440: "Ranked Flex",
                450: "ARAM",
                400: "Normal Draft",
                430: "Normal Blind"
            }.get(queue_id, f"Unknown")
            print(f"  {queue_id} ({queue_name}): {count} matches")

if __name__ == "__main__":
    check_match()
