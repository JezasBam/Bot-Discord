import { useState, useEffect, useCallback } from 'react';
import { api, type HealthCheck } from '@/api/client';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export function useConnection() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setStatus('connecting');
    setError(null);

    try {
      const result = await api.health();
      setHealth(result);

      if (result.botReady) {
        setStatus('connected');
      } else {
        setStatus('error');
        setError('Bot is not ready');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  }, []);

  const disconnect = useCallback(() => {
    setStatus('disconnected');
    setHealth(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (status !== 'connected') return;

    const interval = setInterval(async () => {
      try {
        const result = await api.health();
        setHealth(result);
        if (!result.botReady) {
          setStatus('error');
          setError('Bot disconnected');
        }
      } catch {
        setStatus('error');
        setError('Connection lost');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [status]);

  return {
    status,
    health,
    error,
    connect,
    disconnect,
    isConnected: status === 'connected',
  };
}
