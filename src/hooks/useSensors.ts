/**
 * SoundSoil Companion - useSensors Hook
 * Custom hook for accessing sensor data with React state
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { sensorService, SensorType } from '../services/SensorService';
import { MotionData } from '../types';

interface UseSensorsOptions {
  enabled?: boolean;
  interval?: number;
  sendToWebSocket?: boolean;
  webSocketService?: {
    sendMotion: (data: MotionData['accel'] & MotionData['gyro'] & MotionData['mag']) => void;
  } | null;
}

interface UseSensorsReturn {
  motionData: MotionData;
  isAvailable: {
    accelerometer: boolean;
    gyroscope: boolean;
    magnetometer: boolean;
  };
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  setInterval: (intervalMs: number) => void;
}

export function useSensors(options: UseSensorsOptions = {}): UseSensorsReturn {
  const {
    enabled = true,
    interval = 33,
    webSocketService: wsService,
  } = options;

  const [isEnabled, setIsEnabled] = useState(enabled);
  const [motionData, setMotionData] = useState<MotionData>({
    accel: { x: 0, y: 0, z: 0 },
    gyro: { x: 0, y: 0, z: 0 },
    mag: { x: 0, y: 0, z: 0 },
  });

  const [isAvailable, setIsAvailable] = useState({
    accelerometer: false,
    gyroscope: false,
    magnetometer: false,
  });

  const motionDataRef = useRef(motionData);

  // Keep ref updated for callbacks
  useEffect(() => {
    motionDataRef.current = motionData;
  }, [motionData]);

  // Check sensor availability
  useEffect(() => {
    const checkAvailability = async () => {
      const [accelerometer, gyroscope, magnetometer] = await Promise.all([
        sensorService.isAvailable('accelerometer'),
        sensorService.isAvailable('gyroscope'),
        sensorService.isAvailable('magnetometer'),
      ]);

      setIsAvailable({ accelerometer, gyroscope, magnetometer });
    };

    checkAvailability();
  }, []);

  // Handle sensor updates
  const handleAccelUpdate = useCallback((data: { x: number; y: number; z: number }) => {
    const updated = { ...motionDataRef.current, accel: data };
    setMotionData(updated);
    if (wsService) {
      wsService.sendMotion({
        accel: updated.accel,
        gyro: updated.gyro,
        mag: updated.mag,
      });
    }
  }, [wsService]);

  const handleGyroUpdate = useCallback((data: { x: number; y: number; z: number }) => {
    const updated = { ...motionDataRef.current, gyro: data };
    setMotionData(updated);
  }, []);

  const handleMagUpdate = useCallback((data: { x: number; y: number; z: number }) => {
    const updated = { ...motionDataRef.current, mag: data };
    setMotionData(updated);
  }, []);

  // Subscribe/unsubscribe based on enabled state
  useEffect(() => {
    if (!isEnabled) {
      sensorService.unsubscribeAll();
      return;
    }

    sensorService.setInterval(interval);

    sensorService.subscribe('accelerometer', handleAccelUpdate);
    sensorService.subscribe('gyroscope', handleGyroUpdate);
    sensorService.subscribe('magnetometer', handleMagUpdate);

    return () => {
      sensorService.unsubscribeAll();
    };
  }, [isEnabled, interval, handleAccelUpdate, handleGyroUpdate, handleMagUpdate]);

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
  }, []);

  const setIntervalMs = useCallback((intervalMs: number) => {
    sensorService.setInterval(intervalMs);
  }, []);

  return {
    motionData,
    isAvailable,
    enabled: isEnabled,
    setEnabled,
    setInterval: setIntervalMs,
  };
}

export default useSensors;
