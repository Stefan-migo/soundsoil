/**
 * SoundSoil Companion - useConnection Hook
 * Access and manage connection settings
 */

import { useState, useEffect, useCallback } from 'react';
import { ConnectionSettings, connectionService } from '../services/ConnectionService';

interface UseConnectionReturn {
  settings: ConnectionSettings;
  updateSettings: (settings: ConnectionSettings) => Promise<void>;
  setHost: (host: string) => Promise<void>;
  setPort: (port: number) => Promise<void>;
  reset: () => Promise<void>;
}

export function useConnection(): UseConnectionReturn {
  const [settings, setSettings] = useState<ConnectionSettings>({
    host: '192.168.1.50',
    port: 8443,
  });

  useEffect(() => {
    // Load initial settings
    connectionService.getSettings().then(setSettings);

    // Subscribe to changes
    const unsubscribe = connectionService.onSettingsChange(setSettings);
    return unsubscribe;
  }, []);

  const updateSettings = useCallback(async (newSettings: ConnectionSettings) => {
    await connectionService.saveSettings(newSettings);
  }, []);

  const setHost = useCallback(async (host: string) => {
    await connectionService.setHost(host);
  }, []);

  const setPort = useCallback(async (port: number) => {
    await connectionService.setPort(port);
  }, []);

  const reset = useCallback(async () => {
    await connectionService.reset();
  }, []);

  return {
    settings,
    updateSettings,
    setHost,
    setPort,
    reset,
  };
}

export default useConnection;
