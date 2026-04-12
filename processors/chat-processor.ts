const DEFAULT_USERNAME_COLOR = "#94a3b8";

export interface ProcessedChatMessage {
  id: string;
  content: string;
  user: {
    id: number;
    username: string;
    color?: string;
    roleId?: number;
    badge?: string;
  };
  language: "en" | "es";
  timestamp: Date;
  cooldown: number;
  fromRetransmition?: boolean;
}

export interface PinnedChatMessage {
  id: number;
  content: string;
  language: string;
  timestamp: Date;
  pinned: boolean;
}

export class ChatProcessor {
  private messages: Map<string, ProcessedChatMessage> = new Map();
  private pinnedMessages: PinnedChatMessage[] = [];
  private maxMessages = 50;
  private currentUserCount: number = 0;

  processMessage(
    messageData: any | any[],
    language: "en" | "es",
  ): ProcessedChatMessage | null {
    if (Array.isArray(messageData.Messages)) {
      messageData.Messages.forEach((msg: any) =>
        this.processMessage(msg, msg.language),
      );
      return null;
    }

    if (!messageData || !messageData.id) {
      console.error("Invalid message data", messageData);
      return null;
    }

    const userColor =
      messageData.user?.color ?? messageData.color ?? DEFAULT_USERNAME_COLOR;
    const roleId =
      messageData.user?.role_id ?? messageData.user?.roleId ?? undefined;

    const processedMessage: ProcessedChatMessage = {
      id: messageData.id,
      content: messageData.content,
      user: {
        id: messageData.user.id,
        username: messageData.user.username,
        color:
          typeof userColor === "string" ? userColor : DEFAULT_USERNAME_COLOR,
        roleId: roleId != null ? Number(roleId) : undefined,
        badge: messageData.user?.badge ?? undefined,
      },
      language,
      cooldown: messageData.cooldown || 0,
      timestamp: new Date(messageData.timestamp || ""),
      fromRetransmition: messageData.fromRetransmition || false,
    };

    // Set the message only if the ID doesn't already exist
    if (!this.messages.has(messageData.id)) {
      this.messages.set(messageData.id, processedMessage);
    }

    // Clean up old messages if exceeding limit
    if (this.messages.size > this.maxMessages) {
      const firstKey = this.messages.keys().next().value;
      if (firstKey) this.messages.delete(firstKey);
    }

    return processedMessage;
  }

  processPinnedMessages(pinnedData: any): void {
    if (!Array.isArray(pinnedData)) {
      console.warn("PinnedMessages payload is not an array", pinnedData);
      this.pinnedMessages = [];
      return;
    }

    this.pinnedMessages = pinnedData.map((msg: any) => ({
      id: Number(msg.id),
      content: String(msg.content ?? ""),
      language: msg.language === "es" ? "es" : "en",
      timestamp: new Date(msg.timestamp || Date.now()),
      pinned: Boolean(msg.pinned ?? true),
    }));
  }

  getAllMessages(): ProcessedChatMessage[] {
    return Array.from(this.messages.values());
  }

  getPinnedMessages(): PinnedChatMessage[] {
    return this.pinnedMessages;
  }

  getMessageById(id: string): ProcessedChatMessage | undefined {
    return this.messages.get(id);
  }

  removeMessage(id: string): void {
    this.messages.delete(id);
  }

  setUserCount(count: number): void {
    this.currentUserCount = count;
  }

  getUserCount(): number {
    return this.currentUserCount;
  }
}
