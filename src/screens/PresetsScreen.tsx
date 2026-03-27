/**
 * SoundSoil Companion - Presets Screen
 * List of saved presets with options to create, edit, share
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Preset } from '../types';
import { colors } from '../theme/colors';
import { usePresets } from '../hooks/usePresets';

type PresetsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Presets'>;

interface Props {
  navigation: PresetsScreenNavigationProp;
}

const PresetsScreen: React.FC<Props> = ({ navigation }) => {
  const {
    presets,
    activePresetId,
    isLoading,
    setActivePreset,
    deletePreset,
    duplicatePreset,
  } = usePresets();

  const handlePresetPress = useCallback(
    async (preset: Preset) => {
      await setActivePreset(preset.id);
      navigation.navigate('Home');
    },
    [setActivePreset, navigation]
  );

  const handleMenuPress = useCallback(
    (preset: Preset) => {
      Alert.alert(preset.name, '¿Qué deseas hacer?', [
        {
          text: 'Editar',
          onPress: () =>
            navigation.navigate('PresetEditor', { presetId: preset.id }),
        },
        {
          text: 'Duplicar',
          onPress: async () => {
            await duplicatePreset(preset.id);
          },
        },
        {
          text: 'Compartir QR',
          onPress: () =>
            navigation.navigate('QrDisplay', { presetId: preset.id }),
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Eliminar Preset',
              `¿Estás seguro de eliminar "${preset.name}"?`,
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Eliminar',
                  style: 'destructive',
                  onPress: () => deletePreset(preset.id),
                },
              ]
            );
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    },
    [navigation, duplicatePreset, deletePreset]
  );

  const renderPreset = useCallback(
    ({ item }: { item: Preset }) => {
      const isActive = item.id === activePresetId;

      // Build description
      const parts: string[] = [];
      if (item.motion.enabled) parts.push('Motion');
      if (item.camera.enabled) parts.push('Cam');
      if (item.audio.enabled) parts.push('Audio');
      const description = parts.length > 0 ? parts.join(' + ') : 'Sin sensores';

      return (
        <TouchableOpacity
          style={[styles.presetItem, isActive && styles.presetItemActive]}
          onPress={() => handlePresetPress(item)}>
          <View style={styles.presetHeader}>
            <View
              style={[
                styles.presetDot,
                { backgroundColor: isActive ? colors.active : colors.textMuted },
              ]}
            />
            <Text style={styles.presetName}>{item.name}</Text>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => handleMenuPress(item)}>
              <Text style={styles.menuIcon}>···</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.presetDescription}>{description}</Text>
        </TouchableOpacity>
      );
    },
    [activePresetId, handlePresetPress, handleMenuPress]
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.active} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={presets}
        renderItem={renderPreset}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  presetItem: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  presetItemActive: {
    borderWidth: 1,
    borderColor: colors.active,
  },
  presetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  separator: {
    height: 12,
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
