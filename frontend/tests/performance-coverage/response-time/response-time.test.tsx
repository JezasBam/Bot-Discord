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

describe('Performance Coverage - Response Time Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle fast API responses', async () => {
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
    
    const startTime = Date.now();
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    await waitFor(() => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(screen.getByTestId('status')).toHaveTextContent('connected');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('true');
      expect(duration).toBeLessThan(1000); // < 1s
    });
  });

  it('should handle slow API responses', async () => {
    const mockHealth = { status: 'healthy', botReady: true, guilds: 1 };
    mockApi.health.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockHealth), 2000))
    );

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
    
    const startTime = Date.now();
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    await waitFor(() => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(screen.getByTestId('status')).toHaveTextContent('connected');
      expect(screen.getByTestId('is-connected')).toHaveTextContent('true');
      expect(duration).toBeGreaterThan(2000); // > 2s
    }, { timeout: 5000 }); // Increase timeout to 5 seconds
  });

  it('should handle concurrent requests', async () => {
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
    
    // Testăm 10 cereri simultane
    const promises = Array(10).fill(null).map(() => {
      fireEvent.click(screen.getByTestId('connect-btn'));
      return waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('connected');
      });
    });
    
    await Promise.all(promises);
  });

  it('should handle memory usage', async () => {
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
    
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Facem 100 de cereri
    for (let i = 0; i < 100; i++) {
      fireEvent.click(screen.getByTestId('connect-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('connected');
      });
    }
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Verificăm că nu avem memory leaks (creștere < 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });

  it('should handle CPU usage', async () => {
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
    
    const startCPU = process.cpuUsage();
    
    // Facem 50 de cereri
    for (let i = 0; i < 50; i++) {
      fireEvent.click(screen.getByTestId('connect-btn'));
      await waitFor(() => {
        expect(screen.getByTestId('status')).toHaveTextContent('connected');
      });
    }
    
    const endCPU = process.cpuUsage(startCPU);
    const cpuPercent = (endCPU.user + endCPU.system) / 1000000;
    
    // Verificăm că CPU usage < 80%
    expect(cpuPercent).toBeLessThan(80);
  });
});
