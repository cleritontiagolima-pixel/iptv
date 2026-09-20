import { query } from '../database/connection-sqljs';
import { User, CreateUserDTO, LoginDTO } from '../types';
import bcrypt from 'bcryptjs';

export class UserModel {
  static async create(userData: CreateUserDTO): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const result = await query(
      `INSERT INTO users (name, email, password, role, credits)
       VALUES (?, ?, ?, ?, ?)`,
      [
        userData.name,
        userData.email,
        hashedPassword,
        userData.role || 'reseller',
        userData.credits || 0
      ]
    );

    return this.findById((result as any).rows[0].id) as User;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    return (result as any)[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    return (result as any)[0] || null;
  }

  static async updateCredits(userId: number, amount: number): Promise<User> {
    await query(
      `UPDATE users 
       SET credits = credits + ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [amount, userId]
    );

    return this.findById(userId) as User;
  }

  static async setCredits(userId: number, amount: number): Promise<User> {
    await query(
      `UPDATE users 
       SET credits = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [amount, userId]
    );

    return this.findById(userId) as User;
  }

  static async getAll(role?: string): Promise<User[]> {
    let queryText = 'SELECT * FROM users';
    const params: any[] = [];

    if (role) {
      queryText += ' WHERE role = ?';
      params.push(role);
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, params);
    return result as User[];
  }

  static async delete(id: number): Promise<void> {
    await query('DELETE FROM users WHERE id = ?', [id]);
  }

  static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
