import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

export async function initializeSupabase(): Promise<void> {
  try {
    // Testar conexão
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('Erro ao conectar ao Supabase:', error);
      throw error;
    }
    
    console.log('Conexão Supabase estabelecida com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar Supabase:', error);
    throw error;
  }
}

export async function executeQuery<T = any>(
  table: string,
  action: 'select' | 'insert' | 'update' | 'delete',
  options: {
    columns?: string;
    filter?: Record<string, any>;
    data?: Record<string, any>;
    returning?: string;
  } = {}
): Promise<T> {
  try {
    let query = supabase.from(table);

    switch (action) {
      case 'select':
        if (options.columns) {
          query = query.select(options.columns);
        } else {
          query = query.select('*');
        }
        if (options.filter) {
          Object.entries(options.filter).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        const { data: selectData, error: selectError } = await query;
        if (selectError) throw selectError;
        return selectData as T;

      case 'insert':
        const { data: insertData, error: insertError } = await query.insert(options.data || {}).select(options.returning || '*');
        if (insertError) throw insertError;
        return insertData as T;

      case 'update':
        if (!options.filter) throw new Error('Filter é obrigatório para update');
        let updateQuery = supabase.from(table);
        Object.entries(options.filter).forEach(([key, value]) => {
          updateQuery = updateQuery.eq(key, value);
        });
        const { data: updateData, error: updateError } = await updateQuery.update(options.data || {}).select(options.returning || '*');
        if (updateError) throw updateError;
        return updateData as T;

      case 'delete':
        if (!options.filter) throw new Error('Filter é obrigatório para delete');
        let deleteQuery = supabase.from(table);
        Object.entries(options.filter).forEach(([key, value]) => {
          deleteQuery = deleteQuery.eq(key, value);
        });
        const { error: deleteError } = await deleteQuery.delete();
        if (deleteError) throw deleteError;
        return null as T;

      default:
        throw new Error(`Action inválida: ${action}`);
    }
  } catch (error) {
    console.error('Erro ao executar query:', error);
    throw error;
  }
}
