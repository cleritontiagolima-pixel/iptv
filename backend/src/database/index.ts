// Carregar variáveis de ambiente primeiro
require('dotenv').config();

import { query as sqljsQuery, getClient as getSqljsClient } from './connection-sqljs';
import { query as supabaseQuery, getDbClient as getSupabaseClient } from './connection-supabase';

// Forçar Supabase sempre que houver credenciais
const databaseType = 'supabase';

export const query = databaseType === 'supabase' ? supabaseQuery : sqljsQuery;

export function getDbClient() {
  if (databaseType === 'supabase') {
    return getSupabaseClient();
  } else {
    return getSqljsClient();
  }
}

export function getDatabaseType(): string {
  return databaseType;
}