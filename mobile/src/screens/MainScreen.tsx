import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Platform,
  Image
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ApiService } from '../services/api';
import { ClientConfig, Channel } from '../types';

// Simple SVG Icons as components
const SearchIcon = () => (
  <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color: '#9CA3AF', fontSize: 20 }}>🔍</Text>
  </View>
);

const FilterIcon = () => (
  <View style={{ width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color: '#9CA3AF', fontSize: 20 }}>🔽</Text>
  </View>
);

const LockIcon = () => (
  <View style={{ width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ color: '#EF4444', fontSize: 16 }}>🔒</Text>
  </View>
);

type NavigationProp = NativeStackNavigationProp<any, any>;

interface Props {
  navigation: NavigationProp;
  route: {
    params: {
      config: ClientConfig;
    };
  };
}

const { width, height } = Dimensions.get('window');

export default function MainScreen({ navigation, route }: Props) {
  const { config } = route.params;
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<Channel[]>([]);
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [parentalPin, setParentalPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [blockedChannels, setBlockedChannels] = useState<Set<string>>(new Set());

  const videoRef = useRef<Video>(null);

  useEffect(() => {
    loadChannels();
  }, [config]);

  useEffect(() => {
    filterChannels();
  }, [channels, searchTerm, selectedGroup]);

  const loadChannels = async () => {
    try {
      setLoading(true);
      let loadedChannels: Channel[] = [];

      if (config.m3u_url) {
        loadedChannels = await ApiService.parseM3UPlaylist(config.m3u_url);
      } else if (config.xtream_server_url && config.xtream_username && config.xtream_password) {
        loadedChannels = await ApiService.getXtreamChannels(
          config.xtream_server_url,
          config.xtream_username,
          config.xtream_password
        );
      }

      setChannels(loadedChannels);
      if (loadedChannels.length > 0) {
        setCurrentChannel(loadedChannels[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar canais:', error);
      Alert.alert('Erro', 'Não foi possível carregar os canais');
    } finally {
      setLoading(false);
    }
  };

  const filterChannels = () => {
    let filtered = channels;

    if (searchTerm) {
      filtered = filtered.filter(channel =>
        channel.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGroup) {
      filtered = filtered.filter(channel => channel.group === selectedGroup);
    }

    setFilteredChannels(filtered);
  };

  const playChannel = (channel: Channel) => {
    if (blockedChannels.has(channel.id)) {
      setShowPinModal(true);
      return;
    }

    setCurrentChannel(channel);
    if (videoRef.current) {
      videoRef.current.reloadAsync(
        { uri: channel.url },
        {},
        false
      );
    }
  };

  const handlePinSubmit = () => {
    if (parentalPin === '1234') { // PIN padrão - deve ser configurável
      setShowPinModal(false);
      setParentalPin('');
      if (currentChannel) {
        playChannel(currentChannel);
      }
    } else {
      Alert.alert('Erro', 'PIN incorreto');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getGroups = () => {
    const groups = new Set(channels.map(c => c.group));
    return Array.from(groups).sort();
  };

  const isChannelBlocked = (channelId: string) => {
    return blockedChannels.has(channelId);
  };

  const toggleChannelBlock = (channelId: string) => {
    const newBlocked = new Set(blockedChannels);
    if (newBlocked.has(channelId)) {
      newBlocked.delete(channelId);
    } else {
      newBlocked.add(channelId);
    }
    setBlockedChannels(newBlocked);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Carregando canais...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreen]}>
      {/* Video Player */}
      <View style={[styles.videoContainer, isFullscreen && styles.fullscreenVideo]}>
        {currentChannel && (
          <Video
            ref={videoRef}
            source={{ uri: currentChannel.url }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
              if (status.isLoaded && status.error) {
                console.error('Playback error:', status.error);
              }
            }}
          />
        )}
        
        {!isFullscreen && (
          <View style={styles.channelInfo}>
            <Text style={styles.channelName}>{currentChannel?.name || 'Nenhum canal selecionado'}</Text>
            <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenButton}>
              <Text style={styles.fullscreenButtonText}>Tela Cheia</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Channel List */}
      {!isFullscreen && (
        <View style={styles.channelListContainer}>
          {/* Search and Filter */}
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar canais..."
              placeholderTextColor="#6B7280"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowSettings(!showSettings)}
            >
              <FilterIcon />
            </TouchableOpacity>
          </View>

          {/* Group Filter */}
          {showSettings && (
            <View style={styles.groupFilter}>
              <FlatList
                horizontal
                data={['Todos', ...getGroups()]}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.groupChip,
                      (selectedGroup === null && item === 'Todos') || selectedGroup === item
                        ? styles.groupChipActive
                        : styles.groupChipInactive
                    ]}
                    onPress={() => setSelectedGroup(item === 'Todos' ? null : item)}
                  >
                    <Text style={[
                      styles.groupChipText,
                      (selectedGroup === null && item === 'Todos') || selectedGroup === item
                        ? styles.groupChipTextActive
                        : styles.groupChipTextInactive
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

          {/* Channels */}
          <FlatList
            data={filteredChannels}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.channelItem,
                  currentChannel?.id === item.id && styles.channelItemActive
                ]}
                onPress={() => playChannel(item)}
                onLongPress={() => toggleChannelBlock(item.id)}
              >
                <View style={styles.channelItemContent}>
                  {item.logo ? (
                    <Image
                      source={{ uri: item.logo }}
                      style={styles.channelLogo}
                    />
                  ) : (
                    <View style={[styles.channelLogo, styles.placeholderLogo]}>
                      <Text style={styles.placeholderText}>📺</Text>
                    </View>
                  )}
                  <View style={styles.channelItemInfo}>
                    <Text style={[
                      styles.channelItemName,
                      currentChannel?.id === item.id && styles.channelItemNameActive
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={styles.channelItemGroup}>{item.group}</Text>
                  </View>
                  {isChannelBlocked(item.id) && (
                    <LockIcon />
                  )}
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* PIN Modal */}
      <Modal
        visible={showPinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Controle Parental</Text>
            <Text style={styles.modalText}>Digite o PIN para desbloquear este canal</Text>
            <TextInput
              style={styles.pinInput}
              placeholder="••••"
              placeholderTextColor="#6B7280"
              secureTextEntry
              value={parentalPin}
              onChangeText={setParentalPin}
              maxLength={4}
              keyboardType="number-pad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowPinModal(false);
                  setParentalPin('');
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handlePinSubmit}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
  videoContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: '#000000',
  },
  fullscreenVideo: {
    flex: 1,
    aspectRatio: undefined,
  },
  video: {
    flex: 1,
  },
  channelInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  channelName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fullscreenButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fullscreenButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  channelListContainer: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  searchBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#111827',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  filterButton: {
    padding: 12,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  groupFilter: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  groupChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  groupChipActive: {
    backgroundColor: '#3B82F6',
  },
  groupChipInactive: {
    backgroundColor: '#374151',
  },
  groupChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  groupChipTextActive: {
    color: '#ffffff',
  },
  groupChipTextInactive: {
    color: '#9CA3AF',
  },
  channelItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  channelItemActive: {
    backgroundColor: '#1E3A5F',
  },
  channelItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  channelLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#374151',
  },
  placeholderLogo: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  channelItemInfo: {
    flex: 1,
  },
  channelItemName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  channelItemNameActive: {
    color: '#3B82F6',
  },
  channelItemGroup: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  pinInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 24,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#374151',
  },
  modalButtonConfirm: {
    backgroundColor: '#3B82F6',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
