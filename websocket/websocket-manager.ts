import { useAuth } from "@/hooks/use-auth";
import { decode as cborDecode, encode as cborEncode } from "cbor2";

export interface SignalRMessage {
  H: string;
  M: string;
  A: [string, any, string];
}

export interface WebSocketData {
  R?: {
    Heartbeat?: any;
    "CarData.z"?: string;
    "Position.z"?: string;
    CarData?: any;
    Position?: any;
    ExtrapolatedClock?: any;
    TopThree?: any;
    TimingStats?: any;
    TimingAppData?: any;
    WeatherData?: any;
    TrackStatus?: any;
    DriverList?: any;
    RaceControlMessages?: any;
    SessionInfo?: any;
    SessionData?: any;
    LapCount?: any;
    TimingData?: any;
    ChampionshipPrediction?: any;
    TyreStintSeries?: any;
    PitStopSeries?: any;
  };
  M?: SignalRMessage[];
  C?: string;
  H?: string;
  A?: [string, any, string];
  wsu?: number;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string = "";
  private onMessageCallback: ((data: WebSocketData) => void) | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private token: string | null = null;

  private encodeWebSocketMessage(value: any): Uint8Array {
    const encoded = cborEncode(value) as any;
    return new Uint8Array(
      encoded.buffer as ArrayBuffer,
      encoded.byteOffset,
      encoded.byteLength,
    );
  }

  /**
   * Appends the auth token to the connection URL so the API can authenticate
   * the socket during the WebSocket handshake itself (negotiation time),
   * instead of only via a post-connect message. This avoids a race where the
   * server's initial state snapshot is sent before the auth message would
   * have arrived.
   */
  private buildConnectionUrl(): string {
    if (!this.token) return this.url;
    const separator = this.url.includes("?") ? "&" : "?";
    return `${this.url}${separator}token=${encodeURIComponent(this.token)}`;
  }

  private decodeWebSocketMessage(rawData: unknown): any {
    let bytes: Uint8Array | null = null;

    if (rawData instanceof ArrayBuffer) {
      bytes = new Uint8Array(rawData);
    } else if (ArrayBuffer.isView(rawData)) {
      const view = rawData as ArrayBufferView;
      bytes = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    }

    if (!bytes) {
      return rawData;
    }
    return cborDecode(bytes);
  }

  connect(
    url: string,
    onMessage: (data: WebSocketData) => void,
    token?: string,
  ) {
    this.url = url;
    this.onMessageCallback = onMessage;
    this.token = token || null;
    this.attemptConnection();
  }

  private attemptConnection() {
    try {
      this.ws = new WebSocket(this.buildConnectionUrl());
      this.ws.binaryType = "arraybuffer";

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;

        // Request initial state from server
        const stateRequest = { type: "get:state" };
        this.ws!.send(
          this.encodeWebSocketMessage(stateRequest) as any,
        );

        if (this.token) {
          this.sendAuthToken(this.token);
        }
      };

      this.ws.onmessage = (event) => {
        const data = this.decodeWebSocketMessage(event.data);
        this.handleMessage(data);
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      this.ws.onclose = () => {
        console.log("WebSocket disconnected");
        this.attemptReconnect();
      };
    } catch (error) {
      console.error("Connection error:", error);
      this.attemptReconnect();
    }
  }

  private handleMessage(data: any) {
    // Manejar respuestas de autenticación
    if (data.type === "auth:error") {
      console.error("Authentication failed:", data.error);
      this.onAuthError?.();
      return;
    }

    if (data.type === "auth:success" || data.success) {
      console.log("Authentication successful");
      // The initial `get:state` (sent at onopen, before auth resolved) was
      // filtered down to unauthenticated data, so positions/translations are
      // missing from it. Re-request state now that the socket is
      // authenticated to get the full, unfiltered snapshot without forcing a
      // page reload.
      this.requestState();
      this.onAuthSuccess?.();
      return;
    }

    // Procesar otros mensajes
    if (this.onMessageCallback) {
      this.onMessageCallback(data);
    }
  }

  private sendAuthToken(token: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const authMessage = {
        type: "auth:token",
        payload: { token },
      };
      this.ws.send(this.encodeWebSocketMessage(authMessage) as any);
    }
  }

  private requestState() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const stateRequest = { type: "get:state" };
      this.ws.send(this.encodeWebSocketMessage(stateRequest) as any);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.attemptConnection(), this.reconnectDelay);
    }
  }

  setToken(token: string) {
    this.token = token;
    this.sendAuthToken(token);
  }

  onAuthSuccess: (() => void) | null = null;
  onAuthError: (() => void) | null = null;

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendMessage(messageType: string, payload: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        this.encodeWebSocketMessage({ type: messageType, payload }) as any,
      );
    }
  }
}
