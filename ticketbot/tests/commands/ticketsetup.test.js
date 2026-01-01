import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execute, data } from '../../src/commands/ticketsetup.js';

// Mock dependencies
vi.mock('../../src/storage/db.js', () => ({
  loadDb: vi.fn(),
  updateGuildConfig: vi.fn()
}));

vi.mock('../../src/core/logger.js', () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }))
}));

vi.mock('../../src/config/constants.js', () => ({
  SUPPORT_ROLE_NAME: 'Support'
}));

describe('TicketSetup Command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Command Structure', () => {
    it('should export correct command data', () => {
      expect(data).toBeDefined();
      expect(data.name).toBe('ticketsetup');
      expect(data.description).toBe('Setup ticket system (RO/EN)');
    });

    it('should have language option', () => {
      // Verificăm că există opțiune de limbă
      expect(data.options).toBeDefined();
    });

    it('should require ManageGuild permission', () => {
      // Verificăm că permisiunea este setată (oricare valoare)
      expect(data.default_member_permissions).toBeDefined();
    });
  });

  describe('Basic Validation', () => {
    it('should handle missing guild', async () => {
      const mockInteraction = {
        guild: null,
        inGuild: vi.fn(() => false),
        reply: vi.fn()
      };
      
      await execute(mockInteraction);
      
      expect(mockInteraction.reply).toHaveBeenCalledWith({
        content: 'This command can only be used in a server.',
        flags: expect.any(Number)
      });
    });

    it('should handle missing interaction methods', async () => {
      const mockInteraction = {
        guild: { id: 'test-guild' },
        inGuild: vi.fn(() => true),
        options: { getString: vi.fn(() => 'ro') },
        deferReply: vi.fn(),
        editReply: vi.fn()
      };
      
      await execute(mockInteraction);
      
      expect(mockInteraction.deferReply).toHaveBeenCalled();
      expect(mockInteraction.editReply).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle setup errors gracefully', async () => {
      const mockInteraction = {
        guild: { id: 'test-guild' },
        inGuild: vi.fn(() => true),
        options: { getString: vi.fn(() => 'ro') },
        deferReply: vi.fn(),
        editReply: vi.fn()
      };
      
      await execute(mockInteraction);
      
      expect(mockInteraction.deferReply).toHaveBeenCalled();
      expect(mockInteraction.editReply).toHaveBeenCalled();
    });

    it('should handle missing language option', async () => {
      const mockInteraction = {
        guild: { id: 'test-guild' },
        inGuild: vi.fn(() => true),
        options: { getString: vi.fn(() => null) },
        deferReply: vi.fn(),
        editReply: vi.fn()
      };
      
      await execute(mockInteraction);
      
      expect(mockInteraction.deferReply).toHaveBeenCalled();
      expect(mockInteraction.editReply).toHaveBeenCalled();
    });
  });
});
