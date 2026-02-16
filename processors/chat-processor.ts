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
  language: 'en' | 'es';
  timestamp: Date;
  cooldown: number;
}

export class ChatProcessor {
  private messages: Map<string, ProcessedChatMessage> = new Map();
  private maxMessages = 100;

  processMessage(messageData: any, language: 'en' | 'es'): ProcessedChatMessage | null {
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
        color: typeof userColor === "string" ? userColor : DEFAULT_USERNAME_COLOR,
        roleId: roleId != null ? Number(roleId) : undefined,
        badge: messageData.user?.badge ?? undefined,
      },
      language,
      cooldown: messageData.cooldown || 0,
      timestamp: new Date(),
    };

    this.messages.set(messageData.id, processedMessage);

    // Clean up old messages if exceeding limit
    if (this.messages.size > this.maxMessages) {
      const firstKey = this.messages.keys().next().value;
      if (firstKey) this.messages.delete(firstKey);
    }

    return processedMessage;
  }

  getAllMessages(): ProcessedChatMessage[] {
    return Array.from(this.messages.values());
  }

  getMessageById(id: string): ProcessedChatMessage | undefined {
    return this.messages.get(id);
  }

  removeMessage(id: string): void {
    this.messages.delete(id);
  }

  clear(): void {
    this.messages.clear();
  }

  clearLanguage(language: 'en' | 'es'): void {
    const keysToDelete = Array.from(this.messages.entries())
      .filter(([, msg]) => msg.language === language)
      .map(([key]) => key);

    keysToDelete.forEach((key) => this.messages.delete(key));
  }
}
