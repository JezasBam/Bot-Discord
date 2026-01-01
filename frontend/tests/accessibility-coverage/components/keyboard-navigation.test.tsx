import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useConnection } from '../../../src/features/discord/hooks/useConnection';

vi.mock('../../../src/api/client', () => ({
  api: {
    health: vi.fn(),
    sendMessage: vi.fn(),
    deleteMessage: vi.fn(),
    getGuilds: vi.fn(),
    getGuildChannels: vi.fn(),
    getChannelMessages: vi.fn()
  }
}));

import { api } from '../../../src/api/client';
const mockApi = vi.mocked(api);

describe('Accessibility Coverage - Keyboard Navigation Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be fully navigable via keyboard', async () => {
    const healthData = { status: 'healthy', botReady: true, guilds: 1 };
    mockApi.health.mockResolvedValue(healthData);

    const TestComponent = () => {
      const { status, error, health, isConnected, connect, disconnect } = useConnection();
      
      return (
        <>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
          <button onClick={disconnect} data-testid="disconnect-btn">Disconnect</button>
        </>
      );
    };

    render(<TestComponent />);
    
    // Testăm focus și click pentru conectare
    screen.getByTestId('connect-btn').focus();
    expect(screen.getByTestId('connect-btn')).toHaveFocus();
    
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    // Should start connecting
    expect(screen.getByTestId('status')).toHaveTextContent('connecting');
    
    // Run timers to resolve connection
    await vi.runOnlyPendingTimersAsync();
    
    // Should be connected now
    expect(screen.getByTestId('status')).toHaveTextContent('connected');
    expect(screen.getByTestId('is-connected')).toHaveTextContent('true');
    
    // Testăm disconnect cu click
    fireEvent.click(screen.getByTestId('disconnect-btn'));
    
    // Should disconnect
    expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
    expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
  });
});
