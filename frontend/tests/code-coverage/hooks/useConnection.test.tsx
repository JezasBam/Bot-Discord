import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConnection } from '../../../src/features/discord/hooks/useConnection';

vi.mock('../../../src/api/client', () => ({
  api: {
    health: vi.fn()
  }
}));

describe('Code Coverage - useConnection Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('should initialize with disconnected status', () => {
    const { result } = renderHook(() => useConnection());
    
    expect(result.current.status).toBe('disconnected');
    expect(result.current.health).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.isConnected).toBe(false);
  });

  it('should handle successful connection', async () => {
    const mockHealth = { botReady: true, uptime: 100, guilds: 1 };
    const { api } = vi.mocked(await import('../../../src/api/client'));
    (api.health as any).mockResolvedValue(mockHealth);

    const { result } = renderHook(() => useConnection());
    
    await act(async () => {
      await result.current.connect();
    });
    
    expect(result.current.status).toBe('connected');
    expect(result.current.health).toEqual(mockHealth);
    expect(result.current.error).toBe(null);
    expect(result.current.isConnected).toBe(true);
  });

  it('should handle connection failure when bot is not ready', async () => {
    const mockHealth = { botReady: false, uptime: 100, guilds: 1 };
    const { api } = vi.mocked(await import('../../../src/api/client'));
    (api.health as any).mockResolvedValue(mockHealth);

    const { result } = renderHook(() => useConnection());
    
    await act(async () => {
      await result.current.connect();
    });
    
    expect(result.current.status).toBe('error');
    expect(result.current.health).toEqual(mockHealth);
    expect(result.current.error).toBe('Bot is not ready');
    expect(result.current.isConnected).toBe(false);
  });

  it('should handle connection error', async () => {
    const { api } = vi.mocked(await import('../../../src/api/client'));
    (api.health as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useConnection());
    
    await act(async () => {
      await result.current.connect();
    });
    
    expect(result.current.status).toBe('error');
    expect(result.current.health).toBe(null);
    expect(result.current.error).toBe('Network error');
    expect(result.current.isConnected).toBe(false);
  });

  it('should handle disconnect', () => {
    const { result } = renderHook(() => useConnection());
    
    act(() => {
      result.current.disconnect();
    });
    
    expect(result.current.status).toBe('disconnected');
    expect(result.current.health).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.isConnected).toBe(false);
  });

  it('should set up health check interval when connected', async () => {
    const mockHealth = { botReady: true, uptime: 100, guilds: 1 };
    const { api } = vi.mocked(await import('../../../src/api/client'));
    (api.health as any).mockResolvedValue(mockHealth);

    const { result } = renderHook(() => useConnection());
    
    await act(async () => {
      await result.current.connect();
    });
    
    expect(result.current.status).toBe('connected');
    
    // Verificăm că health check a fost apelat o dată
    expect((api.health as any)).toHaveBeenCalledTimes(1);
    
    // Avansăm timpul pentru a declanșa intervalul
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    
    expect((api.health as any)).toHaveBeenCalledTimes(2);
  });

  it('should clean up interval on unmount', async () => {
    const mockHealth = { botReady: true, uptime: 100, guilds: 1 };
    const { api } = vi.mocked(await import('../../../src/api/client'));
    (api.health as any).mockResolvedValue(mockHealth);

    const { result, unmount } = renderHook(() => useConnection());
    
    await act(async () => {
      await result.current.connect();
    });
    
    // Unmount
    unmount();
    
    // Avansăm timpul - intervalul ar trebui să fie curățat
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    
    // Nu ar trebui să fie apelări suplimentare
    expect((api.health as any)).toHaveBeenCalledTimes(1);
  });
});
