import { query, getDbClient, getDatabaseType } from '../database/index';
import { User, CreateUserDTO, LoginDTO } from '../types';
import bcrypt from 'bcryptjs';

export class UserModel {
  static async create(userData: CreateUserDTO): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      const { data, error } = await client
        .from('users')
        .insert([{
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role || 'reseller',
          credits: userData.credits || 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as User;
    } else {
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
  }

  static async findByEmail(email: string): Promise<User | null> {
    if (getDatabaseType() === 'supabase') {
      try {
        const client = getDbClient();
        const { data, error } = await client
          .from('users')
          .select('*')
          .eq('email', email)
          .single();
        
        if (error) return null;
        return data as User;
      } catch (error) {
        console.error('Erro ao buscar usuário por email no Supabase:', error);
        return null;
      }
    } else {
      const result = await query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      return (result as any)[0] || null;
    }
  }

  static async findById(id: number): Promise<User | null> {
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) return null;
      return data as User;
    } else {
      const result = await query(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      return (result as any)[0] || null;
    }
  }

  static async updateCredits(userId: number, amount: number): Promise<User> {
    if (getDatabaseType() === 'supabase') {
      const user = await this.findById(userId);
      if (!user) throw new Error('User not found');
      const client = getDbClient();
      
      const { data, error } = await client
        .from('users')
        .update({ credits: user.credits + amount })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data as User;
    } else {
      await query(
        `UPDATE users 
         SET credits = credits + ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [amount, userId]
      );

      return this.findById(userId) as User;
    }
  }

  static async setCredits(userId: number, amount: number): Promise<User> {
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      const { data, error } = await client
        .from('users')
        .update({ credits: amount })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data as User;
    } else {
      await query(
        `UPDATE users 
         SET credits = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [amount, userId]
      );

      return this.findById(userId) as User;
    }
  }

  static async getAll(role?: string): Promise<User[]> {
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      let query = client.from('users').select('*');
      
      if (role) {
        query = query.eq('role', role);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as User[];
    } else {
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
  }

  static async delete(id: number): Promise<void> {
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      const { error } = await client.from('users').delete().eq('id', id);
      if (error) throw error;
    } else {
      await query('DELETE FROM users WHERE id = ?', [id]);
    }
  }

  static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
