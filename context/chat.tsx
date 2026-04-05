"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { ProcessedChatMessage } from "@/processors";
import { PinnedChatMessage } from "@/processors/chat-processor";

interface ChatContextType {
  messages: ProcessedChatMessage[];
  pinnedMessages: PinnedChatMessage[];
  isOpen: boolean;
  addMessage: (message: ProcessedChatMessage) => void;
  removeMessage: (id: string) => void;
  setPinnedMessages: (messages: PinnedChatMessage[]) => void;
  removePinnedMessage: (id: number) => void;
  setIsOpen: (open: boolean) => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(
  undefined,
);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<ProcessedChatMessage[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<PinnedChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addMessage = (message: ProcessedChatMessage) => {
    setMessages((prev) => {
      const updated = [...prev, message];
      return updated;
    });
  };

  const removeMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const removePinnedMessage = (id: number) => {
    setPinnedMessages((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        pinnedMessages,
        isOpen,
        addMessage,
        removeMessage,
        setPinnedMessages,
        removePinnedMessage,
        setIsOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
