import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { useConnection } from '../../../src/features/discord/hooks/useConnection';

// Mock pentru API client
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

describe('Integration Coverage - API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful API integration', async () => {
    const mockHealth = { status: 'healthy', botReady: true, guilds: 1 };
    mockApi.health.mockResolvedValue(mockHealth);

    const TestComponent = () => {
      const { status, error, health, isConnected, connect } = useConnection();
      
      return (
        <>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('connected');
      expect(screen.getByTestId('health')).toHaveTextContent(JSON.stringify(mockHealth));
      expect(screen.getByTestId('is-connected')).toHaveTextContent('true');
    });
  });

  it('should handle API errors gracefully', async () => {
    mockApi.health.mockRejectedValue(new Error('API Error'));

    const TestComponent = () => {
      const { status, error, health, isConnected, connect } = useConnection();
      
      return (
        <>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </>
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

  it('should handle malformed API responses', async () => {
    mockApi.health.mockResolvedValue({ invalid: 'response' } as any);

    const TestComponent = () => {
      const { status, error, health, isConnected, connect } = useConnection();
      
      return (
        <>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    // Should not crash and should handle gracefully
    await waitFor(() => {
      expect(screen.getByTestId('status')).toHaveTextContent('error');
      expect(screen.getByTestId('health')).toHaveTextContent('{"invalid":"response"}');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
    });
  });

  it('should handle concurrent API calls', async () => {
    const mockHealth = { status: 'healthy', botReady: true, guilds: 1 };
    mockApi.health.mockResolvedValue(mockHealth);

    const TestComponent = () => {
      const { status, error, health, isConnected, connect } = useConnection();
      
      return (
        <>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </>
      );
    };

    render(<TestComponent />);
    
    // Facem 10 cereri simultane
    const promises = Array(10).fill(null).map(() => {
      fireEvent.click(screen.getByTestId('connect-btn'));
      return waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('connected');
      });
    });
    
    await Promise.all(promises);
  });

  it('should validate API response structure', async () => {
    const mockHealth = { status: 'healthy', botReady: true, guilds: 1 };
    mockApi.health.mockResolvedValue(mockHealth);

    const TestComponent = () => {
      const { status, error, health, isConnected, connect } = useConnection();
      
      return (
        <>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </>
      );
    };

    render(<TestComponent />);
    
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    await waitFor(() => {
      const healthText = screen.getByTestId('health').textContent;
      const healthData = JSON.parse(healthText);
      
      expect(healthData).toHaveProperty('botReady');
      expect(healthData).toHaveProperty('guilds');
      expect(typeof healthData.botReady).toBe('boolean');
      expect(typeof healthData.guilds).toBe('number');
    });
  });

  it('should maintain connection state across re-renders', async () => {
    const mockHealth = { status: 'healthy', botReady: true, guilds: 1 };
    mockApi.health.mockResolvedValue(mockHealth);

    const TestComponent = () => {
      const { status, error, health, isConnected, connect } = useConnection();
      
      return (
        <>
          <div data-testid="status">{status}</div>
          <div data-testid="error">{error}</div>
          <div data-testid="health">{health ? JSON.stringify(health) : 'null'}</div>
          <div data-testid="is-connected">{isConnected.toString()}</div>
          <button onClick={connect} data-testid="connect-btn">Connect</button>
        </>
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
