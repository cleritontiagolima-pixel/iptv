import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { getDeviceInfo } from '../utils/deviceInfo';
import { ApiService } from '../services/api';
import { getSocketService } from '../services/socket';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<any, any>;

interface Props {
  navigation: NavigationProp;
}

export default function ActivationScreen({ navigation }: Props) {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [macAddress, setMacAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    loadDeviceInfo();
  }, []);

  const loadDeviceInfo = async () => {
    try {
      const info = await getDeviceInfo();
      setDeviceInfo(info);
      setMacAddress(info.macAddress);
      
      // Tentar ativação automática
      await autoActivate(info.macAddress, info.deviceId);
    } catch (error) {
      console.error('Erro ao carregar informações do dispositivo:', error);
    }
  };

  const autoActivate = async (mac: string, deviceId: string) => {
    try {
      setLoading(true);
      const config = await ApiService.getClientConfig(mac);
      
      // Conectar ao socket
      const socketService = getSocketService();
      socketService.connect(mac, deviceId);
      
      setActivated(true);
      
      // Navegar para a tela principal após um pequeno delay
      setTimeout(() => {
        navigation.replace('Main', { config });
      }, 1000);
    } catch (error: any) {
      console.log('Auto-ativação falhou, aguardando entrada manual');
      setLoading(false);
    }
  };

  const handleManualActivation = async () => {
    if (!macAddress.trim()) {
      Alert.alert('Erro', 'Por favor, insira o endereço MAC');
      return;
    }

    try {
      setLoading(true);
      const config = await ApiService.getClientConfig(macAddress);
      
      // Conectar ao socket
      const socketService = getSocketService();
      socketService.connect(macAddress, deviceInfo?.deviceId || 'unknown');
      
      setActivated(true);
      
      setTimeout(() => {
        navigation.replace('Main', { config });
      }, 1000);
    } catch (error: any) {
      setLoading(false);
      Alert.alert(
        'Erro de Ativação',
        error.response?.data?.error || 'Não foi possível ativar o dispositivo. Verifique o endereço MAC.'
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>
          {activated ? 'Dispositivo ativado!' : 'Verificando ativação...'}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>IPTV App</Text>
          <Text style={styles.subtitle}>Ative seu dispositivo</Text>
        </View>

        <View style={styles.deviceInfo}>
          <Text style={styles.label}>ID do Dispositivo:</Text>
          <Text style={styles.deviceId}>{deviceInfo?.deviceId || 'Carregando...'}</Text>
          
          <Text style={styles.label}>Endereço MAC:</Text>
          <Text style={styles.macAddress}>{deviceInfo?.macAddress || 'Carregando...'}</Text>
          
          <Text style={styles.label}>Plataforma:</Text>
          <Text style={styles.platform}>{deviceInfo?.platform || 'Carregando...'}</Text>
        </View>

        <View style={styles.activationForm}>
          <Text style={styles.formLabel}>Endereço MAC</Text>
          <TextInput
            style={styles.input}
            value={macAddress}
            onChangeText={setMacAddress}
            placeholder="XX:XX:XX:XX:XX:XX"
            placeholderTextColor="#6B7280"
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={styles.activateButton}
            onPress={handleManualActivation}
          >
            <Text style={styles.activateButtonText}>Ativar Dispositivo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            Insira o endereço MAC fornecido pelo seu revendedor ou deixe o campo vazio para usar o endereço MAC gerado automaticamente.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  deviceInfo: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  label: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  deviceId: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  macAddress: {
    fontSize: 18,
    color: '#3B82F6',
    marginBottom: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  platform: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  activationForm: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 16,
  },
  activateButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  activateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
});
