/**
 * SoundSoil Companion - QR Scanner Screen
 * Scan QR codes to import presets
 * Note: Camera requires react-native-camera or vision-camera (Phase 5)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { decodePresetFromQR } from '../utils/qr';
import { presetService } from '../services/PresetService';

type QrScannerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QrScanner'>;

interface Props {
  navigation: QrScannerScreenNavigationProp;
}

// Placeholder QR data for testing (valid SOILSOUND QR)
const TEST_QR = 'SOILSOUND:eyJ2IjoiMSIsInAiOnsiaWQiOiJkZWZhdWx0LTEiLCJuYW1lIjoiVGVzdCBQcmVzZXQiLCJtb3Rpb24iOnsiZW5hYmxlZCI6dHJ1ZSwic2Vuc29ycyI6WyJhY2NlbCIsImd5cm8iXSwiaW50ZXJ2YWwiOjMzfSwiY2FtZXJhIjp7ImVuYWJsZWQiOmZhbHNlLCJmcHMiOjEwfSwiYXVkaW8iOnsiZW5hYmxlZCI6dHJ1ZSwiZmZ0QmlucyI6OCwibGV2ZWwiOnRydWV9LCJvc2NUYXJnZXQiOnsiaG9zdCI6IjE5Mi4xNjguMS41MCIsInBvcnQiOjg0NDN9LCJjcmVhdGVkQXQiOiIyMDI2LTAzLTI2VDEyOjAwOjAwWiJ9fQ==';

const QrScannerScreen: React.FC<Props> = ({ navigation }) => {
  const [manualInput, setManualInput] = useState('');

  const handleScanResult = async (qrString: string) => {
    const preset = decodePresetFromQR(qrString);
    if (!preset) {
      Alert.alert('QR Inválido', 'El código QR no es un preset válido de SoundSoil');
      return;
    }

    try {
      // Import the preset
      await presetService.create({
        name: preset.name,
        motion: preset.motion,
        camera: preset.camera,
        audio: preset.audio,
        oscTarget: preset.oscTarget,
      });
      Alert.alert(
        'Preset Importado',
        `"${preset.name}" ha sido importado exitosamente`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo importar el preset');
    }
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleScanResult(manualInput.trim());
    }
  };

  const handleUseTestQR = () => {
    handleScanResult(TEST_QR);
  };

  return (
    <View style={styles.container}>
      <View style={styles.scannerArea}>
        <View style={styles.scannerFrame}>
          <Text style={styles.scannerIcon}>📷</Text>
          <Text style={styles.scannerText}>Cámara no disponible</Text>
          <Text style={styles.scannerSubtext}>
            Funcionalidad de cámara estará disponible en Fase 5
          </Text>
        </View>
      </View>

      {/* Manual Input Option */}
      <View style={styles.manualSection}>
        <Text style={styles.manualTitle}>O ingresa el código QR manualmente:</Text>
        <TextInput
          style={styles.manualInput}
          value={manualInput}
          onChangeText={setManualInput}
          placeholder="Pega el contenido del QR aquí"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
        />
        <TouchableOpacity
          style={[styles.button, !manualInput.trim() && styles.buttonDisabled]}
          onPress={handleManualSubmit}
          disabled={!manualInput.trim()}>
          <Text style={styles.buttonText}>Importar Preset</Text>
        </TouchableOpacity>
      </View>

      {/* Test Button */}
      <TouchableOpacity style={styles.testButton} onPress={handleUseTestQR}>
        <Text style={styles.testButtonText}>Usar QR de prueba</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scannerArea: {
    padding: 20,
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colors.active,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  scannerIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  scannerText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  scannerSubtext: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  manualSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  manualTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 12,
  },
  manualInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    color: colors.textPrimary,
    fontSize: 12,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.active,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.surface,
  },
  buttonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  testButton: {
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textMuted,
    alignItems: 'center',
  },
  testButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  cancelButton: {
    margin: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
});

export default QrScannerScreen;
