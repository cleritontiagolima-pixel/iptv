import cron from 'node-cron';
import { ClientModel } from '../models/Client';
import { getSocketService } from './socketService';

export class SchedulerService {
  static start(): void {
    // Verificar expirações a cada hora
    cron.schedule('0 * * * *', async () => {
      console.log('Verificando expirações de clientes...');
      try {
        const expiredClients = await ClientModel.checkExpiration();
        
        if (expiredClients.length > 0) {
          console.log(`${expiredClients.length} clientes expirados`);
          
          const socketService = getSocketService();
          if (socketService) {
            expiredClients.forEach(client => {
              socketService.notifyClientUpdate(
                client.mac_address,
                'EXPIRED',
                { message: 'Sua assinatura expirou' }
              );
            });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar expirações:', error);
      }
    });

    // Verificar expirações a cada minuto (para mais precisão)
    cron.schedule('* * * * *', async () => {
      try {
        const expiredClients = await ClientModel.checkExpiration();
        
        if (expiredClients.length > 0) {
          const socketService = getSocketService();
          if (socketService) {
            expiredClients.forEach(client => {
              socketService.notifyClientUpdate(
                client.mac_address,
                'EXPIRED',
                { message: 'Sua assinatura expirou' }
              );
            });
          }
        }
      } catch (error) {
        console.error('Erro ao verificar expirações:', error);
      }
    });

    console.log('Serviço de agendamento iniciado');
  }
}
