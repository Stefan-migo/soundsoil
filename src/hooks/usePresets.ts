/**
 * SoundSoil Companion - usePresets Hook
 * Custom hook for preset management
 */

import { useState, useEffect, useCallback } from 'react';
import { Preset } from '../types';
import { presetService } from '../services/PresetService';

interface UsePresetsReturn {
  presets: Preset[];
  activePreset: Preset | null;
  activePresetId: string | null;
  isLoading: boolean;
  setActivePreset: (id: string) => Promise<void>;
  createPreset: (preset: Omit<Preset, 'id' | 'createdAt'>) => Promise<Preset>;
  updatePreset: (id: string, updates: Partial<Preset>) => Promise<Preset | null>;
  deletePreset: (id: string) => Promise<boolean>;
  duplicatePreset: (id: string) => Promise<Preset | null>;
  refreshPresets: () => Promise<void>;
}

export function usePresets(): UsePresetsReturn {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load presets and active preset on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await presetService.initialize();
      const [allPresets, activeId] = await Promise.all([
        presetService.getAll(),
        presetService.getActivePresetId(),
      ]);
      setPresets(allPresets);
      setActivePresetId(activeId);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Subscribe to preset changes
  useEffect(() => {
    const unsubscribe = presetService.onPresetsChange((newPresets) => {
      setPresets(newPresets);
    });
    return unsubscribe;
  }, []);

  // Subscribe to active preset changes
  useEffect(() => {
    const unsubscribe = presetService.onActivePresetChange((id) => {
      setActivePresetId(id);
    });
    return unsubscribe;
  }, []);

  // Get active preset
  const activePreset = presets.find((p) => p.id === activePresetId) || null;

  // Set active preset
  const setActivePreset = useCallback(async (id: string) => {
    await presetService.setActivePresetId(id);
  }, []);

  // Create preset
  const createPreset = useCallback(
    async (preset: Omit<Preset, 'id' | 'createdAt'>) => {
      return presetService.create(preset);
    },
    []
  );

  // Update preset
  const updatePreset = useCallback(
    async (id: string, updates: Partial<Omit<Preset, 'id' | 'createdAt'>>) => {
      return presetService.update(id, updates);
    },
    []
  );

  // Delete preset
  const deletePreset = useCallback(async (id: string) => {
    return presetService.delete(id);
  }, []);

  // Duplicate preset
  const duplicatePreset = useCallback(async (id: string) => {
    return presetService.duplicate(id);
  }, []);

  // Refresh presets
  const refreshPresets = useCallback(async () => {
    const allPresets = await presetService.getAll();
    setPresets(allPresets);
  }, []);

  return {
    presets,
    activePreset,
    activePresetId,
    isLoading,
    setActivePreset,
    createPreset,
    updatePreset,
    deletePreset,
    duplicatePreset,
    refreshPresets,
  };
}

export default usePresets;
