/**
 * SoundSoil Companion - QrDisplay Screen
 * Display QR code to share preset
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { usePresets } from '../hooks/usePresets';
import { encodePresetForQR } from '../utils/qr';

type QrDisplayScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QrDisplay'>;
type QrDisplayScreenRouteProp = RouteProp<RootStackParamList, 'QrDisplay'>;

interface Props {
  navigation: QrDisplayScreenNavigationProp;
  route: QrDisplayScreenRouteProp;
}

const QrDisplayScreen: React.FC<Props> = ({ navigation, route }) => {
  const { presetId } = route.params;
  const { presets } = usePresets();

  const preset = presets.find((p) => p.id === presetId);
  const qrData = useMemo(() => {
    if (!preset) return null;
    return encodePresetForQR(preset);
  }, [preset]);

  if (!preset || !qrData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Preset no encontrado</Text>
        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
          <Text style={styles.doneButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.qrArea}>
        <View style={styles.qrFrame}>
          <Text style={styles.qrTitle}>SOILSOUND</Text>
          <Text style={styles.qrPresetName}>{preset.name}</Text>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrPlaceholderText}>QR</Text>
          </View>
          <Text style={styles.qrDataPreview}>
            {qrData.substring(0, 30)}...
          </Text>
        </View>
      </View>
      <Text style={styles.instructions}>
        Escanea este código QR con otro dispositivo para importar el preset
      </Text>
      <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
        <Text style={styles.doneButtonText}>Listo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  qrArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrFrame: {
    width: 280,
    padding: 20,
    backgroundColor: colors.textPrimary,
    borderRadius: 16,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 4,
  },
  qrPresetName: {
    fontSize: 12,
    color: colors.background,
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: colors.background,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  qrPlaceholderText: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  qrDataPreview: {
    fontSize: 8,
    color: colors.textMuted,
    textAlign: 'center',
  },
  instructions: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  doneButton: {
    margin: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: colors.active,
    alignItems: 'center',
  },
  doneButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default QrDisplayScreen;
