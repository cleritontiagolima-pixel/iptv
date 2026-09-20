import { query as sqljsQuery, getDbClient, getDatabaseType } from '../database/index';
import { CreditTransaction, CreditTransactionDTO } from '../types';

export class CreditTransactionModel {
  static async create(transactionData: CreditTransactionDTO, userId: number): Promise<CreditTransaction> {
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      const { data, error } = await client
        .from('credit_transactions')
        .insert([{
          user_id: userId,
          type: transactionData.type,
          amount: transactionData.amount,
          description: transactionData.description || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as CreditTransaction;
    } else {
      await sqljsQuery(
        `INSERT INTO credit_transactions (user_id, type, amount, description)
         VALUES (?, ?, ?, ?)`,
        [
          userId,
          transactionData.type,
          transactionData.amount,
          transactionData.description || null
        ]
      );

      const result = await sqljsQuery(
        `SELECT * FROM credit_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );

      return (result as any)[0];
    }
  }

  static async findByUserId(userId: number, limit: number = 50): Promise<CreditTransaction[]> {
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      const { data, error } = await client
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as CreditTransaction[];
    } else {
      const result = await sqljsQuery(
        `SELECT * FROM credit_transactions 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userId, limit]
      );

      return result as CreditTransaction[];
    }
  }

  static async getAll(limit: number = 100): Promise<CreditTransaction[]> {
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      const { data, error } = await client
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as CreditTransaction[];
    } else {
      const result = await sqljsQuery(
        `SELECT ct.*, u.name as user_name, u.email as user_email
         FROM credit_transactions ct
         JOIN users u ON ct.user_id = u.id
         ORDER BY ct.created_at DESC
         LIMIT ?`,
        [limit]
      );

      return result as CreditTransaction[];
    }
  }

  static async getUserBalance(userId: number): Promise<number> {
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      const { data, error } = await client
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data?.credits || 0;
    } else {
      const result = await sqljsQuery(
        `SELECT credits FROM users WHERE id = ?`,
        [userId]
      );

      return (result as any)[0]?.credits || 0;
    }
  }
}
