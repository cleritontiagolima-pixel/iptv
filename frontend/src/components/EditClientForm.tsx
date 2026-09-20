'use client';

import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { Client, UpdateClientDTO } from '../types';
import { Input } from './Input';
import { Button } from './Button';

interface EditClientFormProps {
  client: Client;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditClientForm({ client, onSuccess, onCancel }: EditClientFormProps) {
  const [formData, setFormData] = useState<UpdateClientDTO>({
    mac_address: client.mac_address,
    app_assigned: client.app_assigned,
    m3u_url: client.m3u_url || '',
    xtream_username: client.xtream_username || '',
    xtream_password: client.xtream_password || '',
    xtream_server_url: client.xtream_server_url || '',
    expiration_date: client.expiration_date.split('T')[0],
    subscription_price: client.subscription_price,
    notes: client.notes || '',
    status: client.status,
    device_blocked: client.device_blocked
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UpdateClientDTO, string>>>({});
  const [loading, setLoading] = useState(false);
  const [connectionType, setConnectionType] = useState<'m3u' | 'xtream'>(
    client.m3u_url ? 'm3u' : 'xtream'
  );

  useEffect(() => {
    setConnectionType(client.m3u_url ? 'm3u' : 'xtream');
  }, [client.m3u_url]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateClientDTO, string>> = {};

    if (!formData.mac_address) {
      newErrors.mac_address = 'Endereço MAC é obrigatório';
    } else if (!/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(formData.mac_address)) {
      newErrors.mac_address = 'Endereço MAC inválido (formato: XX:XX:XX:XX:XX:XX)';
    }

    if (!formData.expiration_date) {
      newErrors.expiration_date = 'Data de expiração é obrigatória';
    }

    if (formData.subscription_price && formData.subscription_price <= 0) {
      newErrors.subscription_price = 'Preço deve ser maior que zero';
    }

    if (connectionType === 'm3u' && !formData.m3u_url) {
      newErrors.m3u_url = 'URL M3U é obrigatória';
    }

    if (connectionType === 'xtream') {
      if (!formData.xtream_username) {
        newErrors.xtream_username = 'Usuário Xtream é obrigatório';
      }
      if (!formData.xtream_password) {
        newErrors.xtream_password = 'Senha Xtream é obrigatória';
      }
      if (!formData.xtream_server_url) {
        newErrors.xtream_server_url = 'URL do servidor Xtream é obrigatória';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const dataToSubmit = { ...formData };
      
      if (connectionType === 'm3u') {
        delete dataToSubmit.xtream_username;
        delete dataToSubmit.xtream_password;
        delete dataToSubmit.xtream_server_url;
      } else {
        delete dataToSubmit.m3u_url;
      }

      await api.put(`/clients/${client.id}`, dataToSubmit);
      onSuccess();
    } catch (error: any) {
      if (error.response?.data?.error) {
        setErrors({ mac_address: error.response.data.error });
      } else {
        console.error('Erro ao atualizar cliente:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof UpdateClientDTO, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Endereço MAC"
        value={formData.mac_address}
        onChange={(e) => handleChange('mac_address', e.target.value)}
        placeholder="XX:XX:XX:XX:XX:XX"
        error={errors.mac_address}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tipo de Conexão
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="m3u"
              checked={connectionType === 'm3u'}
              onChange={(e) => setConnectionType(e.target.value as 'm3u' | 'xtream')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-white">M3U</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="xtream"
              checked={connectionType === 'xtream'}
              onChange={(e) => setConnectionType(e.target.value as 'm3u' | 'xtream')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-white">Xtream Codes</span>
          </label>
        </div>
      </div>

      {connectionType === 'm3u' ? (
        <Input
          label="URL M3U"
          value={formData.m3u_url}
          onChange={(e) => handleChange('m3u_url', e.target.value)}
          placeholder="http://exemplo.com/playlist.m3u"
          error={errors.m3u_url}
          required
        />
      ) : (
        <>
          <Input
            label="Usuário Xtream"
            value={formData.xtream_username}
            onChange={(e) => handleChange('xtream_username', e.target.value)}
            placeholder="usuario"
            error={errors.xtream_username}
            required
          />
          <Input
            label="Senha Xtream"
            type="password"
            value={formData.xtream_password}
            onChange={(e) => handleChange('xtream_password', e.target.value)}
            placeholder="senha"
            error={errors.xtream_password}
            required
          />
          <Input
            label="URL do Servidor Xtream"
            value={formData.xtream_server_url}
            onChange={(e) => handleChange('xtream_server_url', e.target.value)}
            placeholder="http://exemplo.com:8080"
            error={errors.xtream_server_url}
            required
          />
        </>
      )}

      <Input
        label="Aplicativo Atribuído"
        value={formData.app_assigned}
        onChange={(e) => handleChange('app_assigned', e.target.value)}
        placeholder="IBO REVENDA"
      />

      <Input
        label="Data de Expiração"
        type="date"
        value={formData.expiration_date}
        onChange={(e) => handleChange('expiration_date', e.target.value)}
        error={errors.expiration_date}
        required
      />

      <Input
        label="Preço da Assinatura (R$)"
        type="number"
        step="0.01"
        value={formData.subscription_price}
        onChange={(e) => handleChange('subscription_price', parseFloat(e.target.value) || 0)}
        error={errors.subscription_price}
      />

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value as 'active' | 'suspended' | 'expired')}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="active">Ativo</option>
          <option value="suspended">Suspenso</option>
          <option value="expired">Expirado</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="device_blocked"
          checked={formData.device_blocked}
          onChange={(e) => handleChange('device_blocked', e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <label htmlFor="device_blocked" className="text-sm text-gray-300">
          Bloquear dispositivo
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Observações
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Observações adicionais..."
          rows={3}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={loading}
        >
          {loading ? 'Atualizando...' : 'Atualizar Cliente'}
        </Button>
      </div>
    </form>
  );
}
