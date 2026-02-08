import { useContext, useEffect, useRef, useState } from "react";
import { JokeContext } from "../context/jokes";
import { useAuth } from "./use-auth";
import { Joke } from "@/components/telemetry/Joke";
import { getTelemetryManager } from "../telemetry-manager-singleton";
import { ProcessedJoke } from "@/processors/joke-processor";
import { usePreferences } from "@/context/preferences";

export const useJoke = (processedJokes: ProcessedJoke[] | undefined) => {
  const context = useContext(JokeContext);

  if (!context) throw new Error("Error at useJoke hook.");

  const { user } = useAuth();
  const {preferences} = usePreferences();
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [activeJokes, setActiveJokes] = useState<ProcessedJoke[]>([]);
  const timersRef = useRef<Set<string>>(new Set());
  const visibleTime = 10000;
  const {
    status,
    coords,
    color,
    cancel,
    finish,
    startPlacing,
    setLocation,
    setColor,
  } = context;

  useEffect(() => {
    if (!processedJokes || !preferences.jokesEnabled) return;

    const now = new Date().getTime();

    processedJokes.forEach((joke) => {
      const expirationTime = joke.timestamp.getTime() + joke.cooldown;

      if (expirationTime <= now) return;

      if (!timersRef.current.has(joke.id)) {
        setActiveJokes((prev) => {
          if (prev.find((j) => j.id === joke.id)) return prev;
          return [...prev, joke];
        });

        timersRef.current.add(joke.id);

        const remainingTime = visibleTime - joke.cooldown;

        setTimeout(() => {
          setActiveJokes((prev) => prev.filter((j) => j.id !== joke.id));
          timersRef.current.delete(joke.id);
        }, remainingTime);
      }
    });

    setActiveJokes((prev) =>
      prev.filter((active) => processedJokes.some((p) => p.id === active.id)),
    );
  }, [processedJokes]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1000), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const sendJoke = async (joke: Joke) => {
    if (!joke.content.trim()) return setError("Joke content is empty.");

    setError(null);

    try {
      const telemetryManager = getTelemetryManager();
      telemetryManager.sendMessage("joke:post", {
        content: joke.content,
        xPct: coords?.xPct,
        yPct: coords?.yPct,
        color: color,
      });

      setCooldown(user?.role.cooldown_ms || 10);
    } catch (err) {
      setError("Sending joke failed.");
    }
  };

  const remove = (id: string) => {
    setActiveJokes((prev) => prev.filter((j) => j.id !== id));
    timersRef.current.delete(id);
  };

  return {
    remove,
    status,
    coords,
    color,
    cancel,
    finish,
    startPlacing,
    setLocation,
    setColor,
    sendJoke,
    error,
    cooldown,
    canSend: cooldown === 0,
    activeJokes: activeJokes,
  };
};
