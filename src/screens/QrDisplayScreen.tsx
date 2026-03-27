/**
 * SoundSoil Companion - QR Display Screen
 * Display QR code to share preset
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';

type QrDisplayScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QrDisplay'>;
type QrDisplayScreenRouteProp = RouteProp<RootStackParamList, 'QrDisplay'>;

interface Props {
  navigation: QrDisplayScreenNavigationProp;
  route: QrDisplayScreenRouteProp;
}

const QrDisplayScreen: React.FC<Props> = ({ navigation, route }) => {
  const { presetId } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.qrArea}>
        <View style={styles.qrFrame}>
          <Text style={styles.qrPlaceholder}>QR</Text>
          <Text style={styles.presetName}>Preset: {presetId}</Text>
        </View>
      </View>
      <Text style={styles.instructions}>
        Escanea este código QR con otro dispositivo para importar el preset
      </Text>
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => navigation.goBack()}>
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
  qrArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  qrFrame: {
    width: 250,
    height: 250,
    backgroundColor: colors.textPrimary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPlaceholder: {
    fontSize: 64,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 8,
  },
  presetName: {
    color: colors.background,
    fontSize: 12,
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
