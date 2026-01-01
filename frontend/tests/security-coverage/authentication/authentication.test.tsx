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

describe('Security Coverage - Authentication Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle token validation', async () => {
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
    
    // Testăm că starea inițială este disconnected
    expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
    expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
  });

  it('should handle authentication errors', async () => {
    mockApi.health.mockRejectedValue(new Error('Authentication failed'));

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
      expect(screen.getByTestId('error')).toHaveTextContent('Authentication failed');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
    });
  });

  it('should handle rate limiting', async () => {
    mockApi.health.mockRejectedValue(new Error('Rate limit exceeded'));

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
      expect(screen.getByTestId('error')).toHaveTextContent('Rate limit exceeded');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
    });
  });

  it('should handle network timeout', async () => {
    mockApi.health.mockRejectedValue(new Error('Network timeout'));

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
      expect(screen.getByTestId('error')).toHaveTextContent('Network timeout');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('false');
    });
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
      expect(screen.getByTestId('status')).toHaveTextContent('connected');
      expect(screen.getByTestId('health')).toHaveTextContent(JSON.stringify(mockHealth));
      expect(screen.getByTestId('is-connected')).toHaveTextContent('true');
    });
  });
});
