/**
 * SoundSoil Companion - WebSocket Service
 * Handles connection to proxy.js server, reconnection, and message sending
 */

import { WebSocketMessage } from '../types';

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface WebSocketConfig {
  host: string;
  port: number;
  path?: string;
  heartbeatInterval?: number;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

const DEFAULT_CONFIG: Required<WebSocketConfig> = {
  host: 'localhost',
  port: 8443,
  path: '/',
  heartbeatInterval: 5000,
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
};

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig> = DEFAULT_CONFIG;
  private status: ConnectionStatus = 'disconnected';
  private reconnectAttempts: number = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private listeners: Set<(status: ConnectionStatus) => void> = new Set();
  private messageListeners: Set<(message: WebSocketMessage) => void> = new Set();

  /**
   * Configure the WebSocket connection
   */
  configure(config: Partial<WebSocketConfig>): void {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Get full WebSocket URL
   */
  private getUrl(): string {
    const { host, port, path } = this.config;
    return `ws://${host}:${port}${path}`;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.setStatus('connecting');

      try {
        this.ws = new WebSocket(this.getUrl());

        this.ws.onopen = () => {
          console.log('WebSocketService: Connected');
          this.setStatus('connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          resolve();
        };

        this.ws.onclose = (event) => {
          console.log('WebSocketService: Disconnected', event.code, event.reason);
          this.setStatus('disconnected');
          this.stopHeartbeat();
          this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocketService: Error', error);
          this.setStatus('error');
          reject(error);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
      } catch (error) {
        this.setStatus('error');
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.stopHeartbeat();
    this.cancelReconnect();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setStatus('disconnected');
  }

  /**
   * Send a message through the WebSocket
   */
  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for later
      this.messageQueue.push(message);
    }
  }

  /**
   * Send motion data
   */
  sendMotion(data: {
    accel: { x: number; y: number; z: number };
    gyro: { x: number; y: number; z: number };
    mag: { x: number; y: number; z: number };
  }): void {
    this.send({
      type: 'motion',
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.listeners.add(callback);
    // Immediately call with current status
    callback(this.status);
    return () => this.listeners.delete(callback);
  }

  /**
   * Subscribe to incoming messages
   */
  onMessage(callback: (message: WebSocketMessage) => void): () => void {
    this.messageListeners.add(callback);
    return () => this.messageListeners.delete(callback);
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.listeners.forEach((listener) => listener(status));
  }

  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      this.messageListeners.forEach((listener) => listener(message));
    } catch (error) {
      console.error('WebSocketService: Failed to parse message', error);
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.log('WebSocketService: Max reconnect attempts reached');
      return;
    }

    this.cancelReconnect();
    this.reconnectAttempts++;

    console.log(
      `WebSocketService: Scheduling reconnect in ${this.config.reconnectInterval}ms (attempt ${this.reconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Reconnect will be scheduled again by onclose handler
      });
    }, this.config.reconnectInterval);
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }
}

// Singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;
