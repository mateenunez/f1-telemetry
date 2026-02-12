"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';
import { ProcessedChatMessage } from '@/processors';

interface ChatContextType {
  messages: ProcessedChatMessage[];
  isOpen: boolean;
  addMessage: (message: ProcessedChatMessage) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  setIsOpen: (open: boolean) => void;
//   removeOldMessages: () => void;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [messages, setMessages] = useState<ProcessedChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addMessage = (message: ProcessedChatMessage) => {
    setMessages((prev) => {
      const updated = [...prev, message];
      return updated
    });
  };

  const removeMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const clearMessages = () => {
    setMessages([]);
  };

//   const removeOldMessages = () => {
//     const now = Date.now();
//     setMessages((prev) =>
//       prev.filter((msg) => now - msg.timestamp.getTime() < messageLifetime)
//     );
//   };

//   // Clean up old messages periodically
//   useEffect(() => {
//     const interval = setInterval(removeOldMessages, 60000); // Every minute
//     return () => clearInterval(interval);
//   }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isOpen,
        addMessage,
        removeMessage,
        clearMessages,
        setIsOpen,
        // removeOldMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
