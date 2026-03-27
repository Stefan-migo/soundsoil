/**
 * SoundSoil Companion - Sensor Service
 * Handles accelerometer, gyroscope, magnetometer, and deviceMotion
 */

import {
  Accelerometer,
  Gyroscope,
  Magnetometer,
  DeviceMotion,
} from 'expo-sensors';
import { MotionData } from '../types';

export type SensorType = 'accelerometer' | 'gyroscope' | 'magnetometer' | 'deviceMotion';

export interface SensorConfig {
  enabled: boolean;
  interval?: number; // in ms
}

interface SensorSubscription {
  remove: () => void;
}

class SensorService {
  private subscriptions: Map<SensorType, SensorSubscription> = new Map();
  private listeners: Map<SensorType, (data: any) => void> = new Map();
  private interval: number = 33; // ~30fps default

  /**
   * Set update interval for all sensors (in ms)
   */
  setInterval(intervalMs: number): void {
    this.interval = intervalMs;
    Accelerometer.setUpdateInterval(intervalMs);
    Gyroscope.setUpdateInterval(intervalMs);
    Magnetometer.setUpdateInterval(intervalMs);
    DeviceMotion.setUpdateInterval(intervalMs);
  }

  /**
   * Subscribe to a specific sensor
   */
  subscribe(
    sensorType: SensorType,
    callback: (data: any) => void
  ): void {
    // Remove existing subscription if any
    this.unsubscribe(sensorType);

    const sensor = this.getSensor(sensorType);
    if (!sensor) {
      console.warn(`SensorService: Unknown sensor type ${sensorType}`);
      return;
    }

    this.listeners.set(sensorType, callback);

    const subscription = sensor.addListener(callback);
    this.subscriptions.set(sensorType, subscription);
    
    // Set interval
    sensor.setUpdateInterval(this.interval);
  }

  /**
   * Unsubscribe from a specific sensor
   */
  unsubscribe(sensorType: SensorType): void {
    const subscription = this.subscriptions.get(sensorType);
    if (subscription) {
      subscription.remove();
      this.subscriptions.delete(sensorType);
      this.listeners.delete(sensorType);
    }
  }

  /**
   * Unsubscribe from all sensors
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription) => subscription.remove());
    this.subscriptions.clear();
    this.listeners.clear();
  }

  /**
   * Check if a sensor is available
   */
  async isAvailable(sensorType: SensorType): Promise<boolean> {
    const sensor = this.getSensor(sensorType);
    if (!sensor) return false;
    
    try {
      const result = await sensor.isAvailableAsync();
      return result === true;
    } catch {
      return false;
    }
  }

  /**
   * Get current motion data from all sensors
   */
  async getCurrentMotionData(): Promise<MotionData> {
    return new Promise((resolve) => {
      const motionData: MotionData = {
        accel: { x: 0, y: 0, z: 0 },
        gyro: { x: 0, y: 0, z: 0 },
        mag: { x: 0, y: 0, z: 0 },
      };

      let resolved = false;

      const resolveIfComplete = () => {
        if (!resolved) {
          resolved = true;
          resolve(motionData);
        }
      };

      // Timeout fallback after 100ms
      setTimeout(resolveIfComplete, 100);

      // Subscribe briefly to get current values
      const accelSub = Accelerometer.addListener((data) => {
        motionData.accel = { x: data.x, y: data.y, z: data.z };
        accelSub.remove();
        resolveIfComplete();
      });

      const gyroSub = Gyroscope.addListener((data) => {
        motionData.gyro = { x: data.x, y: data.y, z: data.z };
        gyroSub.remove();
        resolveIfComplete();
      });

      const magSub = Magnetometer.addListener((data) => {
        motionData.mag = { x: data.x, y: data.y, z: data.z };
        magSub.remove();
        resolveIfComplete();
      });

      // Trigger one reading
      Accelerometer.setUpdateInterval(16);
      Gyroscope.setUpdateInterval(16);
      Magnetometer.setUpdateInterval(16);
    });
  }

  private getSensor(sensorType: SensorType) {
    switch (sensorType) {
      case 'accelerometer':
        return Accelerometer;
      case 'gyroscope':
        return Gyroscope;
      case 'magnetometer':
        return Magnetometer;
      case 'deviceMotion':
        return DeviceMotion;
      default:
        return null;
    }
  }
}

// Singleton instance
export const sensorService = new SensorService();
export default sensorService;
