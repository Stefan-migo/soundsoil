/**
 * SoundSoil Companion - Settings Screen
 * Configuration for connection, sensors, camera, audio, and presets
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { useConnection } from '../hooks/useConnection';
import { usePresets } from '../hooks/usePresets';
import { ConnectionDialog } from '../components/ConnectionDialog';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { settings: connectionSettings } = useConnection();
  const { activePreset } = usePresets();

  // Local state for sensor toggles (synced with active preset)
  const [accelEnabled, setAccelEnabled] = useState(true);
  const [gyroEnabled, setGyroEnabled] = useState(true);
  const [magEnabled, setMagEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [fftEnabled, setFftEnabled] = useState(true);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);

  // Sync with active preset
  useEffect(() => {
    if (activePreset) {
      setAccelEnabled(activePreset.motion.sensors?.includes('accel') ?? true);
      setGyroEnabled(activePreset.motion.sensors?.includes('gyro') ?? true);
      setMagEnabled(activePreset.motion.sensors?.includes('mag') ?? true);
      setCameraEnabled(activePreset.camera.enabled);
      setAudioEnabled(activePreset.audio.enabled);
      setFftEnabled(activePreset.audio.fftBins !== undefined && activePreset.audio.fftBins > 0);
    }
  }, [activePreset]);

  const handleConnectionChange = useCallback(() => {
    setShowConnectionDialog(true);
  }, []);

  const handleConnect = useCallback((host: string, port: number) => {
    // Connection will be handled by HomeScreen
    console.log('Connection settings updated:', host, port);
  }, []);

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Connection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONEXIÓN</Text>
          <View style={styles.row}>
            <Text style={styles.label}>IP:</Text>
            <Text style={styles.value}>{connectionSettings.host}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Puerto:</Text>
            <Text style={styles.value}>{connectionSettings.port}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleConnectionChange}>
            <Text style={styles.buttonText}>Cambiar</Text>
          </TouchableOpacity>
        </View>

        {/* Sensors Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SENSORES</Text>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Acelerómetro</Text>
            <Switch
              value={accelEnabled}
              onValueChange={setAccelEnabled}
              trackColor={{ false: colors.inactive, true: colors.active }}
              thumbColor={colors.textPrimary}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Giroscopio</Text>
            <Switch
              value={gyroEnabled}
              onValueChange={setGyroEnabled}
              trackColor={{ false: colors.inactive, true: colors.active }}
              thumbColor={colors.textPrimary}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Magnetómetro</Text>
            <Switch
              value={magEnabled}
              onValueChange={setMagEnabled}
              trackColor={{ false: colors.inactive, true: colors.active }}
              thumbColor={colors.textPrimary}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Intervalo:</Text>
            <Text style={styles.value}>{activePreset?.motion.interval || 33}ms</Text>
          </View>
        </View>

        {/* Camera Section */}
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
          <View style={styles.row}>
            <Text style={styles.label}>FPS:</Text>
            <Text style={styles.value}>{activePreset?.camera.fps || 10}</Text>
          </View>
        </View>

        {/* Audio Section */}
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
          <View style={styles.switchRow}>
            <Text style={styles.label}>Level</Text>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: colors.inactive, true: colors.active }}
              thumbColor={colors.textPrimary}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.label}>FFT</Text>
            <Switch
              value={fftEnabled}
              onValueChange={setFftEnabled}
              trackColor={{ false: colors.inactive, true: colors.active }}
              thumbColor={colors.textPrimary}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>FFT Bins:</Text>
            <Text style={styles.value}>{activePreset?.audio.fftBins || 8}</Text>
          </View>
        </View>

        {/* Presets Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRESETS</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Presets')}>
            <Text style={styles.menuItemText}>Ver todos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('PresetEditor', {})}>
            <Text style={styles.menuItemText}>Crear nuevo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('QrScanner')}>
            <Text style={styles.menuItemText}>Escanear QR</Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFO</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Preset activo:</Text>
            <Text style={styles.value}>{activePreset?.name || 'Ninguno'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Destino OSC:</Text>
            <Text style={styles.value}>
              {activePreset?.oscTarget.host || connectionSettings.host}:
              {activePreset?.oscTarget.port || connectionSettings.port}
            </Text>
          </View>
        </View>
      </ScrollView>

      <ConnectionDialog
        visible={showConnectionDialog}
        onClose={() => setShowConnectionDialog(false)}
        onConnect={handleConnect}
      />
    </>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  value: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: colors.active,
    fontSize: 14,
    fontWeight: '600',
  },
  menuItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  menuItemText: {
    color: colors.textPrimary,
    fontSize: 14,
  },
});

export default SettingsScreen;
