import { useAuth } from "@/hooks/use-auth";

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
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string = "";
  private onMessageCallback: ((data: WebSocketData) => void) | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private token: string | null = null;

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
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.reconnectAttempts = 0;

        if (this.token) {
          this.sendAuthToken(this.token);
        }
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
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
      this.ws.send(JSON.stringify(authMessage));
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
      this.ws.send(JSON.stringify({ type: messageType, payload }));
    }
  }
}
