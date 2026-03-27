# SoundSoil Companion

App móvil React Native para transmitir sensores, cámara y audio via WiFi hacia sistemas de arte generativo (SuperCollider, TouchDesigner).

## Características

- 🎯 **Motion Tracking**: Acelerómetro, giroscopio, magnetómetro
- 🎤 **Audio**: Level meter + FFT analysis  
- 📷 **Cámara**: Video streaming via WebSocket
- 📡 **WebSocket**: Transmisión en tiempo real
- 💾 **Presets**: Guardar/cargar configuraciones via QR
- 🌙 **Dark Theme**: Interfaz minimalista optimizada para performance

## Quick Start

```bash
# Instalar dependencias
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
cd android && ./gradlew assembleDebug
npx react-native run-android
```

## Documentación

- [SETUP-GUIDE.md](docs/SETUP-GUIDE.md) - Configuración iOS/Android
- [TESTING-GUIDE.md](docs/TESTING-GUIDE.md) - Guía de testing
- [BUILD-GUIDE.md](docs/BUILD-GUIDE.md) - Build y release APK

## Arquitectura

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐     ┌──────────────┐
│  Celular    │────►│  React Native    │────►│  WebSocket  │────►│  proxy.js    │
│  (móvil)    │     │  CLI + VisionCam │     │  (wifi)     │     │  (soundsoil) │
└─────────────┘     └──────────────────┘     └─────────────┘     └──────┬───────┘
                                                                        ▼
                                                                 ┌──────────────┐
                                                                 │  OSC          │
                                                                 │  SuperCollider│
                                                                 │  TouchDesig.  │
                                                                 └──────────────┘
```

## Datos Transmitidos

| Canal | Datos | Formato | Frecuencia |
|-------|-------|---------|------------|
| `motion` | accel{x,y,z}, gyro{x,y,z}, mag{x,y,z} | JSON → OSC | 33ms (30fps) |
| `camera` | frame JPEG base64 | binario | 10 fps |
| `audio` | level (RMS), fftBins[8] | JSON → OSC | 50ms |

## Tecnologias

- **React Native** 0.84 (CLI)
- **expo-sensors** - Accelerometer, Gyroscope, Magnetometer
- **expo-av** - Audio recording
- **react-native-vision-camera** - Camera access
- **@react-navigation** - Navigation
- **expo-modules-core** - Native module support

## Licencia

MIT
