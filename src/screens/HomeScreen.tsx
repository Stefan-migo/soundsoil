/**
 * SoundSoil Companion - Home Screen
 * Main screen with live data, preset selector, and sensor tiles
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Camera, useFrameProcessor, Frame } from 'react-native-vision-camera';
import { RootStackParamList, CameraData } from '../types';
import { colors } from '../theme/colors';
import { useSensors } from '../hooks/useSensors';
import { useWebSocket } from '../hooks/useWebSocket';
import { usePresets } from '../hooks/usePresets';
import { useAudio } from '../hooks/useAudio';
import { useCamera } from '../hooks/useCamera';
import { useConnection } from '../hooks/useConnection';
import { webSocketService } from '../services/WebSocketService';
import { ConnectionDialog } from '../components/ConnectionDialog';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  // Presets
  const { activePreset } = usePresets();

  // Connection settings
  const { settings: connectionSettings } = useConnection();

  // Local UI state
  const [motionEnabled, setMotionEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);

  // WebSocket connection
  const { status: wsStatus, connect, disconnect } = useWebSocket({ autoConnect: false });

  // Motion sensor data
  const {
    motionData,
    setEnabled: setSensorsEnabled,
  } = useSensors({
    enabled: motionEnabled,
    interval: activePreset?.motion.interval || 33,
    webSocketService: wsStatus === 'connected' ? webSocketService : null,
  });

  // Audio data
  const {
    audioData,
    isRecording,
    hasPermission: hasAudioPermission,
    enabled: audioEnabledHook,
    setEnabled: setAudioEnabledHook,
  } = useAudio({
    enabled: audioEnabled,
    fftBins: activePreset?.audio.fftBins || 8,
    webSocketService: wsStatus === 'connected' ? webSocketService : null,
  });

  // Camera data
  const {
    cameraData,
    isActive: isCameraActive,
    hasPermission: hasCameraPermission,
    enabled: cameraEnabledHook,
    setEnabled: setCameraEnabledHook,
    device: cameraDevice,
  } = useCamera({
    enabled: cameraEnabled,
    fps: activePreset?.camera.fps || 10,
    webSocketService: wsStatus === 'connected' ? webSocketService : null,
  });

  // Frame processor for VisionCamera
  const frameProcessor = useFrameProcessor((frame: Frame) => {
    'worklet';
    if (!cameraEnabled || wsStatus !== 'connected') return;

    const frameIntervalMs = 1000 / (activePreset?.camera.fps || 10);
    const now = Date.now();

    if ((frame as any).lastProcessedTime === undefined) {
      (frame as any).lastProcessedTime = 0;
    }

    if (now - (frame as any).lastProcessedTime >= frameIntervalMs) {
      (frame as any).lastProcessedTime = now;
      try {
        const base64 = frame.toString();
        if (base64) {
          const cameraData: CameraData = { frame: base64 };
          // Send to WebSocket
          webSocketService.send({
            type: 'camera',
            data: cameraData,
            timestamp: now,
          });
        }
      } catch {
        // Frame may have been released
      }
    }
  }, [cameraEnabled, wsStatus, activePreset?.camera.fps]);

  // Sync toggles with active preset
  useEffect(() => {
    if (activePreset) {
      setMotionEnabled(activePreset.motion.enabled);
      setCameraEnabled(activePreset.camera.enabled);
      setAudioEnabled(activePreset.audio.enabled);
    }
  }, [activePreset]);

  // Sync audio hook with audioEnabled toggle
  useEffect(() => {
    setAudioEnabledHook(audioEnabled);
  }, [audioEnabled, setAudioEnabledHook]);

  // Sync camera hook with cameraEnabled toggle
  useEffect(() => {
    setCameraEnabledHook(cameraEnabled);
  }, [cameraEnabled, setCameraEnabledHook]);

  const isConnected = wsStatus === 'connected';

  // Handle motion tile toggle
  const toggleMotion = useCallback(() => {
    const newValue = !motionEnabled;
    setMotionEnabled(newValue);
    setSensorsEnabled(newValue);
  }, [motionEnabled, setSensorsEnabled]);

  // Handle connect button
  const handleConnectPress = useCallback(() => {
    if (isConnected) {
      disconnect();
    } else {
      setShowConnectionDialog(true);
    }
  }, [isConnected, disconnect]);

  // Handle connection from dialog
  const handleConnect = useCallback((host: string, port: number) => {
    webSocketService.configure({ host, port, path: '/' });
    connect();
  }, [connect]);

  // Format motion value
  const formatMotionValue = (value: number): string => {
    return value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isConnected ? colors.connected : colors.disconnected },
            ]}
          />
          <Text style={styles.headerTitle}>SOILSOUND</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.headerIcon}>⚙️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleConnectPress}>
            <Text style={styles.headerIcon}>📡</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Live Data Area */}
      <View style={styles.liveDataArea}>
        <View style={styles.connectionStatus}>
          <Text style={[styles.connectionDot, { color: isConnected ? colors.active : colors.inactive }]}>
            ◉
          </Text>
          <Text style={styles.connectionText}>
            {isConnected ? 'CONECTADO' : 'DESCONECTADO'}
          </Text>
        </View>

        {/* Motion Data */}
        <Text style={styles.liveDataLabel}>motion:</Text>
        <View style={styles.motionDataContainer}>
          <View style={styles.motionAxis}>
            <Text style={styles.axisLabel}>X</Text>
            <Text style={styles.axisValue}>{formatMotionValue(motionData.accel.x)}</Text>
          </View>
          <View style={styles.motionAxis}>
            <Text style={styles.axisLabel}>Y</Text>
            <Text style={styles.axisValue}>{formatMotionValue(motionData.accel.y)}</Text>
          </View>
          <View style={styles.motionAxis}>
            <Text style={styles.axisLabel}>Z</Text>
            <Text style={styles.axisValue}>{formatMotionValue(motionData.accel.z)}</Text>
          </View>
        </View>

        {/* Audio Level Bar with FFT */}
        <Text style={styles.liveDataLabel}>audio:</Text>
        <View style={styles.audioContainer}>
          <View style={styles.audioBarWrapper}>
            <View style={styles.audioBarContainer}>
              <View
                style={[
                  styles.audioBarFill,
                  { width: `${(audioData.level || 0) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.audioPercent}>
              {audioEnabled && hasAudioPermission
                ? `${Math.round((audioData.level || 0) * 100)}%`
                : '--'}
            </Text>
          </View>
          {/* FFT Bars */}
          {audioEnabled && hasAudioPermission && (
            <View style={styles.fftContainer}>
              {audioData.fft?.map((value, index) => (
                <View key={index} style={styles.fftBar}>
                  <View
                    style={[
                      styles.fftBarFill,
                      { height: `${Math.min(100, value * 100)}%` },
                    ]}
                  />
                </View>
              )) || null}
            </View>
          )}
        </View>

        {/* Camera Preview */}
        {cameraEnabled && hasCameraPermission && cameraDevice && (
          <View style={styles.cameraPreviewContainer}>
            <Text style={styles.liveDataLabel}>camera:</Text>
            <View style={styles.cameraPreview}>
              <Camera
                style={styles.cameraPreviewInner}
                device={cameraDevice}
                isActive={isCameraActive}
                frameProcessor={frameProcessor}
              />
            </View>
            {wsStatus === 'connected' && (
              <Text style={styles.cameraStatusText}>Enviando frames...</Text>
            )}
            {wsStatus !== 'connected' && (
              <Text style={styles.cameraStatusTextOff}>Conecta para enviar</Text>
            )}
          </View>
        )}

        {cameraEnabled && !hasCameraPermission && (
          <View style={styles.cameraPreviewContainer}>
            <Text style={styles.liveDataLabel}>camera:</Text>
            <View style={[styles.cameraPreview, styles.cameraPreviewOff]}>
              <Text style={styles.cameraNoPermission}>Sin permiso de cámara</Text>
            </View>
          </View>
        )}
      </View>

      {/* Preset Selector */}
      <TouchableOpacity
        style={styles.presetSelector}
        onPress={() => navigation.navigate('Presets')}>
        <Text style={styles.presetLabel}>preset:</Text>
        <Text style={styles.presetName}>{activePreset?.name || 'Sin preset'}</Text>
        <Text style={styles.presetArrow}>▼</Text>
      </TouchableOpacity>

      {/* Sensor Tiles */}
      <View style={styles.tilesContainer}>
        {/* Motion Tile */}
        <TouchableOpacity
          style={[styles.tile, motionEnabled && styles.tileActive]}
          onPress={toggleMotion}>
          <Text style={styles.tileIcon}>🎯</Text>
          <Text style={styles.tileTitle}>MOTION</Text>
          <Text style={[styles.tileStatus, motionEnabled ? styles.statusOn : styles.statusOff]}>
            {motionEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>

        {/* Camera Tile */}
        <TouchableOpacity
          style={[styles.tile, cameraEnabled && styles.tileActive]}
          onPress={() => {
            if (!hasCameraPermission) {
              Alert.alert(
                'Permiso de Cámara',
                'Se necesita permiso de cámara para usar esta función.',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Conceder', onPress: () => setCameraEnabled(!cameraEnabled) },
                ]
              );
            } else {
              setCameraEnabled(!cameraEnabled);
            }
          }}>
          <Text style={styles.tileIcon}>📷</Text>
          <Text style={styles.tileTitle}>CAM</Text>
          <Text style={[styles.tileStatus, cameraEnabled ? styles.statusOn : styles.statusOff]}>
            {cameraEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>

        {/* Audio Tile */}
        <TouchableOpacity
          style={[styles.tile, audioEnabled && styles.tileActive]}
          onPress={() => setAudioEnabled(!audioEnabled)}>
          <Text style={styles.tileIcon}>🎤</Text>
          <Text style={styles.tileTitle}>AUDIO</Text>
          <Text style={[styles.tileStatus, audioEnabled ? styles.statusOn : styles.statusOff]}>
            {audioEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Debug Info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          {connectionSettings.host}:{connectionSettings.port}
        </Text>
      </View>
    </SafeAreaView>

    <ConnectionDialog
      visible={showConnectionDialog}
      onClose={() => setShowConnectionDialog(false)}
      onConnect={handleConnect}
    />
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
    fontSize: 12,
    marginRight: 8,
  },
  connectionText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  liveDataLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 4,
  },
  motionDataContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 20,
  },
  motionAxis: {
    alignItems: 'center',
    minWidth: 60,
  },
  axisLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  axisValue: {
    color: colors.active,
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  audioContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  audioBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
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
  fftContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    height: 30,
    paddingHorizontal: 20,
  },
  fftBar: {
    flex: 1,
    marginHorizontal: 1,
    backgroundColor: colors.surface,
    borderRadius: 2,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  fftBarFill: {
    backgroundColor: colors.active,
    borderRadius: 2,
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
  cameraPreviewContainer: {
    width: '100%',
    marginTop: 16,
    alignItems: 'center',
  },
  cameraPreview: {
    width: 160,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  cameraPreviewInner: {
    width: '100%',
    height: '100%',
  },
  cameraPreviewOff: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraNoPermission: {
    color: colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
  },
  cameraStatusText: {
    color: colors.active,
    fontSize: 10,
    marginTop: 4,
  },
  cameraStatusTextOff: {
    color: colors.inactive,
    fontSize: 10,
    marginTop: 4,
  },
  debugInfo: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  debugText: {
    color: colors.textMuted,
    fontSize: 9,
    fontFamily: 'monospace',
  },
});

export default HomeScreen;
