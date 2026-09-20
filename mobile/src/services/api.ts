import axios from 'axios';

const API_URL = 'http://localhost:5003/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ClientConfigResponse {
  id: number;
  mac_address: string;
  app_assigned: string;
  m3u_url?: string;
  xtream_username?: string;
  xtream_password?: string;
  xtream_server_url?: string;
  expiration_date: string;
}

export const ApiService = {
  // Obter configuração do cliente por MAC address
  async getClientConfig(macAddress: string): Promise<ClientConfigResponse> {
    try {
      const response = await api.get(`/app/config/${macAddress}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      throw error;
    }
  },

  // Parser de playlist M3U
  async parseM3UPlaylist(m3uUrl: string): Promise<any[]> {
    try {
      const response = await axios.get(m3uUrl, { timeout: 15000 });
      return this.parseM3UContent(response.data);
    } catch (error) {
      console.error('Erro ao buscar playlist M3U:', error);
      throw error;
    }
  },

  // Parser de conteúdo M3U
  parseM3UContent(content: string): any[] {
    const lines = content.split('\n');
    const channels: any[] = [];
    let currentChannel: any = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('#EXTINF:')) {
        currentChannel = this.parseExtInfLine(line);
      } else if (line && !line.startsWith('#') && currentChannel) {
        currentChannel.url = line;
        channels.push(currentChannel);
        currentChannel = null;
      }
    }

    return channels;
  },

  // Parser de linha EXTINF
  parseExtInfLine(line: string): any {
    const channel: any = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Canal',
      logo: '',
      group: 'Geral',
      url: ''
    };

    // Extrair duração
    const durationMatch = line.match(/#EXTINF:(-?\d+)/);
    if (durationMatch) {
      channel.duration = parseInt(durationMatch[1]);
    }

    // Extrair nome
    const nameMatch = line.match(/,(.*)$/);
    if (nameMatch) {
      channel.name = nameMatch[1].trim();
    }

    // Extrair logo
    const logoMatch = line.match(/tvg-logo="([^"]*)"/);
    if (logoMatch) {
      channel.logo = logoMatch[1];
    }

    // Extrair grupo
    const groupMatch = line.match(/group-title="([^"]*)"/);
    if (groupMatch) {
      channel.group = groupMatch[1];
    }

    // Extrair número do canal
    const numberMatch = line.match(/tvg-id="(\d+)"/);
    if (numberMatch) {
      channel.number = parseInt(numberMatch[1]);
    }

    return channel;
  },

  // Obter canais da API Xtream
  async getXtreamChannels(
    serverUrl: string,
    username: string,
    password: string
  ): Promise<any[]> {
    try {
      const response = await axios.get(
        `${serverUrl}/player_api.php?username=${username}&password=${password}`,
        { timeout: 15000 }
      );

      if (response.data && response.data.server_info) {
        // Buscar categorias
        const categoriesResponse = await axios.get(
          `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_categories`
        );

        // Buscar canais
        const channelsResponse = await axios.get(
          `${serverUrl}/player_api.php?username=${username}&password=${password}&action=get_live_streams`
        );

        return this.processXtreamChannels(
          channelsResponse.data,
          categoriesResponse.data
        );
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar canais Xtream:', error);
      throw error;
    }
  },

  // Processar canais Xtream
  processXtreamChannels(channels: any[], categories: any[]): any[] {
    const categoryMap = new Map();
    categories.forEach((cat: any) => {
      categoryMap.set(cat.category_id, cat.category_name);
    });

    return channels.map((channel: any) => ({
      id: channel.stream_id.toString(),
      name: channel.name,
      logo: channel.stream_icon || '',
      url: channel.url,
      group: categoryMap.get(channel.category_id) || 'Geral',
      number: channel.stream_id
    }));
  }
};

export default api;
