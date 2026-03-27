/**
 * SoundSoil Companion - Home Screen
 * Main screen with live data, preset selector, and sensor tiles
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [connected, setConnected] = React.useState(false);
  const [motionEnabled, setMotionEnabled] = React.useState(true);
  const [cameraEnabled, setCameraEnabled] = React.useState(false);
  const [audioEnabled, setAudioEnabled] = React.useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.statusDot, { backgroundColor: connected ? colors.connected : colors.disconnected }]} />
          <Text style={styles.headerTitle}>SOILSOUND</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.headerIcon}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerIcon}>📡</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Data Area */}
      <View style={styles.liveDataArea}>
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionDot}>◉</Text>
          <Text style={styles.connectionText}>
            {connected ? 'CONECTADO' : 'DESCONECTADO'}
          </Text>
        </View>
        <Text style={styles.liveDataText}>
          motion: +0.12 | -0.04 | 9.81
        </Text>
        <View style={styles.audioBar}>
          <Text style={styles.audioLabel}>audio:</Text>
          <View style={styles.audioBarContainer}>
            <View style={[styles.audioBarFill, { width: '45%' }]} />
          </View>
          <Text style={styles.audioPercent}>45%</Text>
        </View>
      </View>

      {/* Preset Selector */}
      <TouchableOpacity style={styles.presetSelector}>
        <Text style={styles.presetLabel}>preset:</Text>
        <Text style={styles.presetName}>Performance</Text>
        <Text style={styles.presetArrow}>▼</Text>
      </TouchableOpacity>

      {/* Sensor Tiles */}
      <View style={styles.tilesContainer}>
        {/* Motion Tile */}
        <TouchableOpacity
          style={[
            styles.tile,
            motionEnabled && styles.tileActive,
          ]}
          onPress={() => setMotionEnabled(!motionEnabled)}>
          <Text style={styles.tileIcon}>🎯</Text>
          <Text style={styles.tileTitle}>MOTION</Text>
          <Text style={[
            styles.tileStatus,
            motionEnabled ? styles.statusOn : styles.statusOff,
          ]}>
            {motionEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>

        {/* Camera Tile */}
        <TouchableOpacity
          style={[
            styles.tile,
            cameraEnabled && styles.tileActive,
          ]}
          onPress={() => setCameraEnabled(!cameraEnabled)}>
          <Text style={styles.tileIcon}>📷</Text>
          <Text style={styles.tileTitle}>CAM</Text>
          <Text style={[
            styles.tileStatus,
            cameraEnabled ? styles.statusOn : styles.statusOff,
          ]}>
            {cameraEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>

        {/* Audio Tile */}
        <TouchableOpacity
          style={[
            styles.tile,
            audioEnabled && styles.tileActive,
          ]}
          onPress={() => setAudioEnabled(!audioEnabled)}>
          <Text style={styles.tileIcon}>🎤</Text>
          <Text style={styles.tileTitle}>AUDIO</Text>
          <Text style={[
            styles.tileStatus,
            audioEnabled ? styles.statusOn : styles.statusOff,
          ]}>
            {audioEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  liveDataArea: {
    padding: 20,
    alignItems: 'center',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectionDot: {
    color: colors.active,
    fontSize: 12,
    marginRight: 8,
  },
  connectionText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  liveDataText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  audioBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  audioLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginRight: 8,
  },
  audioBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  audioBarFill: {
    height: '100%',
    backgroundColor: colors.active,
    borderRadius: 4,
  },
  audioPercent: {
    color: colors.textSecondary,
    fontSize: 12,
    marginLeft: 8,
    width: 40,
  },
  presetSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  presetLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginRight: 8,
  },
  presetName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  presetArrow: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  tilesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
  },
  tile: {
    width: 100,
    height: 100,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.tileBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  tileActive: {
    borderColor: colors.active,
    backgroundColor: colors.surfaceLight,
  },
  tileIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tileTitle: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 2,
  },
  tileStatus: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusOn: {
    color: colors.active,
  },
  statusOff: {
    color: colors.inactive,
  },
});

export default HomeScreen;
