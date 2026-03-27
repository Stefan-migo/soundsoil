/**
 * SoundSoil Companion - Connection Dialog Component
 * Modal dialog for configuring server connection
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../theme/colors';
import { useConnection } from '../hooks/useConnection';

interface ConnectionDialogProps {
  visible: boolean;
  onClose: () => void;
  onConnect: (host: string, port: number) => void;
}

const ConnectionDialog: React.FC<ConnectionDialogProps> = ({
  visible,
  onClose,
  onConnect,
}) => {
  const { settings, updateSettings } = useConnection();

  const [host, setHost] = useState(settings.host);
  const [port, setPort] = useState(String(settings.port));

  // Sync with settings when dialog opens
  useEffect(() => {
    if (visible) {
      setHost(settings.host);
      setPort(String(settings.port));
    }
  }, [visible, settings]);

  const handleSaveAndConnect = async () => {
    const trimmedHost = host.trim();
    const portNum = parseInt(port, 10);

    if (!trimmedHost) {
      return;
    }

    if (isNaN(portNum) || portNum <= 0 || portNum > 65535) {
      return;
    }

    // Save settings
    await updateSettings({ host: trimmedHost, port: portNum });

    // Connect
    onConnect(trimmedHost, portNum);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.dialog}>
          <Text style={styles.title}>CONECTAR A SERVIDOR</Text>

          <Text style={styles.label}>IP del proxy:</Text>
          <TextInput
            style={styles.input}
            value={host}
            onChangeText={setHost}
            placeholder="192.168.1.50"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Puerto:</Text>
          <TextInput
            style={styles.input}
            value={port}
            onChangeText={setPort}
            placeholder="8443"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.connectButton} onPress={handleSaveAndConnect}>
              <Text style={styles.connectButtonText}>Conectar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: '85%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  connectButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: colors.active,
    marginLeft: 8,
    alignItems: 'center',
  },
  connectButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ConnectionDialog;
