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

describe('Debug useConnection Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should handle connection step by step', async () => {
    const healthData = { status: 'healthy', botReady: true, uptime: 100, guilds: 1 };
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
    
    // Initial state should be disconnected
    expect(screen.getByTestId('status')).toHaveTextContent('disconnected');
    
    // Click connect
    fireEvent.click(screen.getByTestId('connect-btn'));
    
    // Status should be connecting immediately
    expect(screen.getByTestId('status')).toHaveTextContent('connecting');
    
    // Check if API was called
    expect(mockApiHealth).toHaveBeenCalledTimes(1);
    
    // Advance timers to resolve the promise (but not the interval)
    await vi.runOnlyPendingTimersAsync();
    
    // Check final status
    expect(screen.getByTestId('status')).toHaveTextContent('connected');
  });
});
