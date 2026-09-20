'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, CreditCard, Activity, LogOut, Plus, Search, Filter } from 'lucide-react';
import api from '../lib/api';
import { Client, ClientStats, User } from '../types';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Modal } from '../../components/Modal';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '../lib/utils';
import ClientForm from '../../components/ClientForm';
import ClientTable from '../../components/ClientTable';
import CreditPanel from '../../components/CreditPanel';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<ClientStats>({ total: 0, active: 0, suspended: 0, expired: 0 });
  const [loading, setLoading] = useState(true);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showCreditPanel, setShowCreditPanel] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user, searchTerm, statusFilter]);

  const fetchData = async () => {
    try {
      await Promise.all([fetchClients(), fetchStats()]);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/clients', { params });
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/clients/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleClientCreated = () => {
    setShowClientModal(false);
    fetchData();
  };

  const handleClientUpdated = () => {
    fetchData();
  };

  const handleCreditUpdated = () => {
    fetchData();
    // Atualizar dados do usuário
    const userData = localStorage.getItem('user');
    if (userData) {
      api.get('/auth/profile').then(response => {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">IPTV Management</h1>
            <p className="text-gray-400 text-sm">Bem-vindo, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
              <CreditCard className="w-5 h-5 text-blue-500" />
              <span className="text-white font-semibold">
                {formatCurrency(user?.credits || 0)}
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowCreditPanel(true)}
            >
              Créditos
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Clientes</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ativos</p>
                <p className="text-3xl font-bold text-green-500 mt-1">{stats.active}</p>
              </div>
              <Activity className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Suspensos</p>
                <p className="text-3xl font-bold text-yellow-500 mt-1">{stats.suspended}</p>
              </div>
              <Activity className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Expirados</p>
                <p className="text-3xl font-bold text-red-500 mt-1">{stats.expired}</p>
              </div>
              <Activity className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                placeholder="Buscar por MAC ou aplicativo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="suspended">Suspensos</option>
            <option value="expired">Expirados</option>
          </select>

          <Button onClick={() => setShowClientModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Clients Table */}
        <ClientTable
          clients={clients}
          onClientUpdated={handleClientUpdated}
          isAdmin={user?.role === 'admin'}
        />
      </div>

      {/* Client Modal */}
      <Modal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        title="Novo Cliente"
        size="lg"
      >
        <ClientForm onSuccess={handleClientCreated} onCancel={() => setShowClientModal(false)} />
      </Modal>

      {/* Credit Panel */}
      <Modal
        isOpen={showCreditPanel}
        onClose={() => setShowCreditPanel(false)}
        title="Gerenciamento de Créditos"
        size="lg"
      >
        <CreditPanel
          userId={user?.id || 0}
          currentCredits={user?.credits || 0}
          isAdmin={user?.role === 'admin'}
          onSuccess={handleCreditUpdated}
        />
      </Modal>
    </div>
  );
}
