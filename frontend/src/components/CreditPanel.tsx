'use client';

import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { CreditTransaction } from '../types';
import { formatDate, formatCurrency } from '../lib/utils';
import { Input } from './Input';
import { Button } from './Button';
import { ArrowUp, ArrowDown, History } from 'lucide-react';

interface CreditPanelProps {
  userId: number;
  currentCredits: number;
  isAdmin: boolean;
  onSuccess: () => void;
}

export default function CreditPanel({ userId, currentCredits, isAdmin, onSuccess }: CreditPanelProps) {
  const [balance, setBalance] = useState(currentCredits);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'add' | 'deduct'>('add');

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [userId]);

  const fetchBalance = async () => {
    try {
      const response = await api.get('/credits/balance');
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Erro ao buscar saldo:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/credits/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountValue = parseFloat(amount);
    if (!amountValue || amountValue <= 0) {
      return;
    }

    setLoading(true);

    try {
      if (action === 'add') {
        await api.post('/credits/add', {
          amount: amountValue,
          description: description || 'Crédito adicionado manualmente'
        });
      } else {
        await api.post('/credits/deduct', {
          amount: amountValue,
          description: description || 'Crédito deduzido manualmente'
        });
      }

      setAmount('');
      setDescription('');
      fetchBalance();
      fetchTransactions();
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao processar transação:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Display */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Saldo Atual</p>
            <p className="text-3xl font-bold text-white mt-1">
              {formatCurrency(balance)}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
            <History className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Add/Deduct Credits */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setAction('add')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              action === 'add'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <ArrowUp className="w-5 h-5 mx-auto mb-1" />
            Adicionar
          </button>
          <button
            type="button"
            onClick={() => setAction('deduct')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
              action === 'deduct'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <ArrowDown className="w-5 h-5 mx-auto mb-1" />
            Deduzir
          </button>
        </div>

        <Input
          label="Valor (R$)"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Descrição (opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição da transação..."
            rows={2}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Processando...' : action === 'add' ? 'Adicionar Créditos' : 'Deduzir Créditos'}
        </Button>
      </form>

      {/* Transaction History */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Histórico de Transações</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma transação encontrada</p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <ArrowUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <ArrowDown className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {transaction.description || transaction.type === 'credit' ? 'Crédito' : 'Débito'}
                    </p>
                    <p className="text-gray-500 text-xs">{formatDate(transaction.created_at)}</p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
