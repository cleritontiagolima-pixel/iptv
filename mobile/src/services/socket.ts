import { io, Socket } from 'socket.io-client';
import { AppState } from '../types';

const SOCKET_URL = 'http://localhost:5001';

export class SocketService {
  private socket: Socket | null = null;
  private macAddress: string = '';
  private deviceId: string = '';

  connect(macAddress: string, deviceId: string): void {
    this.macAddress = macAddress;
    this.deviceId = deviceId;

    if (this.socket?.connected) {
      this.socket.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('Socket conectado');
      this.socket?.emit('app-connect', {
        mac_address: macAddress,
        device_id: deviceId
      });
    });

    this.socket.on('disconnect', () => {
      console.log('Socket desconectado');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('client-data', (data) => {
      console.log('Dados do cliente recebidos:', data);
      // Emitir evento para atualizar estado
      this.emit('client-data-received', data);
    });

    this.socket.on('client-update', (data) => {
      console.log('Atualização do cliente recebida:', data);
      // Emitir evento para atualizar estado
      this.emit('client-update-received', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private emit(event: string, data: any): void {
    // Implementar emissão de eventos locais
    // Pode ser usado com um EventEmitter ou Context API
  }

  on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Instância singleton
let socketServiceInstance: SocketService | null = null;

export const getSocketService = (): SocketService => {
  if (!socketServiceInstance) {
    socketServiceInstance = new SocketService();
  }
  return socketServiceInstance;
};
