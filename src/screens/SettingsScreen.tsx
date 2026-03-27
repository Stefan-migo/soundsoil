/**
 * SoundSoil Companion - Settings Screen
 * Configuration for connection, sensors, camera, audio, and presets
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [accelEnabled, setAccelEnabled] = React.useState(true);
  const [gyroEnabled, setGyroEnabled] = React.useState(true);
  const [magEnabled, setMagEnabled] = React.useState(true);
  const [cameraEnabled, setCameraEnabled] = React.useState(false);
  const [audioEnabled, setAudioEnabled] = React.useState(true);
  const [fftEnabled, setFftEnabled] = React.useState(true);

  return (
    <ScrollView style={styles.container}>
      {/* Connection Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CONEXIÓN</Text>
        <View style={styles.row}>
          <Text style={styles.label}>IP:</Text>
          <Text style={styles.value}>192.168.1.50</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Puerto:</Text>
          <Text style={styles.value}>8443</Text>
        </View>
        <TouchableOpacity style={styles.button}>
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
          <Text style={styles.value}>33ms</Text>
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
          <Text style={styles.value}>10</Text>
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
          <Text style={styles.value}>8</Text>
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
