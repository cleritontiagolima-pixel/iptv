import * as Application from 'expo-application';
import * as Device from 'expo-device';

export interface DeviceInfo {
  deviceId: string;
  macAddress: string;
  platform: string;
  model: string;
  osVersion: string;
}

export async function getDeviceInfo(): Promise<DeviceInfo> {
  const deviceId = Application.getAndroidId() || Application.getIosIdForVendor() || 'unknown';
  
  // Gerar MAC address simulado (não é possível obter o MAC real em dispositivos móveis modernos)
  const macAddress = generateMacAddress(deviceId);
  
  return {
    deviceId,
    macAddress,
    platform: Device.platform,
    model: Device.modelName || 'unknown',
    osVersion: Device.osVersion || 'unknown'
  };
}

function generateMacAddress(seed: string): string {
  // Gerar um MAC address determinístico baseado no device ID
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  const parts = [];
  for (let i = 0; i < 6; i++) {
    const value = Math.abs(hash >> (i * 4)) & 0xFF;
    parts.push(value.toString(16).padStart(2, '0').toUpperCase());
  }

  return parts.join(':');
}

export function isAndroidTV(): boolean {
  return Device.platform === 'android' && Device.deviceType === Device.DeviceType.TV;
}
