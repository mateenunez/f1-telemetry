export interface ProcessedJoke {
  id: string;
  content: string;
  coords: {
    xPct: number;
    yPct: number;
  };
  cooldown: number;
  color: string;
  user: {
    id: number;
    username: string;
  };
  timestamp: Date;
}

export class JokeProcessor {
  private jokes: Map<string, ProcessedJoke> = new Map();
  private maxJokes = 50;

  processJoke(jokeData: any): ProcessedJoke | null {
    if (!jokeData || !jokeData.id) {
      console.error("Invalid joke data", jokeData);
      return null;
    }

    const processedJoke: ProcessedJoke = {
      id: jokeData.id,
      content: jokeData.content,
      coords: {
        xPct: jokeData.coords.xPct,
        yPct: jokeData.coords.yPct,
      },
      cooldown: jokeData.cooldown,
      color: jokeData.color,
      user: {
        id: jokeData.user.id,
        username: jokeData.user.username,
      },
      timestamp: new Date(),
    };

    this.jokes.set(jokeData.id, processedJoke);

    // Limpiar jokes antiguos si excedemos límite
    if (this.jokes.size > this.maxJokes) {
      const firstKey = this.jokes.keys().next().value;
      if (firstKey) this.jokes.delete(firstKey);
    }

    return processedJoke;
  }

  getLatestJokes(limit: number = 10): ProcessedJoke[] {
    return Array.from(this.jokes.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getAllJokes(): ProcessedJoke[] {
    return Array.from(this.jokes.values());
  }

  getJokeById(id: string): ProcessedJoke | undefined {
    return this.jokes.get(id);
  }

  removeJoke(id: string): void {
    this.jokes.delete(id);
  }

  clear(): void {
    this.jokes.clear();
  }
}
