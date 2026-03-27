/**
 * SoundSoil Companion - useAudio Hook
 * Custom hook for audio input with level meter and FFT
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AudioData } from '../types';
import { audioService, AudioServiceConfig } from '../services/AudioService';

interface UseAudioOptions {
  enabled?: boolean;
  fftBins?: number;
  sendToWebSocket?: boolean;
  webSocketService?: {
    send: (message: { type: 'audio'; data: AudioData; timestamp: number }) => void;
  } | null;
}

interface UseAudioReturn {
  audioData: AudioData;
  isRecording: boolean;
  hasPermission: boolean;
  enabled: boolean;
  isAvailable: boolean;
  setEnabled: (enabled: boolean) => void;
  requestPermission: () => Promise<boolean>;
}

export function useAudio(options: UseAudioOptions = {}): UseAudioReturn {
  const {
    enabled = true,
    fftBins = 8,
    webSocketService: wsService,
  } = options;

  const [isEnabled, setIsEnabled] = useState(enabled);
  const [audioData, setAudioData] = useState<AudioData>({ level: 0, fft: new Array(fftBins).fill(0) });
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const audioDataRef = useRef(audioData);
  useEffect(() => {
    audioDataRef.current = audioData;
  }, [audioData]);

  // Configure audio service
  useEffect(() => {
    audioService.configure({ fftBins });
  }, [fftBins]);

  // Subscribe to audio data updates
  useEffect(() => {
    const unsubscribe = audioService.onAudioData((data) => {
      setAudioData(data);
      if (wsService && isEnabled) {
        wsService.send({
          type: 'audio',
          data,
          timestamp: Date.now(),
        });
      }
    });
    return unsubscribe;
  }, [wsService, isEnabled]);

  // Handle enabled/disabled state
  useEffect(() => {
    const manageRecording = async () => {
      if (isEnabled && hasPermission) {
        if (!isRecording) {
          const started = await audioService.startRecording();
          setIsRecording(started);
        }
      } else {
        if (isRecording) {
          await audioService.stopRecording();
          setIsRecording(false);
          setAudioData({ level: 0, fft: new Array(fftBins).fill(0) });
        }
      }
    };

    manageRecording();
  }, [isEnabled, hasPermission, isRecording, fftBins]);

  // Check permission and availability on mount
  useEffect(() => {
    const checkPermissions = async () => {
      const granted = await audioService.requestPermissions();
      setHasPermission(granted);
      const available = await audioService.isAvailable();
      setIsAvailable(available);
    };

    checkPermissions();
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await audioService.requestPermissions();
    setHasPermission(granted);
    return granted;
  }, []);

  return {
    audioData,
    isRecording,
    hasPermission,
    enabled: isEnabled,
    isAvailable,
    setEnabled,
    requestPermission,
  };
}

export default useAudio;
