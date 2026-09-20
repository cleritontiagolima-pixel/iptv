import { query as sqljsQuery, getDbClient, getDatabaseType } from '../database/index';
import { ActivityLog } from '../types';

export class ActivityLogModel {
  static async create(logData: {
    user_id?: number;
    client_id?: number;
    action: string;
    details?: string;
    ip_address?: string;
  }): Promise<ActivityLog> {
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      const { data, error } = await client
        .from('activity_logs')
        .insert([{
          user_id: logData.user_id || null,
          client_id: logData.client_id || null,
          action: logData.action,
          details: logData.details || null,
          ip_address: logData.ip_address || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data as ActivityLog;
    } else {
      await sqljsQuery(
        `INSERT INTO activity_logs (user_id, client_id, action, details, ip_address)
         VALUES (?, ?, ?, ?, ?)`,
        [
          logData.user_id || null,
          logData.client_id || null,
          logData.action,
          logData.details || null,
          logData.ip_address || null
        ]
      );

      const result = await sqljsQuery(
        `SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 1`,
        []
      );

      return (result as any)[0];
    }
  }

  static async findByUserId(userId: number, limit: number = 50): Promise<ActivityLog[]> {
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      const { data, error } = await client
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as ActivityLog[];
    } else {
      const result = await sqljsQuery(
        `SELECT * FROM activity_logs 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [userId, limit]
      );

      return result as ActivityLog[];
    }
  }

  static async findByClientId(clientId: number, limit: number = 50): Promise<ActivityLog[]> {
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      const { data, error } = await client
        .from('activity_logs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as ActivityLog[];
    } else {
      const result = await sqljsQuery(
        `SELECT * FROM activity_logs 
         WHERE client_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [clientId, limit]
      );

      return result as ActivityLog[];
    }
  }

  static async getAll(limit: number = 100): Promise<ActivityLog[]> {
    if (getDatabaseType() === 'supabase') {
      const client = getDbClient();
      const { data, error } = await client
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as ActivityLog[];
    } else {
      const result = await sqljsQuery(
        `SELECT al.*, u.name as user_name, c.mac_address as client_mac
         FROM activity_logs al
         LEFT JOIN users u ON al.user_id = u.id
         LEFT JOIN clients c ON al.client_id = c.id
         ORDER BY al.created_at DESC
         LIMIT ?`,
        [limit]
      );

      return result as ActivityLog[];
    }
  }
}
