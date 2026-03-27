/**
 * SoundSoil Companion - Camera Service
 * Handles VisionCamera initialization, permissions, and frame capture
 */

import { CameraDevice } from 'react-native-vision-camera';
import { CameraData } from '../types';

export interface CameraServiceConfig {
  fps?: number;
  quality?: 'low' | 'medium' | 'high';
}

const DEFAULT_CONFIG: Required<CameraServiceConfig> = {
  fps: 10,
  quality: 'medium',
};

class CameraService {
  private config: Required<CameraServiceConfig> = DEFAULT_CONFIG;
  private isActive: boolean = false;
  private listeners: Set<(data: CameraData) => void> = new Set();
  private lastFrameTime: number = 0;

  /**
   * Configure the camera service
   */
  configure(config: Partial<CameraServiceConfig>): void {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Process a captured frame from VisionCamera's frame processor
   */
  processFrame(base64: string): void {
    if (!this.isActive) return;

    const now = Date.now();
    const frameIntervalMs = 1000 / this.config.fps;

    // Throttle frames based on FPS setting
    if (now - this.lastFrameTime >= frameIntervalMs) {
      this.lastFrameTime = now;

      const cameraData: CameraData = { frame: base64 };
      this.notifyListeners(cameraData);
    }
  }

  /**
   * Subscribe to camera frame updates
   */
  onFrame(callback: (data: CameraData) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Set camera active state
   */
  setActive(active: boolean): void {
    this.isActive = active;
    if (!active) {
      this.lastFrameTime = 0;
    }
  }

  /**
   * Check if currently capturing
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Get current FPS setting
   */
  getFps(): number {
    return this.config.fps;
  }

  private notifyListeners(data: CameraData): void {
    this.listeners.forEach((listener) => listener(data));
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    this.isActive = false;
    this.listeners.clear();
    this.lastFrameTime = 0;
  }
}

// Singleton instance
export const cameraService = new CameraService();
export default cameraService;
