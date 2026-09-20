import { Response } from 'express';
import { ClientModel } from '../models/Client';
import { ActivityLogModel } from '../models/ActivityLog';
import { AuthRequest } from '../middleware/auth';
import { CreateClientDTO, UpdateClientDTO } from '../types';

export class ClientController {
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const clientData: CreateClientDTO = req.body;
      const userId = req.user!.userId;

      // Verificar se MAC address já existe
      const existingClient = await ClientModel.findByMacAddress(clientData.mac_address);
      if (existingClient) {
        res.status(400).json({ error: 'Endereço MAC já cadastrado' });
        return;
      }

      // Verificar se o usuário tem créditos suficientes
      const user = await (await import('../models/User')).UserModel.findById(userId);
      if (!user || user.credits < clientData.subscription_price) {
        res.status(400).json({ error: 'Créditos insuficientes' });
        return;
      }

      // Criar cliente
      const client = await ClientModel.create(clientData, userId);

      // Deduzir créditos
      await (await import('../models/User')).UserModel.updateCredits(userId, -clientData.subscription_price);

      // Registrar transação
      await (await import('../models/CreditTransaction')).CreditTransactionModel.create({
        type: 'debit',
        amount: clientData.subscription_price,
        description: `Criação de cliente: ${clientData.mac_address}`
      }, userId);

      // Log da atividade
      await ActivityLogModel.create({
        user_id: userId,
        client_id: client.id,
        action: 'CLIENT_CREATED',
        details: `Cliente criado: ${clientData.mac_address}`,
        ip_address: req.ip
      });

