/**
 * SoundSoil Companion - Preset Editor Screen
 * Create or edit a preset configuration
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TextInput, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';

type PresetEditorNavigationProp = StackNavigationProp<RootStackParamList, 'PresetEditor'>;
type PresetEditorRouteProp = RouteProp<RootStackParamList, 'PresetEditor'>;

interface Props {
  navigation: PresetEditorNavigationProp;
  route: PresetEditorRouteProp;
}

const PresetEditorScreen: React.FC<Props> = ({ navigation, route }) => {
  const { presetId } = route.params || {};
  const isEditing = !!presetId;

  const [name, setName] = React.useState(isEditing ? 'Performance Gestual' : '');
  const [motionEnabled, setMotionEnabled] = React.useState(true);
  const [cameraEnabled, setCameraEnabled] = React.useState(false);
  const [audioEnabled, setAudioEnabled] = React.useState(true);
  const [oscHost, setOscHost] = React.useState('192.168.1.50');
  const [oscPort, setOscPort] = React.useState('8443');

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
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Guardar Preset</Text>
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
