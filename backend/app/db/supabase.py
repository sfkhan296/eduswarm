"""
Supabase client singleton.

Usage:
    from app.db.supabase import get_supabase_client
    client = get_supabase_client()
    client.table("sessions").insert({...}).execute()
"""

from functools import lru_cache
from supabase import create_client, Client
from app.core.config import settings


@lru_cache(maxsize=1)
def get_supabase_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_key)