      res.status(201).json({
        message: 'Cliente criado com sucesso',
        client
      });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      res.status(500).json({ error: 'Erro ao criar cliente' });
    }
  }

  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, search } = req.query;
      const userId = req.user!.role === 'admin' ? undefined : req.user!.userId;

      const clients = await ClientModel.getAll({
        status: status as string,
        userId,
        search: search as string
      });

      res.json(clients);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
  }

  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const client = await ClientModel.findById(parseInt(id));

      if (!client) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      // Verificar permissão
      if (req.user!.role !== 'admin' && client.user_id !== req.user!.userId) {
        res.status(403).json({ error: 'Permissão negada' });
        return;
      }

      res.json(client);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
  }

  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const clientData: UpdateClientDTO = req.body;

      const client = await ClientModel.findById(parseInt(id));
      if (!client) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      // Verificar permissão
      if (req.user!.role !== 'admin' && client.user_id !== req.user!.userId) {
        res.status(403).json({ error: 'Permissão negada' });
        return;
      }

      const updatedClient = await ClientModel.update(parseInt(id), clientData);

      // Log da atividade
      await ActivityLogModel.create({
        user_id: req.user!.userId,
        client_id: client.id,
        action: 'CLIENT_UPDATED',
        details: `Cliente atualizado: ${client.mac_address}`,
        ip_address: req.ip
      });

      res.json({
        message: 'Cliente atualizado com sucesso',
        client: updatedClient
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
  }

  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const client = await ClientModel.findById(parseInt(id));
      if (!client) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      // Verificar permissão
      if (req.user!.role !== 'admin' && client.user_id !== req.user!.userId) {
        res.status(403).json({ error: 'Permissão negada' });
        return;
      }

      await ClientModel.delete(parseInt(id));

      // Log da atividade
      await ActivityLogModel.create({
        user_id: req.user!.userId,
        client_id: client.id,
        action: 'CLIENT_DELETED',
        details: `Cliente deletado: ${client.mac_address}`,
        ip_address: req.ip
      });

      res.json({ message: 'Cliente deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
  }

  static async suspend(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const client = await ClientModel.findById(parseInt(id));
      if (!client) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      // Verificar permissão
      if (req.user!.role !== 'admin' && client.user_id !== req.user!.userId) {
        res.status(403).json({ error: 'Permissão negada' });
        return;
      }

      const updatedClient = await ClientModel.updateStatus(parseInt(id), 'suspended');

      // Log da atividade
      await ActivityLogModel.create({
        user_id: req.user!.userId,
        client_id: client.id,
        action: 'CLIENT_SUSPENDED',
        details: `Cliente suspenso: ${client.mac_address}`,
        ip_address: req.ip
      });

      res.json({
        message: 'Cliente suspenso com sucesso',
        client: updatedClient
      });
    } catch (error) {
      console.error('Erro ao suspender cliente:', error);
      res.status(500).json({ error: 'Erro ao suspender cliente' });
    }
  }

  static async activate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const client = await ClientModel.findById(parseInt(id));
      if (!client) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      // Verificar permissão
      if (req.user!.role !== 'admin' && client.user_id !== req.user!.userId) {
        res.status(403).json({ error: 'Permissão negada' });
        return;
      }

      const updatedClient = await ClientModel.updateStatus(parseInt(id), 'active');

      // Log da atividade
      await ActivityLogModel.create({
        user_id: req.user!.userId,
        client_id: client.id,
        action: 'CLIENT_ACTIVATED',
        details: `Cliente ativado: ${client.mac_address}`,
        ip_address: req.ip
      });

      res.json({
        message: 'Cliente ativado com sucesso',
        client: updatedClient
      });
    } catch (error) {
      console.error('Erro ao ativar cliente:', error);
      res.status(500).json({ error: 'Erro ao ativar cliente' });
    }
  }

  static async blockDevice(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { blocked } = req.body;

      const client = await ClientModel.findById(parseInt(id));
      if (!client) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      // Verificar permissão
      if (req.user!.role !== 'admin' && client.user_id !== req.user!.userId) {
        res.status(403).json({ error: 'Permissão negada' });
        return;
      }

      const updatedClient = await ClientModel.blockDevice(parseInt(id), blocked);

      // Log da atividade
      await ActivityLogModel.create({
        user_id: req.user!.userId,
        client_id: client.id,
        action: blocked ? 'DEVICE_BLOCKED' : 'DEVICE_UNBLOCKED',
        details: `Dispositivo ${blocked ? 'bloqueado' : 'desbloqueado'}: ${client.mac_address}`,
        ip_address: req.ip
      });

      res.json({
        message: `Dispositivo ${blocked ? 'bloqueado' : 'desbloqueado'} com sucesso`,
        client: updatedClient
      });
    } catch (error) {
      console.error('Erro ao bloquear dispositivo:', error);
      res.status(500).json({ error: 'Erro ao bloquear dispositivo' });
    }
  }

  static async updateMacAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { new_mac_address } = req.body;

      const client = await ClientModel.findById(parseInt(id));
      if (!client) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }

      // Verificar permissão
      if (req.user!.role !== 'admin' && client.user_id !== req.user!.userId) {
        res.status(403).json({ error: 'Permissão negada' });
        return;
      }

      // Verificar se novo MAC já existe
      const existingClient = await ClientModel.findByMacAddress(new_mac_address);
      if (existingClient && existingClient.id !== parseInt(id)) {
        res.status(400).json({ error: 'Endereço MAC já em uso' });
        return;
      }

      const updatedClient = await ClientModel.updateMacAddress(parseInt(id), new_mac_address);

      // Log da atividade
      await ActivityLogModel.create({
        user_id: req.user!.userId,
        client_id: client.id,
        action: 'MAC_ADDRESS_UPDATED',
        details: `MAC atualizado de ${client.mac_address} para ${new_mac_address}`,
        ip_address: req.ip
      });

      res.json({
        message: 'Endereço MAC atualizado com sucesso',
        client: updatedClient
      });
    } catch (error) {
      console.error('Erro ao atualizar MAC:', error);
      res.status(500).json({ error: 'Erro ao atualizar endereço MAC' });
    }
  }

  static async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.role === 'admin' ? undefined : req.user!.userId;
      const stats = await ClientModel.getStats(userId);

      res.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }
}
