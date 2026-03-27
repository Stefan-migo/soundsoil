/**
 * SoundSoil Companion - useCamera Hook
 * Custom hook for camera control with VisionCamera
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Camera, useCameraDevice, useCameraPermission, Frame, CameraDevice } from 'react-native-vision-camera';
import { CameraData } from '../types';
import { cameraService } from '../services/CameraService';

interface UseCameraOptions {
  enabled?: boolean;
  fps?: number;
  device?: 'back' | 'front';
  webSocketService?: {
    send: (message: { type: 'camera'; data: CameraData; timestamp: number }) => void;
  } | null;
}

interface UseCameraReturn {
  cameraData: CameraData | null;
  isActive: boolean;
  hasPermission: boolean;
  enabled: boolean;
  isAvailable: boolean;
  device: CameraDevice | undefined;
  setEnabled: (enabled: boolean) => void;
  requestPermission: () => Promise<boolean>;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const {
    enabled = false,
    fps = 10,
    device = 'back',
    webSocketService: wsService,
  } = options;

  const [isEnabled, setIsEnabled] = useState(enabled);
  const [cameraData, setCameraData] = useState<CameraData | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const lastFrameTimeRef = useRef(0);
  const frameIntervalMs = 1000 / fps;

  // Get camera permission hook
  const { hasPermission: permissionGranted, requestPermission: requestCameraPermission } = useCameraPermission();
  
  // Get camera device
  const cameraDevice = useCameraDevice(device);

  // Sync permission state
  useEffect(() => {
    setHasPermission(permissionGranted);
  }, [permissionGranted]);

  // Check device availability
  useEffect(() => {
    setIsAvailable(cameraDevice !== null);
  }, [cameraDevice]);

  // Configure camera service
  useEffect(() => {
    cameraService.configure({ fps });
  }, [fps]);

  // Handle camera activation/deactivation
  useEffect(() => {
    if (isEnabled && hasPermission && cameraDevice) {
      setIsActive(true);
      cameraService.setActive(true);
    } else {
      setIsActive(false);
      cameraService.setActive(false);
      setCameraData(null);
    }
  }, [isEnabled, hasPermission, cameraDevice]);

  // Subscribe to camera service updates
  useEffect(() => {
    const unsubscribe = cameraService.onFrame((data) => {
      setCameraData(data);
    });

    return unsubscribe;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cameraService.cleanup();
    };
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await requestCameraPermission();
    setHasPermission(granted);
    return granted;
  }, [requestCameraPermission]);

  return {
    cameraData,
    isActive,
    hasPermission,
    enabled: isEnabled,
    isAvailable,
    device: cameraDevice,
    setEnabled,
    requestPermission,
  };
}

/**
 * Frame processor function to be used with VisionCamera's useFrameProcessor
 * This should be passed to the Camera component's frameProcessor prop
 */
export function frameProcessor(frame: Frame, fps: number = 10) {
  'worklet';
  
  const frameIntervalMs = 1000 / fps;
  const now = Date.now();
  
  // Use global reference to last frame time (worklet limitation)
  // In production, consider using a worklet-based timer
  if (global.lastCameraFrameTime === undefined) {
    global.lastCameraFrameTime = 0;
  }
  
  if (now - global.lastCameraFrameTime >= frameIntervalMs) {
    global.lastCameraFrameTime = now;
    
    // Convert frame to base64 for transmission
    // Note: In VisionCamera, we use frame.toString() to get base64
    try {
      const base64 = frame.toString();
      if (base64 && base64.length > 0) {
        // Post to main thread via a callback stored globally
        if (global.onCameraFrame) {
          global.onCameraFrame(base64);
        }
      }
    } catch {
      // Frame processing error - may happen if frame is released before processing
    }
  }
}

export default useCamera;
