import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execute, data } from '../../src/commands/ping.js';

// Mock discord.js - doar ce avem nevoie
const mockInteraction = {
  reply: vi.fn(),
};

describe('Ping Command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Command Structure', () => {
    it('should export correct command data', () => {
      expect(data).toBeDefined();
      expect(data.name).toBe('ping');
      expect(data.description).toBe('Replies with Pong!');
    });
  });

  describe('Functionality', () => {
    it('should reply with Pong when executed', async () => {
      await execute(mockInteraction);
      
      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: 'Pong!',
        flags: 64 // MessageFlags.Ephemeral
      });
    });

    it('should propagate Discord API errors', async () => {
      mockInteraction.reply.mockRejectedValue(new Error('Discord API Error'));
      
      // Should propagate error, not swallow it
      await expect(execute(mockInteraction)).rejects.toThrow('Discord API Error');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when interaction is null', async () => {
      // Real behavior - code will throw TypeError
      await expect(execute(null)).rejects.toThrow("Cannot read properties of null (reading 'reply')");
    });

    it('should throw error when interaction.reply is not a function', async () => {
      const malformedInteraction = { reply: undefined };
      
      // Real behavior - code will throw TypeError
      await expect(execute(malformedInteraction)).rejects.toThrow("interaction.reply is not a function");
    });
  });
});
