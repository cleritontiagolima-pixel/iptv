'use client';

import React, { useState } from 'react';
import { Client } from '../types';
import { formatDate, formatCurrency, getStatusColor, getStatusLabel } from '../lib/utils';
import { Button } from './Button';
import { Modal } from './Modal';
import { Edit, Trash2, Lock, Unlock, Power, PowerOff } from 'lucide-react';
import api from '../lib/api';
import EditClientForm from './EditClientForm';

interface ClientTableProps {
  clients: Client[];
  onClientUpdated: () => void;
  isAdmin: boolean;
}

export default function ClientTable({ clients, onClientUpdated, isAdmin }: ClientTableProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSuspend = async (client: Client) => {
    try {
      setLoading(true);
      await api.post(`/clients/${client.id}/suspend`);
      onClientUpdated();
    } catch (error) {
      console.error('Erro ao suspender cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (client: Client) => {
    try {
      setLoading(true);
      await api.post(`/clients/${client.id}/activate`);
      onClientUpdated();
    } catch (error) {
      console.error('Erro ao ativar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockDevice = async (client: Client) => {
    try {
      setLoading(true);
      await api.post(`/clients/${client.id}/block-device`, { blocked: !client.device_blocked });
      onClientUpdated();
    } catch (error) {
      console.error('Erro ao bloquear dispositivo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClient) return;

    try {
      setLoading(true);
      await api.delete(`/clients/${selectedClient.id}`);
      setShowDeleteModal(false);
      setSelectedClient(null);
      onClientUpdated();
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const isExpired = new Date(selectedClient?.expiration_date || '') < new Date();

  return (
    <>
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  MAC Address
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Aplicativo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Expiração
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Dispositivo
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {client.mac_address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {client.app_assigned}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                        {getStatusLabel(client.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {formatDate(client.expiration_date)}
                      </div>
                      {isExpired && (
                        <div className="text-xs text-red-500 mt-1">
                          Expirado
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {formatCurrency(client.subscription_price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {client.device_blocked ? (
                        <span className="flex items-center gap-1 text-red-500 text-sm">
                          <Lock size={16} />
                          Bloqueado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-500 text-sm">
                          <Unlock size={16} />
                          Liberado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(client)}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </Button>
                        
                        {client.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSuspend(client)}
                            title="Suspender"
                            disabled={loading}
                          >
                            <PowerOff size={16} />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleActivate(client)}
                            title="Ativar"
                            disabled={loading}
                          >
                            <Power size={16} />
                          </Button>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBlockDevice(client)}
                          title={client.device_blocked ? 'Desbloquear' : 'Bloquear'}
                          disabled={loading}
                        >
                          {client.device_blocked ? <Unlock size={16} /> : <Lock size={16} />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedClient(client);
                            setShowDeleteModal(true);
                          }}
                          title="Excluir"
                          disabled={loading}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedClient(null);
        }}
        title="Editar Cliente"
        size="lg"
      >
        {selectedClient && (
          <EditClientForm
            client={selectedClient}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedClient(null);
              onClientUpdated();
            }}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedClient(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedClient(null);
        }}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Tem certeza que deseja excluir o cliente <strong>{selectedClient?.mac_address}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedClient(null);
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
