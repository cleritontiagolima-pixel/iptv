import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initSocketService } from './services/socketService';
import { SchedulerService } from './services/schedulerService';
import { initializeDatabase, createDefaultAdmin } from './database/init';
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import creditRoutes from './routes/credits';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const httpServer = createServer(app);

// Inicializar banco de dados
const databaseType = process.env.DATABASE_TYPE || 'sqlite';
console.log(`🗄️  Usando banco de dados: ${databaseType.toUpperCase()}`);

initializeDatabase(databaseType).then(() => {
  createDefaultAdmin();
}).catch(console.error);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/credits', creditRoutes);

// Rota de saúde
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: databaseType
  });
});

// Rota para app IPTV obter configuração (sem autenticação)
app.get('/api/app/config/:mac_address', async (req: Request, res: Response) => {
  try {
    const { mac_address } = req.params;
    const { ClientModel } = await import('./models/Client');
    
    const client = await ClientModel.findByMacAddress(mac_address);
    
    if (!client) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }

    if (client.status !== 'active') {
      res.status(403).json({ error: 'Cliente não está ativo', status: client.status });
      return;
    }

    if (client.device_blocked) {
      res.status(403).json({ error: 'Dispositivo bloqueado' });
      return;
    }

    // Verificar expiração
    if (new Date(client.expiration_date) < new Date()) {
      await ClientModel.updateStatus(client.id, 'expired');
      res.status(403).json({ error: 'Assinatura expirada' });
      return;
    }

    res.json({
      id: client.id,
      mac_address: client.mac_address,
      app_assigned: client.app_assigned,
      m3u_url: client.m3u_url,
      xtream_username: client.xtream_username,
      xtream_password: client.xtream_password,
      xtream_server_url: client.xtream_server_url,
      expiration_date: client.expiration_date
    });
  } catch (error) {
    console.error('Erro ao buscar configuração do app:', error);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
});

// Inicializar Socket.io
initSocketService(httpServer);

// Inicializar scheduler
SchedulerService.start();

// Iniciar servidor
httpServer.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
