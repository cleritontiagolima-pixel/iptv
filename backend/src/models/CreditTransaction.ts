import { query } from '../database/connection-sqljs';
import { CreditTransaction, CreditTransactionDTO } from '../types';

export class CreditTransactionModel {
  static async create(transactionData: CreditTransactionDTO, userId: number): Promise<CreditTransaction> {
    await query(
      `INSERT INTO credit_transactions (user_id, type, amount, description)
       VALUES (?, ?, ?, ?)`,
      [
        userId,
        transactionData.type,
        transactionData.amount,
        transactionData.description || null
      ]
    );

    const result = await query(
      `SELECT * FROM credit_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    return (result as any)[0];
  }

  static async findByUserId(userId: number, limit: number = 50): Promise<CreditTransaction[]> {
    const result = await query(
      `SELECT * FROM credit_transactions 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [userId, limit]
    );

    return result as CreditTransaction[];
  }

  static async getAll(limit: number = 100): Promise<CreditTransaction[]> {
    const result = await query(
      `SELECT ct.*, u.name as user_name, u.email as user_email
       FROM credit_transactions ct
       JOIN users u ON ct.user_id = u.id
       ORDER BY ct.created_at DESC
       LIMIT ?`,
      [limit]
    );

    return result as CreditTransaction[];
  }

  static async getUserBalance(userId: number): Promise<number> {
    const result = await query(
      `SELECT credits FROM users WHERE id = ?`,
      [userId]
    );

    return (result as any)[0]?.credits || 0;
  }
}
