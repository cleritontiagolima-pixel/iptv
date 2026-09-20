export interface ClientConfig {
  id: number;
  mac_address: string;
  app_assigned: string;
  m3u_url?: string;
  xtream_username?: string;
  xtream_password?: string;
  xtream_server_url?: string;
  expiration_date: string;
}

export interface Channel {
  id: string;
  name: string;
  logo?: string;
  url: string;
  group?: string;
  number?: number;
}

export interface EPGProgram {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export interface AppState {
  deviceInfo: {
    deviceId: string;
    macAddress: string;
    platform: string;
  };
  clientConfig: ClientConfig | null;
  channels: Channel[];
  currentChannel: Channel | null;
  isPlaying: boolean;
  parentalPin: string;
  blockedChannels: string[];
}
