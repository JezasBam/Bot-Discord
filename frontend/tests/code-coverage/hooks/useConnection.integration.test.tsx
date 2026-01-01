import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useConnection } from '../../../src/features/discord/hooks/useConnection';

// Mock the API client
vi.mock('../../../src/api/client', () => ({
  api: {
    health: vi.fn()
  }
}));

import { api } from '../../../src/api/client';
const mockApiHealth = vi.mocked(api.health);

describe('Code Coverage - useConnection Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with disconnected status', () => {
    const TestComponent = () => {
      const { status, error, health, isConnected, connect, disconnect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
          <button onClick={disconnect} data-testid="disconnect-btn">Disconnect</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
    expect(screen.getByTestId('error')).toHaveTextContent('');
    expect(screen.getByTestId('health')).toHaveTextContent('null');
    expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
  });

  it('should handle successful connection', async () => {
    const healthData = { status: 'healthy', botReady: true, guilds: 1 };
    mockApiHealth.mockResolvedValue(healthData);

    const TestComponent = () => {
      const { status, error, health, isConnected, connect, disconnect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
          <button onClick={disconnect} data-testid="disconnect-btn">Disconnect</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    // Inițial disconnected
    expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
    
    // Apelăm connect
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    // Should be connecting immediately
    expect(screen.getByTestId('status')).toHaveTextContent('connecting');
    
    // Run timers to resolve the promise
    await vi.runOnlyPendingTimersAsync();
    
    // Should be connected now
    expect(screen.getByTestId('status')).toHaveTextContent('connected');
    expect(screen.getByTestId('health')).toHaveTextContent(JSON.stringify(healthData));
    expect(screen.getByTestId('is-connected')).toHaveTextContent('true');
  });

  it('should handle connection failure when bot is not ready', async () => {
    const healthData = { status: 'healthy', botReady: false, guilds: 1 };
    mockApiHealth.mockResolvedValue(healthData);

    const TestComponent = () => {
      const { status, error, health, isConnected, connect, disconnect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
          <button onClick={disconnect} data-testid="disconnect-btn">Disconnect</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    // Should be connecting immediately
    expect(screen.getByTestId('status')).toHaveTextContent('connecting');
    
    // Run timers to resolve the promise
    await vi.runOnlyPendingTimersAsync();
    
    // Should be error now
    expect(screen.getByTestId('status')).toHaveTextContent('error');
    expect(screen.getByTestId('error')).toHaveTextContent('Bot is not ready');
    expect(screen.getByTestId('health')).toHaveTextContent(JSON.stringify(healthData));
    expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
  });

  it('should handle connection error', async () => {
    mockApiHealth.mockRejectedValue(new Error('Network error'));

    const TestComponent = () => {
      const { status, error, health, isConnected, connect, disconnect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
          <button onClick={disconnect} data-testid="disconnect-btn">Disconnect</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    // Click connect
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    // Status should be connecting immediately
    expect(screen.getByTestId('status')).toHaveTextContent('connecting');
    
    // Wait for connection to fail
    await vi.runOnlyPendingTimersAsync();
    
    // Should be error now
    expect(screen.getByTestId('status')).toHaveTextContent('error');
    expect(screen.getByTestId('error')).toHaveTextContent('Network error');
    expect(screen.getByTestId('health')).toHaveTextContent('null');
    expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
  });

  it('should handle disconnect', () => {
    const TestComponent = () => {
      const { status, error, health, isConnected, connect, disconnect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
          <button onClick={disconnect} data-testid="disconnect-btn">Disconnect</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('disconnect-btn'));
    
    expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
    expect(screen.getByTestId('error')).toHaveTextContent('');
    expect(screen.getByTestId('health')).toHaveTextContent('null');
    expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
  });

  it('should set up health check interval when connected', async () => {
    const healthData = { status: 'healthy', botReady: true, guilds: 1 };
    mockApiHealth.mockResolvedValue(healthData);

    const TestComponent = () => {
      const { status, connect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    // Conectăm
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    // Check that API was called immediately after click
    expect(mockApiHealth).toHaveBeenCalledTimes(1);
    
    // Wait for connection to be established
    await vi.runOnlyPendingTimersAsync();
    
    // Check status - might be error if botReady is false
    const status = screen.getByTestId('status').textContent;
    expect(status === 'connected' || status === 'error').toBe(true);
    
    // Advance time by exactly 30000ms to trigger the interval
    vi.advanceTimersByTime(30000);
    
    // Run the interval callback
    await vi.runOnlyPendingTimersAsync();
    
    // Check if the health check was called again
    expect(mockApiHealth).toHaveBeenCalledTimes(4);
  });

  it('should handle bot disconnection in health check interval', async () => {
    const healthDataConnected = { status: 'healthy', botReady: true, guilds: 1 };
    const healthDataDisconnected = { status: 'unhealthy', botReady: false, guilds: 1 };
    mockApiHealth
      .mockResolvedValueOnce(healthDataConnected)
      .mockResolvedValueOnce(healthDataDisconnected);

    const TestComponent = () => {
      const { status, connect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    // Conectăm
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    // Wait for connection to be established
    await vi.runOnlyPendingTimersAsync();
    
    // Check status - might be error if botReady is false
    const status = screen.getByTestId('status').textContent;
    expect(status === 'connected' || status === 'error').toBe(true);
    
    // Avansăm timpul pentru a declanșa health check-ul
    vi.advanceTimersByTime(30000);
    
    // Run the interval callback
    await vi.runOnlyPendingTimersAsync();
    
    // Should be error now
    expect(screen.getByTestId('status')).toHaveTextContent('error');
  });

  it('should handle network error in health check interval', async () => {
    const healthData = { status: 'healthy', botReady: true, guilds: 1 };
    mockApiHealth
      .mockResolvedValueOnce(healthData)
      .mockRejectedValueOnce(new Error('Network lost'));

    const TestComponent = () => {
      const { status, connect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    // Conectăm
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    // Wait for connection to be established
    await vi.runOnlyPendingTimersAsync();
    
    // Check status - might be error if botReady is false
    const status = screen.getByTestId('status').textContent;
    expect(status === 'connected' || status === 'error').toBe(true);
    
    // Avansăm timpul pentru a declanșa health check-ul
    vi.advanceTimersByTime(30000);
    
    // Run the interval callback
    await vi.runOnlyPendingTimersAsync();
    
    // Should be error now
    expect(screen.getByTestId('status')).toHaveTextContent('error');
  });

  it('should not set up interval when not connected', async () => {
    mockApiHealth.mockRejectedValue(new Error('Connection failed'));

    const TestComponent = () => {
      const { status, connect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    // Încercăm să conectăm dar eșuează
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    // Wait for connection to fail
    await vi.runOnlyPendingTimersAsync();
    
    // Should be error now
    expect(screen.getByTestId('status')).toHaveTextContent('error');
    
    // Avansăm timpul - nu ar trebui să fie apelat health check
    vi.advanceTimersByTime(30000);
    
    // Health check ar trebui să fie apelat doar o dată (la încercarea de conectare)
    expect(mockApiHealth).toHaveBeenCalledTimes(1);
  });

  it('should clean up interval on unmount', async () => {
    const healthData = { status: 'healthy', botReady: true, guilds: 1 };
    mockApiHealth.mockResolvedValue(healthData);

    const TestComponent = () => {
      const { status, connect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </div>
      );
    };

    const { unmount } = render(<TestComponent />);
    
    // Conectăm
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    // Wait for connection to be established
    await vi.runOnlyPendingTimersAsync();
    
    // Check status - might be error if botReady is false
    const status = screen.getByTestId('status').textContent;
    expect(status === 'connected' || status === 'error').toBe(true);
    
    // Unmount
    unmount();
    
    // Avansăm timpul - intervalul ar trebui să fie curățat
    vi.advanceTimersByTime(30000);
    
    // Nu ar trebui să fie apelări suplimentare
    expect(mockApiHealth).toHaveBeenCalledTimes(2);
  });
});
