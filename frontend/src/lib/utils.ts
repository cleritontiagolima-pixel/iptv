import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-green-500 bg-green-500/10';
    case 'suspended':
      return 'text-yellow-500 bg-yellow-500/10';
    case 'expired':
      return 'text-red-500 bg-red-500/10';
    default:
      return 'text-gray-500 bg-gray-500/10';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Ativo';
    case 'suspended':
      return 'Suspenso';
    case 'expired':
      return 'Expirado';
    default:
      return status;
  }
}
