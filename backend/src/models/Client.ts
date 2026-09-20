import { query as sqljsQuery, getDbClient, getDatabaseType } from '../database/index';
import { Client, CreateClientDTO, UpdateClientDTO } from '../types';

export class ClientModel {
  static async create(clientData: CreateClientDTO, userId: number): Promise<Client> {
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      const { data, error } = await client
        .from('clients')
        .insert([{
          user_id: userId,
          mac_address: clientData.mac_address,
          app_assigned: clientData.app_assigned || 'IBO REVENDA',
          m3u_url: clientData.m3u_url || null,
          xtream_username: clientData.xtream_username || null,
          xtream_password: clientData.xtream_password || null,
          xtream_server_url: clientData.xtream_server_url || null,
          expiration_date: clientData.expiration_date,
          subscription_price: clientData.subscription_price,
          notes: clientData.notes || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as Client;
    } else {
      await sqljsQuery(
        `INSERT INTO clients (
          user_id, mac_address, app_assigned, m3u_url, 
          xtream_username, xtream_password, xtream_server_url,
          expiration_date, subscription_price, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          clientData.mac_address,
          clientData.app_assigned || 'IBO REVENDA',
          clientData.m3u_url || null,
          clientData.xtream_username || null,
          clientData.xtream_password || null,
          clientData.xtream_server_url || null,
          clientData.expiration_date,
          clientData.subscription_price,
          clientData.notes || null
        ]
      );

      return this.findByMacAddress(clientData.mac_address) as Client;
    }
  }

  static async findById(id: number): Promise<Client | null> {
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      const { data, error } = await client
        .from('clients')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) return null;
      return data as Client;
    } else {
      const result = await sqljsQuery(
        'SELECT * FROM clients WHERE id = ?',
        [id]
      );

      return (result as any)[0] || null;
    }
  }

  static async findByMacAddress(macAddress: string): Promise<Client | null> {
    if (getDatabaseType() === 'supabase') {
      try {
        const client = getDbClient();
        const { data, error } = await client
          .from('clients')
          .select('*')
          .eq('mac_address', macAddress)
          .maybeSingle();
        
        if (error) {
          console.error('Erro ao buscar cliente por MAC no Supabase:', error);
          return null;
        }
        return data as Client;
      } catch (error) {
        console.error('Erro ao buscar cliente por MAC no Supabase:', error);
        return null;
      }
    } else {
      const result = await sqljsQuery(
        'SELECT * FROM clients WHERE mac_address = ?',
        [macAddress]
      );

      return (result as any)[0] || null;
    }
  }

  static async findByUserId(userId: number, status?: string): Promise<Client[]> {
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      let query = client.from('clients').select('*').eq('user_id', userId);
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Client[];
    } else {
      let queryText = 'SELECT * FROM clients WHERE user_id = ?';
      const params: any[] = [userId];

      if (status) {
        queryText += ' AND status = ?';
        params.push(status);
      }

      queryText += ' ORDER BY created_at DESC';

      const result = await sqljsQuery(queryText, params);
      return result as Client[];
    }
  }

  static async getAll(filters?: {
    status?: string;
    userId?: number;
    search?: string;
  }): Promise<Client[]> {
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      let query = client.from('clients').select('*');
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters?.search) {
        query = query.or(`mac_address.ilike.%${filters.search}%,app_assigned.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Client[];
    } else {
      let queryText = 'SELECT * FROM clients WHERE 1=1';
      const params: any[] = [];

      if (filters?.status) {
        queryText += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters?.userId) {
        queryText += ' AND user_id = ?';
        params.push(filters.userId);
      }

      if (filters?.search) {
        queryText += ' AND (mac_address LIKE ? OR app_assigned LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      queryText += ' ORDER BY created_at DESC';

      const result = await sqljsQuery(queryText, params);
      return result as Client[];
    }
  }

  static async update(id: number, clientData: UpdateClientDTO): Promise<Client> {
    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(clientData).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        params.push(value);
      }
    });

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const queryText = `UPDATE clients SET ${updates.join(', ')} WHERE id = ?`;

    await sqljsQuery(queryText, params);
    return this.findById(id) as Client;
  }

  static async delete(id: number): Promise<void> {
    await sqljsQuery('DELETE FROM clients WHERE id = ?', [id]);
  }

  static async updateStatus(id: number, status: 'active' | 'suspended' | 'expired'): Promise<Client> {
    await sqljsQuery(
      `UPDATE clients 
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [status, id]
    );

    return this.findById(id) as Client;
  }

  static async blockDevice(id: number, blocked: boolean): Promise<Client> {
    await sqljsQuery(
      `UPDATE clients 
       SET device_blocked = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [blocked ? 1 : 0, id]
    );

    return this.findById(id) as Client;
  }

  static async updateMacAddress(id: number, newMacAddress: string): Promise<Client> {
    await sqljsQuery(
      `UPDATE clients 
       SET mac_address = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [newMacAddress, id]
    );

    return this.findById(id) as Client;
  }

  static async checkExpiration(): Promise<Client[]> {
    if (getDatabaseType() === 'supabase') {
      try {
        const client = getDbClient();
        const { error } = await client
          .from('clients')
          .update({ status: 'expired' })
          .lt('expiration_date', new Date().toISOString())
          .eq('status', 'active');
        
        if (error) {
          console.error('Erro ao verificar expiração no Supabase:', error);
        }
      } catch (error) {
        console.error('Erro ao verificar expiração no Supabase:', error);
      }
    } else {
      await sqljsQuery(
        `UPDATE clients 
         SET status = 'expired', updated_at = CURRENT_TIMESTAMP
         WHERE date(expiration_date) < date('now') AND status = 'active'`
      );
    }

    return this.getAll({ status: 'expired' });
  }

  static async getStats(userId?: number): Promise<{
    total: number;
    active: number;
    suspended: number;
    expired: number;
  }> {
    let queryText = 'SELECT status, COUNT(*) as count FROM clients';
    const params: any[] = [];

    if (userId) {
      queryText += ' WHERE user_id = ?';
      params.push(userId);
    }

    queryText += ' GROUP BY status';

    const result = await sqljsQuery(queryText, params);
    
    const stats = {
      total: 0,
      active: 0,
      suspended: 0,
      expired: 0
    };

    (result as any[]).forEach((row: any) => {
      stats.total += parseInt(row.count);
      stats[row.status] = parseInt(row.count);
    });

    return stats;
  }
}
