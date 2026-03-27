/**
 * SoundSoil Companion - Color Theme
 * Minimalist dark theme optimized for performance/artistic contexts
 */

export const colors = {
  // Base colors
  background: '#000000',
  surface: '#111111',
  surfaceLight: '#1A1A1A',

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#888888',
  textMuted: '#555555',

  // Status colors
  active: '#00FF00',
  inactive: '#FF0000',
  warning: '#FFAA00',
  connected: '#00FF00',
  disconnected: '#FF0000',

  // Tile colors
  tileActive: '#00FF00',
  tileInactive: '#333333',
  tileBorder: '#333333',

  // UI elements
  border: '#333333',
  divider: '#222222',

  // Button colors
  buttonPrimary: '#00FF00',
  buttonPrimaryText: '#000000',
  buttonSecondary: '#333333',
  buttonSecondaryText: '#FFFFFF',

  // Slider/Input
  sliderTrack: '#333333',
  sliderThumb: '#00FF00',

  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.8)',
  modalBackground: 'rgba(0, 0, 0, 0.9)',
} as const;

export type Colors = typeof colors;
