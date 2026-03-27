/**
 * SoundSoil Companion - Preset Service
 * CRUD operations for presets using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Preset } from '../types';

const PRESETS_STORAGE_KEY = '@soundsoil_presets';
const ACTIVE_PRESET_KEY = '@soundsoil_active_preset';

// Default presets
const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'default-1',
    name: 'Sensores Only',
    motion: { enabled: true, sensors: ['accel', 'gyro'], interval: 33 },
    camera: { enabled: false },
    audio: { enabled: false },
    oscTarget: { host: '192.168.1.50', port: 8443 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'default-2',
    name: 'Performance',
    motion: { enabled: true, sensors: ['accel', 'gyro', 'mag'], interval: 33 },
    camera: { enabled: false },
    audio: { enabled: true, fftBins: 8, level: true },
    oscTarget: { host: '192.168.1.50', port: 8443 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'default-3',
    name: 'Instalación',
    motion: { enabled: true, sensors: ['accel', 'gyro', 'mag'], interval: 33 },
    camera: { enabled: false },
    audio: { enabled: true, fftBins: 8 },
    oscTarget: { host: '192.168.1.50', port: 8443 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'default-4',
    name: 'Full',
    motion: { enabled: true, sensors: ['accel', 'gyro', 'mag'], interval: 33 },
    camera: { enabled: true, fps: 10 },
    audio: { enabled: true, fftBins: 8 },
    oscTarget: { host: '192.168.1.50', port: 8443 },
    createdAt: new Date().toISOString(),
  },
];

class PresetService {
  private listeners: Set<(presets: Preset[]) => void> = new Set();
  private activePresetListeners: Set<(presetId: string | null) => void> = new Set();
  private cachedPresets: Preset[] | null = null;
  private cachedActivePresetId: string | null = null;

  /**
   * Initialize presets storage with defaults if empty
   */
  async initialize(): Promise<void> {
    try {
      const existing = await this.getAll();
      if (existing.length === 0) {
        await this.saveAll(DEFAULT_PRESETS);
        // Set first preset as active by default
        await this.setActivePresetId(DEFAULT_PRESETS[0].id);
      }
    } catch (error) {
      console.error('PresetService: Failed to initialize', error);
    }
  }

  /**
   * Get all presets
   */
  async getAll(): Promise<Preset[]> {
    if (this.cachedPresets !== null) {
      return this.cachedPresets;
    }

    try {
      const json = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
      if (json) {
        this.cachedPresets = JSON.parse(json);
        return this.cachedPresets!;
      }
      // If no presets, initialize with defaults
      await this.initialize();
      this.cachedPresets = DEFAULT_PRESETS;
      return this.cachedPresets;
    } catch (error) {
      console.error('PresetService: Failed to get presets', error);
      return [];
    }
  }

  /**
   * Get a single preset by ID
   */
  async getById(id: string): Promise<Preset | null> {
    const presets = await this.getAll();
    return presets.find((p) => p.id === id) || null;
  }

  /**
   * Create a new preset
   */
  async create(preset: Omit<Preset, 'id' | 'createdAt'>): Promise<Preset> {
    const newPreset: Preset = {
      ...preset,
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };

    const presets = await this.getAll();
    presets.push(newPreset);
    await this.saveAll(presets);
    this.notifyListeners();
    return newPreset;
  }

  /**
   * Update an existing preset
   */
  async update(id: string, updates: Partial<Omit<Preset, 'id' | 'createdAt'>>): Promise<Preset | null> {
    const presets = await this.getAll();
    const index = presets.findIndex((p) => p.id === id);

    if (index === -1) {
      return null;
    }

    presets[index] = { ...presets[index], ...updates };
    await this.saveAll(presets);
    this.notifyListeners();
    return presets[index];
  }

  /**
   * Delete a preset
   */
  async delete(id: string): Promise<boolean> {
    const presets = await this.getAll();
    const filtered = presets.filter((p) => p.id !== id);

    if (filtered.length === presets.length) {
      return false;
    }

    await this.saveAll(filtered);

    // If deleted preset was active, clear active preset
    if (this.cachedActivePresetId === id) {
      await this.setActivePresetId(null);
    }

    this.notifyListeners();
    return true;
  }

  /**
   * Duplicate a preset
   */
  async duplicate(id: string): Promise<Preset | null> {
    const preset = await this.getById(id);
    if (!preset) return null;

    return this.create({
      name: `${preset.name} (copia)`,
      motion: { ...preset.motion },
      camera: { ...preset.camera },
      audio: { ...preset.audio },
      oscTarget: { ...preset.oscTarget },
    });
  }

  /**
   * Get the active preset ID
   */
  async getActivePresetId(): Promise<string | null> {
    if (this.cachedActivePresetId !== null) {
      return this.cachedActivePresetId;
    }

    try {
      this.cachedActivePresetId = await AsyncStorage.getItem(ACTIVE_PRESET_KEY);
      return this.cachedActivePresetId;
    } catch (error) {
      console.error('PresetService: Failed to get active preset', error);
      return null;
    }
  }

  /**
   * Set the active preset ID
   */
  async setActivePresetId(id: string | null): Promise<void> {
    this.cachedActivePresetId = id;
    try {
      if (id) {
        await AsyncStorage.setItem(ACTIVE_PRESET_KEY, id);
      } else {
        await AsyncStorage.removeItem(ACTIVE_PRESET_KEY);
      }
    } catch (error) {
      console.error('PresetService: Failed to set active preset', error);
    }
    this.notifyActivePresetListeners();
  }

  /**
   * Get the active preset
   */
  async getActivePreset(): Promise<Preset | null> {
    const activeId = await this.getActivePresetId();
    if (!activeId) return null;
    return this.getById(activeId);
  }

  /**
   * Subscribe to preset changes
   */
  onPresetsChange(callback: (presets: Preset[]) => void): () => void {
    this.listeners.add(callback);
    // Immediately call with current data
    this.getAll().then(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Subscribe to active preset changes
   */
  onActivePresetChange(callback: (presetId: string | null) => void): () => void {
    this.activePresetListeners.add(callback);
    // Immediately call with current data
    this.getActivePresetId().then(callback);
    return () => this.activePresetListeners.delete(callback);
  }

  /**
   * Clear all presets and reset to defaults
   */
  async resetToDefaults(): Promise<void> {
    await this.saveAll(DEFAULT_PRESETS);
    await this.setActivePresetId(DEFAULT_PRESETS[0].id);
    this.notifyListeners();
  }

  /**
   * Export all presets as JSON string
   */
  async exportAll(): Promise<string> {
    const presets = await this.getAll();
    return JSON.stringify(presets, null, 2);
  }

  /**
   * Import presets from JSON string
   */
  async importFrom(json: string): Promise<number> {
    try {
      const imported = JSON.parse(json) as Preset[];
      if (!Array.isArray(imported)) {
        throw new Error('Invalid format');
      }

      // Validate and merge
      const existing = await this.getAll();
      const existingIds = new Set(existing.map((p) => p.id));

      let added = 0;
      for (const preset of imported) {
        if (preset.id && preset.name && !existingIds.has(preset.id)) {
          existing.push(preset);
          added++;
        }
      }

      await this.saveAll(existing);
      this.notifyListeners();
      return added;
    } catch (error) {
      console.error('PresetService: Import failed', error);
      throw error;
    }
  }

  // Private methods
  private async saveAll(presets: Preset[]): Promise<void> {
    this.cachedPresets = presets;
    await AsyncStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  }

  private notifyListeners(): void {
    const presets = this.cachedPresets || [];
    this.listeners.forEach((listener) => listener(presets));
  }

  private notifyActivePresetListeners(): void {
    this.activePresetListeners.forEach((listener) => listener(this.cachedActivePresetId));
  }
}

// Singleton instance
export const presetService = new PresetService();
export default presetService;
