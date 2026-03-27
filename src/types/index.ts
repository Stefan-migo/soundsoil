/**
 * SoundSoil Companion - Type Definitions
 */

export interface MotionData {
  accel: { x: number; y: number; z: number };
  gyro: { x: number; y: number; z: number };
  mag: { x: number; y: number; z: number };
}

export interface AudioData {
  level: number;
  fft: number[];
}

export interface CameraData {
  frame: string; // base64
}

export interface WebSocketMessage {
  type: 'motion' | 'audio' | 'camera' | 'meta';
  data: MotionData | AudioData | CameraData | MetaData;
  timestamp: number;
}

export interface MetaData {
  deviceId: string;
  preset: string;
  battery: number;
  connectionStatus: 'connected' | 'disconnected';
}

export interface SensorConfig {
  enabled: boolean;
  sensors?: ('accel' | 'gyro' | 'mag')[];
  interval?: number;
}

export interface CameraConfig {
  enabled: boolean;
  fps?: number;
}

export interface AudioConfig {
  enabled: boolean;
  fftBins?: number;
  level?: boolean;
}

export interface OscTarget {
  host: string;
  port: number;
}

export interface Preset {
  id: string;
  name: string;
  motion: SensorConfig;
  camera: CameraConfig;
  audio: AudioConfig;
  oscTarget: OscTarget;
  createdAt: string;
}

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  Presets: undefined;
  PresetEditor: { presetId?: string };
  QrScanner: undefined;
  QrDisplay: { presetId: string };
};
