/**
 * SoundSoil Companion - QR Scanner Screen
 * Scan QR codes to import presets
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';

type QrScannerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QrScanner'>;

interface Props {
  navigation: QrScannerScreenNavigationProp;
}

const QrScannerScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.scannerArea}>
        <View style={styles.scannerFrame}>
          <Text style={styles.scannerIcon}>📷</Text>
          <Text style={styles.scannerText}>Cámara no disponible</Text>
          <Text style={styles.scannerSubtext}>
            Point your camera at a preset QR code
          </Text>
        </View>
      </View>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
