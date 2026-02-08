"use client";

import { useJoke } from "@/hooks/use-joke";
import { useState } from "react";
import { Send, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export interface Joke {
  xPct: number;
  yPct: number;
  content: string;
}

interface JokeProps {
  dict?: any;
  status: "idle" | "selecting-location" | "writing";
  coords: { xPct: number; yPct: number } | null;
  canSend: boolean;
  color: string;
  cancel: () => void;
  finish: () => void;
  sendJoke: (joke: Joke) => void;
  setColor: (color: string) => void;
}

export function Joke({
  dict,
  status,
  coords,
  canSend,
  color,
  cancel,
  finish,
  sendJoke,
  setColor,
}: JokeProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const maxLength = 50;

  if (status !== "writing" || !coords) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || !user || !user.role) return;

    const joke: Joke = {
      xPct: coords.xPct,
      yPct: coords.yPct,
      content: content.trim(),
    };

    sendJoke(joke);

    setContent("");
    setIsSubmitting(false);
    finish();
  };

  const handleCancel = () => {
    setContent("");
    cancel();
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none">
      <div className="relative w-full max-w-[20rem] p-4 bg-warmBlack border border-gray-800 rounded-lg shadow-lg pointer-events-auto">
        <button
          onClick={handleCancel}
          className="absolute top-2 left-2 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <X width={20} />
        </button>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-start justify-between pt-6"
        >
          <div className="flex flex-row items-start w-full gap-2">
            <div className="flex flex-col">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={dict.joke.placeholder}
                maxLength={maxLength}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                rows={1}
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                {content.length}/{maxLength}
              </p>
            </div>
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting || !canSend}
              className="flex py-3 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center justify-center gap-2 ml-2"
            >
              <Send size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3 pb-3 w-full justify-center">
            <div className="flex gap-2">
              {[
                "#FFFFFF",
                "#F1BA00",
                "#FF0000",
                "#0080FF",
                "#00FF00",
                "#FF00FF",
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    color === c
                      ? "border-gray-300 ring-2 ring-offset-1"
                      : "border-gray-600"
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
