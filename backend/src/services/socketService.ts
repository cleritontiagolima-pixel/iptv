import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { ClientModel } from '../models/Client';
import { ActivityLogModel } from '../models/ActivityLog';

export class SocketService {
  private io: SocketIOServer;
  private connectedClients: Map<string, string> = new Map(); // mac_address -> socket_id

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log('Cliente conectado:', socket.id);

      // App IPTV se conecta com MAC address
      socket.on('app-connect', async (data: { mac_address: string; device_id: string }) => {
        try {
          const { mac_address, device_id } = data;
          
          // Verificar se o cliente existe e está ativo
          const client = await ClientModel.findByMacAddress(mac_address);
          
          if (!client) {
            socket.emit('error', { message: 'Cliente não encontrado' });
            return;
          }

          if (client.status !== 'active') {
            socket.emit('error', { message: 'Cliente não está ativo' });
            return;
          }

          if (client.device_blocked) {
            socket.emit('error', { message: 'Dispositivo bloqueado' });
            return;
          }

          // Verificar expiração
          if (new Date(client.expiration_date) < new Date()) {
            await ClientModel.updateStatus(client.id, 'expired');
            socket.emit('error', { message: 'Assinatura expirada' });
            return;
          }

          // Registrar conexão
          this.connectedClients.set(mac_address, socket.id);
          socket.data.mac_address = mac_address;
          socket.data.client_id = client.id;

          // Enviar dados do cliente para o app
          socket.emit('client-data', {
            id: client.id,
            mac_address: client.mac_address,
            app_assigned: client.app_assigned,
            m3u_url: client.m3u_url,
            xtream_username: client.xtream_username,
            xtream_password: client.xtream_password,
            xtream_server_url: client.xtream_server_url,
            expiration_date: client.expiration_date
          });

          // Log da atividade
          await ActivityLogModel.create({
            client_id: client.id,
            action: 'APP_CONNECTED',
            details: `App conectado: ${device_id}`,
            ip_address: socket.handshake.address
          });

          console.log(`App conectado: ${mac_address}`);
        } catch (error) {
          console.error('Erro ao conectar app:', error);
          socket.emit('error', { message: 'Erro ao conectar' });
        }
      });

      // Painel web se conecta
      socket.on('panel-connect', (data: { user_id: number }) => {
        socket.data.user_id = data.user_id;
        socket.data.type = 'panel';
        console.log(`Painel conectado: usuário ${data.user_id}`);
      });

      // Desconexão
      socket.on('disconnect', async () => {
        if (socket.data.mac_address) {
          this.connectedClients.delete(socket.data.mac_address);
          
          if (socket.data.client_id) {
            await ActivityLogModel.create({
              client_id: socket.data.client_id,
              action: 'APP_DISCONNECTED',
              details: 'App desconectado'
            });
          }
          
          console.log(`App desconectado: ${socket.data.mac_address}`);
        }
      });

      // Solicitação de dados do cliente pelo painel
      socket.on('request-client-data', async (data: { client_id: number }) => {
        try {
          const client = await ClientModel.findById(data.client_id);
          if (client) {
            socket.emit('client-data-response', client);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do cliente:', error);
        }
      });
    });
  }

  // Método para enviar atualização para o app IPTV
  public notifyClientUpdate(macAddress: string, updateType: string, data: any): void {
    const socketId = this.connectedClients.get(macAddress);
    if (socketId) {
      this.io.to(socketId).emit('client-update', {
        type: updateType,
        data
      });
    }
  }

  // Método para enviar notificação para o painel
  public notifyPanel(userId: number, eventType: string, data: any): void {
    this.io.emit('panel-notification', {
      userId,
      eventType,
      data
    });
  }

  // Método para enviar notificação para todos os painéis conectados
  public notifyAllPanels(eventType: string, data: any): void {
    this.io.emit('panel-notification', {
      eventType,
      data
    });
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Instância global do serviço
let socketServiceInstance: SocketService | null = null;

export const initSocketService = (httpServer: HTTPServer): SocketService => {
  if (!socketServiceInstance) {
    socketServiceInstance = new SocketService(httpServer);
  }
  return socketServiceInstance;
};

export const getSocketService = (): SocketService | null => {
  return socketServiceInstance;
};
