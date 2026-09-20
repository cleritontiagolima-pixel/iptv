export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'reseller';
  credits: number;
  created_at: Date;
  updated_at: Date;
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
  expiration_date: Date;
  subscription_price: number;
  notes?: string;
  status: 'active' | 'suspended' | 'expired';
  device_blocked: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreditTransaction {
  id: number;
  user_id: number;
  type: 'credit' | 'debit';
  amount: number;
  description?: string;
  created_at: Date;
}

export interface Device {
  id: number;
  client_id: number;
  device_id: string;
  device_name?: string;
  last_active: Date;
  is_active: boolean;
  created_at: Date;
}

export interface ActivityLog {
  id: number;
  user_id?: number;
  client_id?: number;
  action: string;
  details?: string;
  ip_address?: string;
  created_at: Date;
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

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'reseller';
  credits?: number;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreditTransactionDTO {
  type: 'credit' | 'debit';
  amount: number;
  description?: string;
}

export interface AuthPayload {
  userId: number;
  email: string;
  role: string;
}
