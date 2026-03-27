# SoundSoil Companion - Guía de Configuración

## Requisitos

### Comunes
- Node.js 18+ 
- npm 9+ o yarn
- Git

### iOS
- macOS (necesario para build de iOS)
- Xcode 15+
- CocoaPods: `sudo gem install cocoapods`
- Cuenta de desarrollador Apple (para running en device físico)

### Android
- Android Studio (con SDK)
- Java 17+ (JDK)
- Android SDK API 24+ (Android 7.0+)

---

## Instalación del Proyecto

```bash
# Clonar el repositorio
git clone https://github.com/Stefan-migo/soundsoil.git
cd soundsoil

# Entrar a la carpeta del proyecto
cd SoundSoilCompanion

# Instalar dependencias
npm install
```

---

## Configuración iOS

### 1. Instalar pods

```bash
cd ios
pod install
cd ..
```

### 2. Configurar permisos (Info.plist)

Agregar en `ios/SoundSoilCompanion/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>SoundSoil necesita acceso a la cámara para transmitir video.</string>

<key>NSMicrophoneUsageDescription</key>
<string>SoundSoil necesita acceso al micrófono para transmitir audio.</string>

<key>NSMotionUsageDescription</key>
<string>SoundSoil usa sensores de movimiento para tracking gestual.</string>
```

### 3. Abrir en Xcode

```bash
open ios/SoundSoilCompanion.xcworkspace
```

### 4. Run en Simulator o Device

**En Xcode:**
1. Seleccionar target (iPhone Simulator o device conectado)
2. Click en Play (▶️)

**O desde terminal:**
```bash
npx react-native run-ios
```

---

## Configuración Android

### 1. Configurar permisos (AndroidManifest.xml)

En `android/app/src/main/AndroidManifest.xml`, dentro de `<manifest>`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.HIGH_SAMPLING_RATE_SENSORS" />
```

### 2. Build Debug APK

```bash
# Build debug APK
cd android
./gradlew assembleDebug

# El APK estará en:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### 3. Instalar en device

```bash
# Con dispositivo conectado via USB (debugging USB habilitado)
adb install android/app/build/outputs/apk/debug/app-debug.apk

# O copiar el APK al dispositivo e instalar manualmente
```

---

## Configuración del Servidor (soundsoil/proxy.js)

El proxy WebSocket→OSC ya existe en el proyecto padre:

```bash
cd ../soundsoil
npm install
node proxy.js
```

Por defecto, el proxy escucha en:
- WebSocket: `ws://0.0.0.0:8443`
- OSC output: `osc://localhost:8443`

---

## Permisos Necesarios

| Permiso | iOS | Android | Uso |
|---------|-----|---------|-----|
| Cámara | NSCameraUsageDescription | CAMERA | Transmitir video |
| Micrófono | NSMicrophoneUsageDescription | RECORD_AUDIO | Transmitir audio |
| Sensores | NSMotionUsageDescription | HIGH_SAMPLING_RATE_SENSORS | Motion tracking |
| Red | - | INTERNET, ACCESS_NETWORK_STATE | Conexión WebSocket |

---

## Solución de Problemas

### Error: "Unable to resolve module"
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

### Error: "CocoaPods could not find compatible versions"
```bash
cd ios
pod deintegrate
pod install --repo-update
```

### Android: "SDK location not found"
```bash
# Crear archivo android/local.properties con:
echo "sdk.dir=/Users/tu-usuario/Library/Android/sdk" > android/local.properties
```

### iOS: "The workspace does not have a scheme named..."
```bash
cd ios
xcodebuild -workspace SoundSoilCompanion.xcworkspace -list
```

### Error de permisos en Android 12+
```xml
<!-- En AndroidManifest.xml -->
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```
