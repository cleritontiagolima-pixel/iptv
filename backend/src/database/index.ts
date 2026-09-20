import { query as sqljsQuery, getClient as getSqljsClient } from './connection-sqljs';
import { query as supabaseQuery, dbClient as getSupabaseClient } from './connection-supabase';

const databaseType = process.env.DATABASE_TYPE || 'sqlite';

export const query = databaseType === 'supabase' ? supabaseQuery : sqljsQuery;

export function getDbClient() {
  if (databaseType === 'supabase') {
    return getSupabaseClient;
  } else {
    return getSqljsClient();
  }
}

export function getDatabaseType(): string {
  return databaseType;
}