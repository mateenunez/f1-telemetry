"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, LogIn, Palette, Crown, Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ProcessedChatMessage } from "@/processors/chat-processor";

interface ChatWidgetProps {
  messages: ProcessedChatMessage[];
  language: string;
  dict: any;
  sendMessage: (content: string, color: string) => Promise<void>;
  onOpenAuth: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  messages,
  language,
  sendMessage,
  onOpenAuth,
}) => {
  const DEFAULT_USERNAME_COLORS = [
    "#60a5fa",
    "#34d399",
    "#f472b6",
    "#a78bfa",
    "#fbbf24",
    "#22d3ee",
    "#fb923c",
    "#c084fc",
  ];

  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [usernameColor, setUsernameColor] = useState<string>(
    () =>
      DEFAULT_USERNAME_COLORS[
        Math.floor(Math.random() * DEFAULT_USERNAME_COLORS.length)
      ],
  );
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const maxLength = 200;

  const isPremiumOrAdmin = (roleId?: number) =>
    roleId === 2 || roleId === 3;
  const messageBgStyle = (hexColor: string | undefined) => {
    if (!hexColor) return undefined;
    const hex = hexColor.replace(/^#/, "");
    if (hex.length === 6) return { backgroundColor: `${hexColor}18` };
    return undefined;
  };

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1000), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Track whether the user is viewing the latest messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const threshold = 10; // px leeway from exact bottom
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      setIsAtBottom(distanceFromBottom <= threshold);
    };

    // Initialize position and state
    handleScroll();

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll only when user is at (or near) the bottom
  useEffect(() => {
    if (!isAtBottom) return;
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isAtBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || !isAuthenticated || !user) return;

    try {
      sendMessage(content.trim(), usernameColor);
      setContent("");
      setIsSubmitting(false);
      setCooldown(user?.role.cooldown_ms || 5000);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-warmBlack rounded-lg chat-step">
        <div className="text-center space-y-2">
          <LogIn className="mx-auto" size={32} />
          <p className="text-xs text-gray-400 font-geist max-w-xs">
            {language === "es"
              ? "Necesitas una cuenta para enviar mensajes!"
              : "You need an account to send messages!"}
          </p>
          <button
            onClick={onOpenAuth}
            className="px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-geist text-xs flex items-center justify-center gap-2 mx-auto"
          >
            <LogIn size={16} />
            {language === "es" ? "Iniciar sesión" : "Login"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:h-full h-[20rem] flex flex-col bg-warmBlack rounded-lg overflow-hidden chat-step">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0a0a0a]"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            {language === "es"
              ? "Este es la primera versión del chat, probalo 🌱"
              : "This is the first version of the chat, try it out 🌱"}
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const showTintedBg = isPremiumOrAdmin(msg.user.roleId);
              return (
                <div
                  key={msg.id}
                  className="text-sm space-y-1 break-words rounded-md px-2 py-1 -mx-2 -my-0.5"
                  style={
                    showTintedBg ? messageBgStyle(msg.user.color) : undefined
                  }
                >
                  <div className="flex items-center gap-2">
                    {msg.user.roleId === 3 && (
                      <Crown size={14} className="shrink-0" color={msg.user.color} />
                    )}
                    {msg.user.roleId === 2 && (
                      <Heart size={14} className="shrink-0" color={msg.user.color} />
                    )}
                    <span
                      className="font-semibold truncate"
                      style={{ color: msg.user.color ?? "#94a3b8" }}
                    >
                      {msg.user.username}
                    </span>
                    <span className="text-xs font-geist text-gray-600">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-gray-200 break-words whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="px-2 pb-2 pt-1 bg-warmBlack">
        <form onSubmit={handleSubmit} className="flex flex-col gap-1">
          <div className="flex items-stretch gap-1.5">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (content.trim() && cooldown === 0 && !isSubmitting) {
                    handleSubmit(e as any);
                  }
                }
              }}
              placeholder={
                language === "es"
                  ? "Escribe un mensaje..."
                  : "Type a message..."
              }
              maxLength={maxLength}
              disabled={cooldown > 0 || isSubmitting}
              className="flex-1 min-h-[36px] h-9 px-2.5 py-1.5 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none text-sm max-h-20 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
              rows={1}
            />
            <div className="relative flex items-center shrink-0">
              <button
                type="button"
                onClick={() => setShowColorPicker((v) => !v)}
                className="h-9 w-9 flex items-center justify-center bg-transparent hover:border-gray-500 transition-colors"
                title={
                  language === "es" ? "Color del nombre" : "Username color"
                }
                aria-label="Pick username color"
              >
                <Palette size={16} className="text-gray-400" />
              </button>
              {showColorPicker && (
                <div className="absolute right-0 bottom-full mb-1 flex items-center gap-1 p-2 z-10 border border-gray-600 bg-warmBlack">
                  <input
                    type="color"
                    value={usernameColor}
                    onChange={(e) => setUsernameColor(e.target.value)}
                    className="w-8 h-8 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={usernameColor}
                    onChange={(e) => setUsernameColor(e.target.value)}
                    className="w-20 px-2 py-1 text-white text-xs font-mono bg-transparent"
                  />
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={
                !content.trim() ||
                isSubmitting ||
                cooldown > 0 ||
                !isAuthenticated
              }
              className="h-9 px-3 flex items-center justify-center bg-blue-600 text-white rounded border border-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:border-gray-600 disabled:cursor-not-allowed transition-colors font-medium text-sm shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
          <div className="flex justify-between text-xs text-gray-500 px-0.5">
            <span>{content.length}/{maxLength}</span>
          </div>
        </form>
      </div>
    </div>
  );
};
