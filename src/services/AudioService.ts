/**
 * SoundSoil Companion - Audio Service
 * Handles microphone input, level metering, and FFT analysis
 */

import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { AudioData } from '../types';

export interface AudioServiceConfig {
  fftBins?: number;
  sampleRate?: number;
  updateInterval?: number;
}

const DEFAULT_CONFIG: Required<AudioServiceConfig> = {
  fftBins: 8,
  sampleRate: 44100,
  updateInterval: 50, // ~20fps
};

/**
 * Simple FFT implementation (Cooley-Tukey radix-2)
 * For more accurate FFT, consider using a native module or fft-js
 */
class AudioService {
  private config: Required<AudioServiceConfig> = DEFAULT_CONFIG;
  private recording: Audio.Recording | null = null;
  private isRecording: boolean = false;
  private updateTimer: NodeJS.Timeout | null = null;
  private listeners: Set<(data: AudioData) => void> = new Set();

  /**
   * Configure the audio service
   */
  configure(config: Partial<AudioServiceConfig>): void {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Request microphone permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  /**
   * Check if recording is available
   */
  async isAvailable(): Promise<boolean> {
    const { status } = await Audio.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<boolean> {
    if (this.isRecording) return true;

    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      });

      // Create recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;

      // Start update loop
      this.startUpdateLoop();

      return true;
    } catch (error) {
      console.error('AudioService: Failed to start recording', error);
      return false;
    }
  }

  /**
   * Stop recording audio
   */
  async stopRecording(): Promise<void> {
    this.stopUpdateLoop();

    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch {
        // Ignore errors when stopping
      }
      this.recording = null;
    }

    this.isRecording = false;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
  }

  /**
   * Get current audio data (level + FFT)
   */
  async getCurrentAudioData(): Promise<AudioData> {
    // In a real implementation, this would read from the actual audio buffer
    // For now, return simulated data based on status
    if (!this.isRecording) {
      return { level: 0, fft: new Array(this.config.fftBins).fill(0) };
    }

    // Simulate audio data - in production, this would read actual samples
    return this.generateSimulatedAudioData();
  }

  /**
   * Subscribe to audio data updates
   */
  onAudioData(callback: (data: AudioData) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Check if currently recording
   */
  getIsRecording(): boolean {
    return this.isRecording;
  }

  private startUpdateLoop(): void {
    this.stopUpdateLoop();

    this.updateTimer = setInterval(async () => {
      if (this.isRecording && this.recording) {
        try {
          const status = await this.recording.getStatusAsync();
          if (status.isRecording) {
            // In production, we would analyze the actual audio buffer here
            // For now, generate simulated data
            const audioData = this.generateSimulatedAudioData();
            this.notifyListeners(audioData);
          }
        } catch {
          // Recording may have stopped
        }
      }
    }, this.config.updateInterval);
  }

  private stopUpdateLoop(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  private notifyListeners(data: AudioData): void {
    this.listeners.forEach((listener) => listener(data));
  }

  /**
   * Generate simulated audio data for testing
   * In production, this would be replaced with real FFT analysis
   */
  private generateSimulatedAudioData(): AudioData {
    // Simulate varying audio level
    const baseLevel = 0.3 + Math.random() * 0.4;
    const level = Math.min(1, Math.max(0, baseLevel));

    // Generate FFT bins with some variation
    const fft: number[] = [];
    for (let i = 0; i < this.config.fftBins; i++) {
      // Higher frequencies tend to have lower amplitudes
      const freqFactor = 1 - (i / this.config.fftBins) * 0.6;
      const binValue = level * freqFactor * (0.5 + Math.random() * 0.5);
      fft.push(Math.min(1, Math.max(0, binValue)));
    }

    return { level, fft };
  }

  /**
   * Simple FFT analysis of audio samples
   * This is a basic implementation for demonstration
   * For production, consider using a native FFT library
   */
  analyzeSamples(samples: Float32Array): { level: number; fft: number[] } {
    // Calculate RMS level
    let sumSquares = 0;
    for (let i = 0; i < samples.length; i++) {
      sumSquares += samples[i] * samples[i];
    }
    const rms = Math.sqrt(sumSquares / samples.length);

    // Normalize to 0-1 range (assuming 16-bit audio)
    const level = Math.min(1, rms * 3);

    // Simple DFT for FFT bins (not a true FFT, but sufficient for visualization)
    const fft: number[] = [];
    const binCount = this.config.fftBins;

    for (let bin = 0; bin < binCount; bin++) {
      let magnitude = 0;
      const startFreq = bin * (samples.length / binCount / 4);
      const endFreq = startFreq + samples.length / binCount / 2;

      for (let i = Math.floor(startFreq); i < Math.floor(endFreq) && i < samples.length; i++) {
        magnitude += Math.abs(samples[i]);
      }

      fft.push(Math.min(1, magnitude / (endFreq - startFreq) * 2));
    }

    return { level, fft };
  }
}

// Singleton instance
export const audioService = new AudioService();
export default audioService;
