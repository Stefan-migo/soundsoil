/**
 * SoundSoil Companion - Preset Editor Screen
 * Create or edit a preset configuration
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { usePresets } from '../hooks/usePresets';

type PresetEditorNavigationProp = StackNavigationProp<RootStackParamList, 'PresetEditor'>;
type PresetEditorRouteProp = RouteProp<RootStackParamList, 'PresetEditor'>;

interface Props {
  navigation: PresetEditorNavigationProp;
  route: PresetEditorRouteProp;
}

const PresetEditorScreen: React.FC<Props> = ({ navigation, route }) => {
  const { presetId } = route.params || {};
  const isEditing = !!presetId;

  const { presets, createPreset, updatePreset } = usePresets();

  // Find existing preset if editing
  const existingPreset = isEditing ? presets.find((p) => p.id === presetId) : null;

  // Form state
  const [name, setName] = useState(existingPreset?.name || '');
  const [motionEnabled, setMotionEnabled] = useState(existingPreset?.motion.enabled ?? true);
  const [cameraEnabled, setCameraEnabled] = useState(existingPreset?.camera.enabled ?? false);
  const [audioEnabled, setAudioEnabled] = useState(existingPreset?.audio.enabled ?? true);
  const [oscHost, setOscHost] = useState(existingPreset?.oscTarget.host || '192.168.1.50');
  const [oscPort, setOscPort] = useState(String(existingPreset?.oscTarget.port || 8443));

  // Update form when preset loads
  useEffect(() => {
    if (existingPreset) {
      setName(existingPreset.name);
      setMotionEnabled(existingPreset.motion.enabled);
      setCameraEnabled(existingPreset.camera.enabled);
      setAudioEnabled(existingPreset.audio.enabled);
      setOscHost(existingPreset.oscTarget.host);
      setOscPort(String(existingPreset.oscTarget.port));
    }
  }, [existingPreset]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Ingresa un nombre para el preset');
      return;
    }

    const presetData = {
      name: name.trim(),
      motion: {
        enabled: motionEnabled,
        sensors: ['accel', 'gyro', 'mag'] as ('accel' | 'gyro' | 'mag')[],
        interval: 33,
      },
      camera: {
        enabled: cameraEnabled,
        fps: 10,
      },
      audio: {
        enabled: audioEnabled,
        fftBins: 8,
        level: true,
      },
      oscTarget: {
        host: oscHost.trim() || '192.168.1.50',
        port: parseInt(oscPort, 10) || 8443,
      },
    };

    try {
      if (isEditing && presetId) {
        await updatePreset(presetId, presetData);
      } else {
        await createPreset(presetData);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el preset');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Preset Name */}
      <View style={styles.section}>
        <Text style={styles.label}>Nombre del Preset</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nombre del preset"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {/* Motion Config */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MOTION</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Habilitar</Text>
          <Switch
            value={motionEnabled}
            onValueChange={setMotionEnabled}
            trackColor={{ false: colors.inactive, true: colors.active }}
            thumbColor={colors.textPrimary}
          />
        </View>
      </View>

      {/* Camera Config */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CÁMARA</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Habilitar</Text>
          <Switch
            value={cameraEnabled}
            onValueChange={setCameraEnabled}
            trackColor={{ false: colors.inactive, true: colors.active }}
            thumbColor={colors.textPrimary}
          />
        </View>
      </View>

      {/* Audio Config */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AUDIO</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Habilitar</Text>
          <Switch
            value={audioEnabled}
            onValueChange={setAudioEnabled}
            trackColor={{ false: colors.inactive, true: colors.active }}
            thumbColor={colors.textPrimary}
          />
        </View>
      </View>

      {/* OSC Target */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DESTINO OSC</Text>
        <Text style={styles.label}>Host</Text>
        <TextInput
          style={styles.input}
          value={oscHost}
          onChangeText={setOscHost}
          placeholder="192.168.1.50"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Puerto</Text>
        <TextInput
          style={styles.input}
          value={oscPort}
          onChangeText={setOscPort}
          placeholder="8443"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>
            {isEditing ? 'Actualizar Preset' : 'Crear Preset'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 16,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: colors.active,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default PresetEditorScreen;
