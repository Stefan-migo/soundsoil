# SoundSoil Companion - Guía de Testing

## Testing Rápido (Sin Hardware)

### 1. Preview del Proyecto

Puedes ver el código y verificar que el proyecto compila sin errores:

```bash
cd SoundSoilCompanion

# Verificar TypeScript sin errores
npx tsc --noEmit

# O verificar el build de Android (sin device)
cd android
./gradlew assembleDebug --dry-run
```

### 2. Simular Pantallas

Las pantallas funcionan sin sensores reales:
- **HomeScreen**: Muestra datos simulados de motion/audio
- **Settings**: Configuración de conexión
- **Presets**: CRUD de presets (guardados en AsyncStorage)

---

## Testing Manual

### Requisitos
- Device físico (iOS o Android) - los sensores no funcionan bien en simulator
- Computadora en la misma red WiFi que el device
- Servidor proxy.js corriendo

### Pasos

#### 1. Iniciar el Proxy

```bash
# En la carpeta soundsoil del proyecto padre
cd ../soundsoil
node proxy.js
```

Deberías ver:
```
WebSocket proxy listening on ws://0.0.0.0:8443
OSC target: osc://localhost:8443
```

#### 2. Instalar la App

**Android:**
```bash
# Device conectado via USB
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

**iOS:**
```bash
npx react-native run-ios
```

#### 3. Conectar al Proxy

1. Abrir la app SoundSoil
2. Tocar el botón 📡 (arriba a la derecha)
3. Ingresar la IP de la computadora donde corre proxy.js
4. Tocar "Conectar"

**Para encontrar tu IP:**

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig | findstr /i "IPv4"
```

#### 4. Verificar Sensores

1. **Motion**: Mover el device, ver los valores X/Y/Z cambiar
2. **Audio**: Tocar el tile de AUDIO, hablar al micrófono
3. **Camera**: Tocar el tile de CAM, apuntar a algo

#### 5. Verificar Transmisión WebSocket

En la terminal donde corre proxy.js, deberías ver mensajes incoming:
```
Received motion: {"type":"motion","data":{...},"timestamp":...}
Received audio: {"type":"audio","data":{...},"timestamp":...}
```

---

## Testing con SuperCollider

El proxy.js envía mensajes OSC. Puedes recibir en SuperCollider:

```supercollider
// Receptor OSC
n = NetAddr("127.0.0.1", 57121); // SuperCollider default port

// O usando OSCFunc
f = { |msg, time, addr|
    "Motion: ".post;
    msg.postln;
};

o = OSCFunc(f, '/motion', nil, 8443);
```

---

## Testing de Presets

### Crear un Preset
1. Ir a Settings > Presets > + Nuevo
2. Configurar nombre y sensores
3. Guardar

### Exportar via QR
1. Ir a Settings > Presets
2. Tocar ··· en un preset
3. Seleccionar "Compartir QR"
4. Escanear con otro dispositivo

### Importar via QR
1. Ir a Settings > Presets > Escanear QR
2. Ingresar código QR manualmente o escanear

---

## Estructura de Mensajes WebSocket

### Motion
```json
{
  "type": "motion",
  "data": {
    "accel": { "x": 0.12, "y": 9.81, "z": 0.34 },
    "gyro": { "x": 0.01, "y": -0.02, "z": 0.00 },
    "mag": { "x": 25.4, "y": -12.3, "z": 45.1 }
  },
  "timestamp": 1711471200000
}
```

### Audio
```json
{
  "type": "audio",
  "data": {
    "level": 0.67,
    "fft": [0.12, 0.34, 0.23, 0.45, 0.78, 0.34, 0.12, 0.09]
  },
  "timestamp": 1711471200050
}
```

### Camera
```json
{
  "type": "camera",
  "data": { "frame": "<base64 JPEG>" },
  "timestamp": 1711471200100
}
```

---

## QR para Descargar APK (Android)

### Opción 1: Firebase App Distribution

1. Subir APK a Firebase Console
2. Crear link de invitación
3. Generar QR del link

### Opción 2: GitHub Releases

```bash
# Crear release con el APK
cd android
./gradlew assembleRelease

# Subir a GitHub Releases
gh release create v1.0.0 --title "SoundSoil Companion v1.0.0" \
  --notes "Primera versión de SoundSoil Companion" \
  --attach app/build/outputs/apk/release/app-release.apk
```

### Opción 3: Drive/Cloud Storage

1. Subir APK a Google Drive
2. Crear link compartible
3. Generar QR con el link

**Ejemplo de QR:**
```
https://drive.google.com/file/d/TU_FILE_ID/view
```

---

## Checklist de Testing

- [ ] App se instala sin errores
- [ ] Pantalla Home carga correctamente
- [ ] Sensores de motion muestran datos
- [ ] Toggle de motion enciende/apaga sensores
- [ ] Audio graba y muestra level meter
- [ ] FFT bars se actualizan
- [ ] Presets se crean/guardan/borran
- [ ] QR export funciona
- [ ] QR import funciona
- [ ] Connection dialog guarda IP/puerto
- [ ] WebSocket se conecta al proxy
- [ ] Mensajes se envían via WebSocket
- [ ] Proxy reenvía mensajes OSC
