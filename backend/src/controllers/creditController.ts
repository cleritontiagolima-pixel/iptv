import { Response } from 'express';
import { UserModel } from '../models/User';
import { CreditTransactionModel } from '../models/CreditTransaction';
import { ActivityLogModel } from '../models/ActivityLog';
import { AuthRequest, CreditTransactionDTO } from '../types';

export class CreditController {
  static async getBalance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const balance = await CreditTransactionModel.getUserBalance(userId);

      res.json({ balance });
    } catch (error) {
      console.error('Erro ao buscar saldo:', error);
      res.status(500).json({ error: 'Erro ao buscar saldo' });
    }
  }

  static async getTransactions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { limit } = req.query;
      
      const transactions = await CreditTransactionModel.findByUserId(
        userId,
        limit ? parseInt(limit as string) : 50
      );

      res.json(transactions);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      res.status(500).json({ error: 'Erro ao buscar transações' });
    }
  }

  static async addCredit(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { amount, description }: CreditTransactionDTO = req.body;
      const userId = req.user!.userId;

      if (amount <= 0) {
        res.status(400).json({ error: 'Valor deve ser positivo' });
        return;
      }

      // Apenas admin pode adicionar créditos para outros usuários
      if (req.user!.role !== 'admin' && req.body.user_id) {
        res.status(403).json({ error: 'Permissão negada' });
        return;
      }

      const targetUserId = req.body.user_id || userId;

      // Atualizar saldo
      await UserModel.updateCredits(targetUserId, amount);

      // Registrar transação
      const transaction = await CreditTransactionModel.create({
        type: 'credit',
        amount,
        description: description || 'Crédito adicionado'
      }, targetUserId);

      // Log da atividade
      await ActivityLogModel.create({
        user_id: req.user!.userId,
        action: 'CREDIT_ADDED',
        details: `Crédito adicionado: ${amount} para usuário ${targetUserId}`,
        ip_address: req.ip
      });

      res.status(201).json({
        message: 'Crédito adicionado com sucesso',
        transaction
      });
    } catch (error) {
      console.error('Erro ao adicionar crédito:', error);
      res.status(500).json({ error: 'Erro ao adicionar crédito' });
    }
  }

  static async deductCredit(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { amount, description }: CreditTransactionDTO = req.body;
      const userId = req.user!.userId;

      if (amount <= 0) {
        res.status(400).json({ error: 'Valor deve ser positivo' });
        return;
      }

      // Verificar saldo
      const currentBalance = await CreditTransactionModel.getUserBalance(userId);
      if (currentBalance < amount) {
        res.status(400).json({ error: 'Saldo insuficiente' });
        return;
      }

      // Atualizar saldo
      await UserModel.updateCredits(userId, -amount);

      // Registrar transação
      const transaction = await CreditTransactionModel.create({
        type: 'debit',
        amount,
        description: description || 'Crédito deduzido'
      }, userId);

      // Log da atividade
      await ActivityLogModel.create({
        user_id: userId,
        action: 'CREDIT_DEDUCTED',
        details: `Crédito deduzido: ${amount}`,
        ip_address: req.ip
      });

      res.status(201).json({
        message: 'Crédito deduzido com sucesso',
        transaction
      });
    } catch (error) {
      console.error('Erro ao deduzir crédito:', error);
      res.status(500).json({ error: 'Erro ao deduzir crédito' });
    }
  }

  static async getAllTransactions(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (req.user!.role !== 'admin') {
        res.status(403).json({ error: 'Permissão negada' });
        return;
      }

      const { limit } = req.query;
      const transactions = await CreditTransactionModel.getAll(
        limit ? parseInt(limit as string) : 100
      );

      res.json(transactions);
    } catch (error) {
      console.error('Erro ao buscar todas transações:', error);
      res.status(500).json({ error: 'Erro ao buscar transações' });
    }
  }
}
