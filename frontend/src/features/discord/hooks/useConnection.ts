import { useState, useEffect, useCallback } from "react";
import { api, type HealthCheck } from "@/api/client";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export function useConnection() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    console.log("🔗 useConnection - Starting connection...");
    setStatus("connecting");
    setError(null);

    try {
      console.log("🔗 useConnection - Calling health check...");
      const result = await api.health();
      console.log("🔗 useConnection - Health result:", result);
      setHealth(result);

      if (result.botReady) {
        console.log("✅ useConnection - Bot is ready, setting status to connected");
        setStatus("connected");
      } else {
        console.log("❌ useConnection - Bot not ready:", result);
        setStatus("error");
        setError("Bot is not ready");
      }
    } catch (err) {
      console.error("❌ useConnection - Connection failed:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  }, []);

  const disconnect = useCallback(() => {
    setStatus("disconnected");
    setHealth(null);
    setError(null);
  }, []);

  useEffect(() => {
    console.log("🔗 useConnection useEffect - Current status:", status);
    if (status !== "connected") return;

    console.log("🔗 useConnection - Setting up health check interval...");
    const interval = setInterval(async () => {
      try {
        const result = await api.health();
        setHealth(result);
        if (!result.botReady) {
          console.log("❌ useConnection - Bot disconnected in interval check");
          setStatus("error");
          setError("Bot disconnected");
        }
      } catch {
        console.log("❌ useConnection - Health check failed in interval");
        setStatus("error");
        setError("Connection lost");
      }
    }, 30000);

    return () => {
      console.log("🔗 useConnection - Cleaning up health check interval");
      clearInterval(interval);
    };
  }, [status]);

  return {
    status,
    health,
    error,
    connect,
    disconnect,
    isConnected: status === "connected",
  };
}
