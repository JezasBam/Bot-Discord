import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useConnection } from '../../../src/features/discord/hooks/useConnection';

vi.mock('../../../src/api/client', () => ({
  api: {
    health: vi.fn()
  }
}));

describe('Code Coverage - API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful API health check', async () => {
    const { api } = vi.mocked(await import('../../../src/api/client'));
    (api.health as any).mockResolvedValue({
      botReady: true,
      uptime: 100,
      guilds: 1
    });

    const TestComponent = () => {
      const { status, error, health, isConnected, connect, disconnect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('connected');
      expect(screen.getByTestId('health')).toHaveTextContent('{"botReady":true,"uptime":100,"guilds":1}');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('true');
    });
  });

  it('should handle API error response', async () => {
    const { api } = vi.mocked(await import('../../../src/api/client'));
    (api.health as any).mockRejectedValue(new Error('API Error'));

    const TestComponent = () => {
      const { status, error, health, isConnected, connect, disconnect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error');
      expect(screen.getByTestId('error')).toHaveTextContent('API Error');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
    });
  });

  it('should handle bot not ready response', async () => {
    const { api } = vi.mocked(await import('../../../src/api/client'));
    (api.health as any).mockResolvedValue({
      botReady: false,
      uptime: 100,
      guilds: 1
    });

    const TestComponent = () => {
      const { status, error, health, isConnected, connect, disconnect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error');
      expect(screen.getByTestId('error')).toHaveTextContent('Bot is not ready');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
    });
  });

  it('should validate API response structure', async () => {
    const { api } = vi.mocked(await import('../../../src/api/client'));
    (api.health as any).mockResolvedValue({
      botReady: true,
      uptime: 100,
      guilds: 1,
      timestamp: '2023-01-01T00:00:00Z'
    });

    const TestComponent = () => {
      const { status, error, health, isConnected, connect, disconnect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    await waitFor(() => {
      const healthText = screen.getByTestId('health').textContent;
      const healthData = JSON.parse(healthText);
      
      expect(healthData).toHaveProperty('botReady');
      expect(healthData).toHaveProperty('uptime');
      expect(healthData).toHaveProperty('guilds');
      expect(typeof healthData.botReady).toBe('boolean');
      expect(typeof healthData.uptime).toBe('number');
      expect(typeof healthData.guilds).toBe('number');
    });
  });

  it('should handle malformed API response', async () => {
    const { api } = vi.mocked(await import('../../../src/api/client'));
    (api.health as any).mockResolvedValue('invalid response');

    const TestComponent = () => {
      const { status, error, health, isConnected, connect, disconnect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error');
      expect(screen.getByTestId('error')).toHaveTextContent('Bot is not ready');
    });
  });

  it('should handle network timeout', async () => {
    const { api } = vi.mocked(await import('../../../src/api/client'));
    (api.health as any).mockRejectedValue(new Error('Network timeout'));

    const TestComponent = () => {
      const { status, error, health, isConnected, connect, disconnect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error');
      expect(screen.getByTestId('error')).toHaveTextContent('Network timeout');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
    });
  });

  it('should handle rate limiting', async () => {
    const { api } = vi.mocked(await import('../../../src/api/client'));
    (api.health as any).mockRejectedValue(new Error('Rate limit exceeded'));

    const TestComponent = () => {
      const { status, error, health, isConnected, connect, disconnect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </div>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error');
      expect(screen.getByTestId('error')).toHaveTextContent('Rate limit exceeded');
    });
  });

  it('should maintain connection state across re-renders', async () => {
    const { api } = vi.mocked(await import('../../../src/api/client'));
    (api.health as any).mockResolvedValue({
      botReady: true,
      uptime: 100,
      guilds: 1
    });

    const TestComponent = () => {
      const { status, error, health, isConnected, connect, disconnect } = useConnection();
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </div>
      );
    };

    const { rerender } = render(<TestComponent />);
    
    // Conectăm
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('connected');
    });
    
    // Re-render
    rerender(<TestComponent />);
    
    // Starea ar trebui să se păstreze
    expect(screen.getByTestId('status')).toHaveTextContent('connected');
    expect(screen.getByTestId('is-connected')).toHaveTextContent('true');
  });
});
