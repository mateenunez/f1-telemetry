import { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../context/chat";
import { useAuth } from "./use-auth";
import { getTelemetryManager } from "../telemetry-manager-singleton";
import { ProcessedChatMessage } from "@/processors/chat-processor";

export const useChat = (processedMessages: ProcessedChatMessage[] | undefined, dict: any) => {
  const context = useContext(ChatContext);

  if (!context) throw new Error("Error at useChat hook.");

  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const { messages, isOpen, setIsOpen, addMessage, removeMessage } = context;
  const timersRef = useRef<Set<string>>(new Set());
  const visibleTime = 3600000; // 1 hour

  const currentLanguage = dict?.locale ? dict.locale : "es";

  const currentLanguageMessages = messages.filter((m) => m.language === currentLanguage);

  useEffect(() => {
    if (!processedMessages) return;

    const now = new Date().getTime();

    processedMessages.forEach((msg) => {
      const expirationTime = msg.timestamp.getTime() + msg.cooldown;

      if (expirationTime <= now) return;

      if (!timersRef.current.has(msg.id)) {
        addMessage(msg);
        timersRef.current.add(msg.id);

        const remainingTime = visibleTime - msg.cooldown;

        setTimeout(() => {
          removeMessage(msg.id);
          timersRef.current.delete(msg.id);
        }, remainingTime);
      }
    });

    // Remove messages that are no longer in processedMessages
    messages.forEach((active) => {
      if (!processedMessages.some((p) => p.id === active.id)) {
        removeMessage(active.id);
        timersRef.current.delete(active.id);
      }
    });
  }, [processedMessages, addMessage, removeMessage, messages]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1000), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const sendMessage = async (content: string, color: string, badge: string) => {
    if (!content.trim()) return setError("Message is empty.");

    setError(null);

    try {
      const telemetryManager = getTelemetryManager();
      const messageData = {
        content: content.trim(),
        language: currentLanguage,
        color: color || undefined, // Undefined o default?
        badge: badge || undefined,
      };
      telemetryManager.sendMessage("chat:post", messageData);

      setCooldown(user?.role?.cooldown_ms ?? 5000);
    } catch (err) {
      setError("Sending message failed.");
    }
  };

  return {
    messages: currentLanguageMessages,
    isOpen,
    setIsOpen,
    sendMessage,
    error,
    cooldown,
    canSend: cooldown === 0,
  };
};
