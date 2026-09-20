import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { ActivityLogModel } from '../models/ActivityLog';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';
import { LoginDTO, CreateUserDTO } from '../types';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUserDTO = req.body;

      // Verificar se email já existe
      const existingUser = await UserModel.findByEmail(userData.email);
      if (existingUser) {
        res.status(400).json({ error: 'Email já cadastrado' });
        return;
      }

      const user = await UserModel.create(userData);

      // Log da atividade
      await ActivityLogModel.create({
        user_id: user.id,
        action: 'USER_REGISTERED',
        details: `Novo usuário registrado: ${user.email}`,
        ip_address: req.ip
      });

      // Gerar token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          credits: user.credits
        },
        token
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginDTO = req.body;

      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }

      const isValidPassword = await UserModel.validatePassword(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Credenciais inválidas' });
        return;
      }

      // Log da atividade
      await ActivityLogModel.create({
        user_id: user.id,
        action: 'USER_LOGIN',
        details: `Login realizado: ${user.email}`,
        ip_address: req.ip
      });

      // Gerar token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        message: 'Login realizado com sucesso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          credits: user.credits
        },
        token
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await UserModel.findById(req.user!.userId);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
        created_at: user.created_at
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  }
}
