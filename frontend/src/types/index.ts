export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'reseller';
  credits: number;
  created_at: string;
}

export interface Client {
  id: number;
  user_id: number;
  mac_address: string;
  app_assigned: string;
  m3u_url?: string;
  xtream_username?: string;
  xtream_password?: string;
  xtream_server_url?: string;
  expiration_date: string;
  subscription_price: number;
  notes?: string;
  status: 'active' | 'suspended' | 'expired';
  device_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: number;
  user_id: number;
  type: 'credit' | 'debit';
  amount: number;
  description?: string;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

export interface ClientStats {
  total: number;
  active: number;
  suspended: number;
  expired: number;
}

export interface CreateClientDTO {
  mac_address: string;
  app_assigned?: string;
  m3u_url?: string;
  xtream_username?: string;
  xtream_password?: string;
  xtream_server_url?: string;
  expiration_date: string;
  subscription_price: number;
  notes?: string;
}

export interface UpdateClientDTO {
  mac_address?: string;
  app_assigned?: string;
  m3u_url?: string;
  xtream_username?: string;
  xtream_password?: string;
  xtream_server_url?: string;
  expiration_date?: string;
  subscription_price?: number;
  notes?: string;
  status?: 'active' | 'suspended' | 'expired';
  device_blocked?: boolean;
}
