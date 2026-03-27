# SoundSoil Companion - Build & Release Guide

## Generación de APK (Android)

### Prerrequisitos

1. **Java JDK 17+**
   ```bash
   # macOS con Homebrew
   brew install openjdk@17
   
   # Ubuntu/Debian
   sudo apt install openjdk-17-jdk
   
   # Windows: descargar de https://adoptium.net/
   ```

2. **Android Studio** con:
   - Android SDK API 33+
   - Android SDK Build-Tools

3. **Variables de entorno:**
   ```bash
   export JAVA_HOME=/path/to/jdk-17
   export ANDROID_HOME=/path/to/android/sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin
   ```

### Build Commands

```bash
cd SoundSoilCompanion

# Debug APK (más rápido de construir)
cd android
./gradlew assembleDebug

# Release APK (optimizado, necesita signing)
./gradlew assembleRelease
```

### Ubicación del APK

```
android/app/build/outputs/apk/debug/app-debug.apk
android/app/build/outputs/apk/release/app-release.apk
```

---

## Compartiendo APK via QR

### Método 1: Google Drive

1. Subir el APK a Google Drive
2. Compartir con "Cualquier persona con el link"
3. Copiar el link compartible
4. Generar QR con cualquier generador online

**Link ejemplo:**
```
https://drive.google.com/file/d/1ABC123xyz/view?usp=sharing
```

**Generador QR:** https://www.qr-code-generator.com/

### Método 2: GitHub Releases

```bash
# Crear tag y release
git tag -a v1.0.0 -m "Primera versión release"
git push origin v1.0.0

# Build release APK
./gradlew assembleRelease

# Crear release en GitHub
gh release create v1.0.0 \
  --title "SoundSoil Companion v1.0.0" \
  --notes "Primera versión de SoundSoil Companion" \
  ./app/build/outputs/apk/release/app-release-unsigned.apk
```

### Método 3: Firebase App Distribution

1. Instalar Firebase CLI: `npm install -g firebase-tools`
2. Crear proyecto en Firebase Console
3. Configurar App Distribution
4. Subir APK y crear grupo de testers

### Método 4: Transfer.sh (temporal)

```bash
# Subir APK
curl -F "file=@app/build/outputs/apk/release/app-release.apk" https://transfer.sh/soundsoil.apk

# Output: https://transfer.sh/abc123/soundsoil.apk
# Generar QR del link
```

---

## Build para iOS

### Desde macOS con Xcode

1. Abrir `ios/SoundSoilCompanion.xcworkspace` en Xcode
2. Seleccionar "Any iOS Device" o simulator
3. Product > Archive
4. Distribution > Ad Hoc o Development

### Distribución TestFlight

1. Xcode > Product > Archive
2. Organizer > Distribute App
3. Select App Store Connect
4. Upload

---

## QR para Descargar APK

Una vez tengas tu APK publicado, usa este template:

```
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║     📱 SoundSoil Companion v1.0.0                        ║
║                                                          ║
║     Escanea para descargar:                              ║
║                                                          ║
║         [AQUI VA TU QR]                                  ║
║                                                          ║
║     O descarga de:                                       ║
║     https://github.com/Stefan-migo/soundsoil/releases    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

**Generadores de QR:**
- https://www.qr-code-generator.com/
- https://qrcode.me/
- https://www.the-qrcode-generator.com/

---

## Verificación Post-Build

Después de instalar el APK:

```bash
# Verificar que se instaló
adb shell pm list packages | grep soundsoil

# Ver logs
adb logcat | grep -i soundsoil
```
