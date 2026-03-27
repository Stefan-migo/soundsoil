/**
 * SoundSoil Companion - Connection Service
 * Persists server connection settings (host, port)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CONNECTION_HOST_KEY = '@soundsoil_connection_host';
const CONNECTION_PORT_KEY = '@soundsoil_connection_port';

export interface ConnectionSettings {
  host: string;
  port: number;
}

const DEFAULT_SETTINGS: ConnectionSettings = {
  host: '192.168.1.50',
  port: 8443,
};

class ConnectionService {
  private listeners: Set<(settings: ConnectionSettings) => void> = new Set();
  private cachedSettings: ConnectionSettings | null = null;

  /**
   * Get saved connection settings
   */
  async getSettings(): Promise<ConnectionSettings> {
    if (this.cachedSettings !== null) {
      return this.cachedSettings;
    }

    try {
      const [host, port] = await Promise.all([
        AsyncStorage.getItem(CONNECTION_HOST_KEY),
        AsyncStorage.getItem(CONNECTION_PORT_KEY),
      ]);

      this.cachedSettings = {
        host: host || DEFAULT_SETTINGS.host,
        port: port ? parseInt(port, 10) : DEFAULT_SETTINGS.port,
      };

      return this.cachedSettings;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save connection settings
   */
  async saveSettings(settings: ConnectionSettings): Promise<void> {
    this.cachedSettings = settings;

    try {
      await Promise.all([
        AsyncStorage.setItem(CONNECTION_HOST_KEY, settings.host),
        AsyncStorage.setItem(CONNECTION_PORT_KEY, String(settings.port)),
      ]);
      this.notifyListeners();
    } catch (error) {
      console.error('ConnectionService: Failed to save settings', error);
    }
  }

  /**
   * Update just the host
   */
  async setHost(host: string): Promise<void> {
    const current = await this.getSettings();
    await this.saveSettings({ ...current, host });
  }

  /**
   * Update just the port
   */
  async setPort(port: number): Promise<void> {
    const current = await this.getSettings();
    await this.saveSettings({ ...current, port });
  }

  /**
   * Reset to defaults
   */
  async reset(): Promise<void> {
    await this.saveSettings(DEFAULT_SETTINGS);
  }

  /**
   * Subscribe to settings changes
   */
  onSettingsChange(callback: (settings: ConnectionSettings) => void): () => void {
    this.listeners.add(callback);
    this.getSettings().then(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const settings = this.cachedSettings || DEFAULT_SETTINGS;
    this.listeners.forEach((listener) => listener(settings));
  }
}

// Singleton
export const connectionService = new ConnectionService();
export default connectionService;
