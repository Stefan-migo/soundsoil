/**
 * SoundSoil Companion - QR Utilities
 * Export/Import presets as QR codes (base64 <-> JSON)
 */

import { Preset } from '../types';

const QR_PREFIX = 'SOILSOUND:';
const QR_VERSION = '1';

/**
 * Encode a preset to QR-friendly string
 */
export function encodePresetForQR(preset: Preset): string {
  const payload = {
    v: QR_VERSION,
    p: preset,
  };
  const json = JSON.stringify(payload);
  // Use base64 encoding for QR compatibility
  const base64 = btoa(encodeURIComponent(json));
  return `${QR_PREFIX}${base64}`;
}

/**
 * Decode a QR string back to a preset
 */
export function decodePresetFromQR(qrString: string): Preset | null {
  try {
    // Check prefix
    if (!qrString.startsWith(QR_PREFIX)) {
      console.error('QRDecode: Invalid prefix');
      return null;
    }

    // Extract base64 part
    const base64 = qrString.substring(QR_PREFIX.length);
    const json = decodeURIComponent(atob(base64));
    const payload = JSON.parse(json);

    // Validate version
    if (payload.v !== QR_VERSION) {
      console.warn('QRDecode: Version mismatch', payload.v);
    }

    // Validate and return preset
    const preset = payload.p as Preset;
    if (!preset.id || !preset.name) {
      console.error('QRDecode: Invalid preset data');
      return null;
    }

    return preset;
  } catch (error) {
    console.error('QRDecode: Failed to decode', error);
    return null;
  }
}

/**
 * Encode multiple presets for QR
 */
export function encodePresetsForQR(presets: Preset[]): string {
  const payload = {
    v: QR_VERSION,
    presets: presets,
  };
  const json = JSON.stringify(payload);
  const base64 = btoa(encodeURIComponent(json));
  return `${QR_PREFIX}LIST:${base64}`;
}

/**
 * Decode multiple presets from QR
 */
export function decodePresetsFromQR(qrString: string): Preset[] | null {
  try {
    if (!qrString.startsWith(QR_PREFIX)) {
      return null;
    }

    const base64 = qrString.substring(QR_PREFIX.length);
    const json = decodeURIComponent(atob(base64));
    const payload = JSON.parse(json);

    if (payload.presets && Array.isArray(payload.presets)) {
      return payload.presets as Preset[];
    }

    return null;
  } catch (error) {
    console.error('QRDecode: Failed to decode presets', error);
    return null;
  }
}

/**
 * Validate a preset object (basic validation)
 */
export function validatePreset(preset: unknown): preset is Preset {
  if (!preset || typeof preset !== 'object') return false;
  const p = preset as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.motion === 'object' &&
    typeof p.camera === 'object' &&
    typeof p.audio === 'object' &&
    typeof p.oscTarget === 'object'
  );
}
