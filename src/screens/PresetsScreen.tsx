/**
 * SoundSoil Companion - Presets Screen
 * List of saved presets with options to create, edit, share
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Preset } from '../types';
import { colors } from '../theme/colors';

type PresetsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Presets'>;

interface Props {
  navigation: PresetsScreenNavigationProp;
}

// Placeholder presets
const placeholderPresets: Preset[] = [
  {
    id: '1',
    name: 'Performance Gestual',
    motion: { enabled: true, sensors: ['accel', 'gyro', 'mag'], interval: 33 },
    camera: { enabled: false, fps: 10 },
    audio: { enabled: true, fftBins: 8, level: true },
    oscTarget: { host: '192.168.1.50', port: 8443 },
    createdAt: '2026-03-26T12:00:00Z',
  },
  {
    id: '2',
    name: 'Sensores Only',
    motion: { enabled: true, sensors: ['accel', 'gyro'], interval: 33 },
    camera: { enabled: false },
    audio: { enabled: false },
    oscTarget: { host: '192.168.1.50', port: 8443 },
    createdAt: '2026-03-25T10:00:00Z',
  },
  {
    id: '3',
    name: 'Instalación',
    motion: { enabled: true, sensors: ['accel', 'gyro', 'mag'], interval: 33 },
    camera: { enabled: false },
    audio: { enabled: true, fftBins: 8 },
    oscTarget: { host: '192.168.1.50', port: 8443 },
    createdAt: '2026-03-24T08:00:00Z',
  },
  {
    id: '4',
    name: 'Full',
    motion: { enabled: true, sensors: ['accel', 'gyro', 'mag'], interval: 33 },
    camera: { enabled: true, fps: 10 },
    audio: { enabled: true, fftBins: 8 },
    oscTarget: { host: '192.168.1.50', port: 8443 },
    createdAt: '2026-03-23T14:00:00Z',
  },
];

const PresetsScreen: React.FC<Props> = ({ navigation }) => {
  const renderPreset = ({ item }: { item: Preset }) => {
    const isActive = item.id === '1';
    return (
      <TouchableOpacity
        style={styles.presetItem}
        onPress={() => navigation.navigate('PresetEditor', { presetId: item.id })}>
        <View style={styles.presetHeader}>
          <View style={styles.presetDot} />
          <Text style={styles.presetName}>{item.name}</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuIcon}>···</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.presetDescription}>
          {item.motion.enabled ? 'Motion' : ''}
          {item.camera.enabled ? ' + Cam' : ''}
          {item.audio.enabled ? ' + Audio' : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={placeholderPresets}
        renderItem={renderPreset}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('PresetEditor', {})}>
        <Text style={styles.addButtonText}>+ Nuevo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
  },
  presetItem: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.active,
    marginRight: 12,
  },
  presetName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  presetDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 20,
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: colors.active,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  addButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default PresetsScreen;
