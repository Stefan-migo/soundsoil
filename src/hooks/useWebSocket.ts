/**
 * SoundSoil Companion - useWebSocket Hook
 * Custom hook for WebSocket connection management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { webSocketService, ConnectionStatus, WebSocketConfig } from '../services/WebSocketService';
import { WebSocketMessage } from '../types';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  config?: Partial<WebSocketConfig>;
}

interface UseWebSocketReturn {
  status: ConnectionStatus;
  connect: () => Promise<void>;
  disconnect: () => void;
  send: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { autoConnect = false, config } = options;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  // Use ref to keep config stable
  const configRef = useRef(config);
  configRef.current = config;

  // Configure and optionally connect on mount
  useEffect(() => {
    if (configRef.current) {
      webSocketService.configure(configRef.current);
    }

    if (autoConnect) {
      webSocketService.connect().catch(() => {
        // Connection errors handled by status updates
      });
    }
  }, [autoConnect]);

  // Subscribe to status changes
  useEffect(() => {
    const unsubscribe = webSocketService.onStatusChange(setStatus);
    return unsubscribe;
  }, []);

  // Subscribe to messages
  useEffect(() => {
    const unsubscribe = webSocketService.onMessage((message) => {
      setLastMessage(message);
    });
    return unsubscribe;
  }, []);

  const connect = useCallback(async () => {
    if (configRef.current) {
      webSocketService.configure(configRef.current);
    }
    await webSocketService.connect();
  }, []);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    webSocketService.send(message);
  }, []);

  return {
    status,
    connect,
    disconnect,
    send,
    lastMessage,
  };
}

export default useWebSocket;
