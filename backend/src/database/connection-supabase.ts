import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getDbClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórios');
    }

    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabase;
}

export async function initSupabase(): Promise<void> {
  try {
    const client = getDbClient();
    // Testar conexão
    const { data, error } = await client.from('users').select('count').limit(1);
    
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

// Função simplificada para queries SQL diretas usando o REST API
export async function query(sql: string, params: any[] = []): Promise<any> {
  try {
    const client = getDbClient();
    
    // Converter queries SQL para chamadas do Supabase Client
    // Isso é uma implementação simplificada - para complexidade maior, usar SQL direto via exec
    
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      // Extrair nome da tabela e condições
      const tableMatch = sql.match(/FROM\s+(\w+)/i);
      if (!tableMatch) throw new Error('Não foi possível extrair tabela do SELECT');
      const table = tableMatch[1];
      
      let query = client.from(table).select('*');
      
      // Adicionar filtros básicos
      const whereMatch = sql.match(/WHERE\s+([^;]+)/i);
      if (whereMatch) {
        const conditions = whereMatch[1].split('AND');
        conditions.forEach((cond, index) => {
          const [field, operator, value] = cond.trim().split(/\s+/);
          if (params[index] !== undefined) {
            if (operator.toLowerCase() === '=') {
              query = query.eq(field, params[index]);
            }
          }
        });
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
    
    if (sql.trim().toUpperCase().startsWith('INSERT')) {
      const tableMatch = sql.match(/INTO\s+(\w+)/i);
      if (!tableMatch) throw new Error('Não foi possível extrair tabela do INSERT');
      const table = tableMatch[1];
      
      const { data, error } = await client.from(table).insert(params[0]).select();
      if (error) throw error;
      return data;
    }
    
    if (sql.trim().toUpperCase().startsWith('UPDATE')) {
      const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
      if (!tableMatch) throw new Error('Não foi possível extrair tabela do UPDATE');
      const table = tableMatch[1];
      
      const whereMatch = sql.match(/WHERE\s+([^;]+)/i);
      if (!whereMatch) throw new Error('WHERE é obrigatório para UPDATE');
      
      // Esta é uma implementação simplificada - melhor usar o Supabase Client diretamente
      throw new Error('Para UPDATE complexos, use o Supabase Client diretamente');
    }
    
    if (sql.trim().toUpperCase().startsWith('DELETE')) {
      const tableMatch = sql.match(/FROM\s+(\w+)/i);
      if (!tableMatch) throw new Error('Não foi possível extrair tabela do DELETE');
      const table = tableMatch[1];
      
      const whereMatch = sql.match(/WHERE\s+([^;]+)/i);
      if (!whereMatch) throw new Error('WHERE é obrigatório para DELETE');
      
      // Esta é uma implementação simplificada - melhor usar o Supabase Client diretamente
      throw new Error('Para DELETE complexos, use o Supabase Client diretamente');
    }
    
    throw new Error('Tipo de query não suportado nesta implementação simplificada');
  } catch (error) {
    console.error('Erro ao executar query Supabase:', error);
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
