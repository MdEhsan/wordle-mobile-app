
type SocketPayload = string | Record<string, unknown>;

export type SocketConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

type ConnectOptions = {
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (payload: unknown) => void;
  token?: string;
};

type MessageListener = (payload: unknown) => void;
type StatusListener = (status: SocketConnectionState) => void;

class SocketService {
  private socket: WebSocket | null = null;
  private listeners = new Set<MessageListener>();
  private statusListeners = new Set<StatusListener>();
  private status: SocketConnectionState = "idle";
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelayMs = 1500;
  private readonly heartbeatIntervalMs = 25000;
  private manualDisconnect = false;
  private lastConnectOptions: ConnectOptions | null = null;

  private setStatus(status: SocketConnectionState) {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.send({ type: "ping", ts: Date.now() });
      }
    }, this.heartbeatIntervalMs);
  }

  private stopHeartbeat() {
    if (!this.heartbeatTimer) {
      return;
    }
    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  private clearReconnectTimer() {
    if (!this.reconnectTimer) {
      return;
    }
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private scheduleReconnect() {
    if (
      this.manualDisconnect ||
      !this.lastConnectOptions ||
      this.reconnectAttempts >= this.maxReconnectAttempts
    ) {
      this.setStatus("disconnected");
      return;
    }

    this.reconnectAttempts += 1;
    this.setStatus("reconnecting");

    this.clearReconnectTimer();
    this.reconnectTimer = setTimeout(() => {
      this.connect(this.lastConnectOptions || undefined);
    }, this.reconnectDelayMs);
  }

  private isPingPayload(payload: unknown) {
    if (typeof payload === "string") {
      return payload.toLowerCase() === "ping";
    }

    if (payload && typeof payload === "object") {
      const event = (payload as any).event || (payload as any).type;
      if (typeof event === "string" && event.toLowerCase() === "ping") {
        return true;
      }
    }

    return false;
  }

  private getSocketUrl() {
    const socketUrl = process.env.EXPO_PUBLIC_SOCKET_URL;
    if (socketUrl) {
      return socketUrl;
    }

    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error("Socket URL is not configured");
    }

    return apiUrl.replace(/^http/i, "ws");
  }

  connect(options: ConnectOptions = {}) {
    this.lastConnectOptions = options;
    this.manualDisconnect = false;

    if (this.socket && this.isConnectedOrConnecting()) {
      return this.socket;
    }

    this.clearReconnectTimer();
    this.setStatus("connecting");

    const connectionUrl = this.getSocketUrl();

    this.socket = new WebSocket(
      `${connectionUrl}?token=${options.token || ""}`,
    );

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.setStatus("connected");
      this.startHeartbeat();
      options.onOpen?.();
    };

    this.socket.onmessage = (event) => {
      let payload: unknown = event.data;

      if (typeof event.data === "string") {
        try {
          payload = JSON.parse(event.data);
        } catch {
          payload = event.data;
        }
      }

      if (this.isPingPayload(payload)) {
        this.send({ type: "pong", ts: Date.now() });
      }

      options.onMessage?.(payload);
      this.listeners.forEach((listener) => listener(payload));
    };

    this.socket.onerror = (event) => {
      this.setStatus("error");
      options.onError?.(event);
    };

    this.socket.onclose = (event) => {
      this.stopHeartbeat();
      options.onClose?.(event);
      this.socket = null;
      this.scheduleReconnect();
    };

    return this.socket;
  }

  send(payload: SocketPayload) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    const serializedPayload =
      typeof payload === "string" ? payload : JSON.stringify(payload);

    this.socket.send(serializedPayload);
    return true;
  }

  subscribe(listener: MessageListener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeStatus(listener: StatusListener) {
    this.statusListeners.add(listener);
    listener(this.status);

    return () => {
      this.statusListeners.delete(listener);
    };
  }

  disconnect() {
    this.manualDisconnect = true;
    this.stopHeartbeat();
    this.clearReconnectTimer();

    if (!this.socket) {
      this.setStatus("disconnected");
      return;
    }

    this.socket.close();
    this.socket = null;
    this.setStatus("disconnected");
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getStatus() {
    return this.status;
  }

  private isConnectedOrConnecting() {
    if (!this.socket) {
      return false;
    }

    return (
      this.socket.readyState === WebSocket.OPEN ||
      this.socket.readyState === WebSocket.CONNECTING
    );
  }
}

export const socketService = new SocketService();

export default socketService;
