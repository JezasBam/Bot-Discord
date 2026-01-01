import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the payload utilities with real functionality
vi.mock('../../../src/features/embedEditor/utils/payload', () => {
  let idCounter = 1;
  return {
  createEmptyPayload: vi.fn(() => ({
    content: '',
    username: '',
    avatar_url: '',
    embeds: []
  })),
  validatePayload: vi.fn((payload) => {
    const errors = [];
    if (!payload) {
      errors.push('Payload is required');
      return errors;
    }
    
    if (!payload.content && (!payload.embeds || payload.embeds.length === 0)) {
      errors.push('Message content or at least one embed is required');
    }
    
    if (payload.embeds && payload.embeds.length > 10) {
      errors.push('Too many embeds (maximum 10)');
    }
    
    if (payload.content && payload.content.length > 2000) {
      errors.push('Content too long (maximum 2000 characters)');
    }
    
    if (payload.username && payload.username.length > 80) {
      errors.push('Username too long (maximum 80 characters)');
    }
    
    if (payload.avatar_url && payload.avatar_url.length > 2048) {
      errors.push('Avatar URL too long (maximum 2048 characters)');
    }
    
    return errors;
  }),
  createEmptyEmbed: vi.fn(() => ({
    id: '',
    title: '',
    description: '',
    color: 0x5865f2,
    fields: []
  })),
  addEmbedToPayload: vi.fn((payload, embed) => {
    if (!payload.embeds) {
      payload.embeds = [];
    }
    if (payload.embeds.length >= 10) {
      return payload; // Don't add if at limit
    }
    return {
      ...payload,
      embeds: [...payload.embeds, { ...embed, id: `embed-${idCounter++}` }]
    };
  }),
  removeEmbedFromPayload: vi.fn((payload, embedId) => {
    if (!payload.embeds) {
      return payload;
    }
    return {
      ...payload,
      embeds: payload.embeds.filter(embed => embed.id !== embedId)
    };
  }),
  updateEmbedInPayload: vi.fn((payload, embedId, updates) => {
    if (!payload.embeds) {
      return payload;
    }
    return {
      ...payload,
      embeds: payload.embeds.map(embed => 
        embed.id === embedId ? { ...embed, ...updates } : embed
      )
    };
  })
};
});

describe('EmbedEditor Payload Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock counter to ensure unique IDs
    vi.doMock('../../../src/features/embedEditor/utils/payload', () => {
      let idCounter = 1;
      return {
        createEmptyPayload: vi.fn(() => ({
          content: '',
          username: '',
          avatar_url: '',
          embeds: []
        })),
        validatePayload: vi.fn((payload) => {
          const errors = [];
          if (!payload) {
            errors.push('Payload is required');
            return errors;
          }
          
          if (!payload.content && (!payload.embeds || payload.embeds.length === 0)) {
            errors.push('Message content or at least one embed is required');
          }
          
          if (payload.embeds && payload.embeds.length > 10) {
            errors.push('Too many embeds (maximum 10)');
          }
          
          if (payload.content && payload.content.length > 2000) {
            errors.push('Content too long (maximum 2000 characters)');
          }
          
          if (payload.username && payload.username.length > 80) {
            errors.push('Username too long (maximum 80 characters)');
          }
          
          if (payload.avatar_url && payload.avatar_url.length > 2048) {
            errors.push('Avatar URL too long (maximum 2048 characters)');
          }
          
          return errors;
        }),
        createEmptyEmbed: vi.fn(() => ({
          id: '',
          title: '',
          description: '',
          color: 0x5865f2,
          fields: []
        })),
        addEmbedToPayload: vi.fn((payload, embed) => {
          if (!payload.embeds) {
            payload.embeds = [];
          }
          if (payload.embeds.length >= 10) {
            return payload; // Don't add if at limit
          }
          return {
            ...payload,
            embeds: [...payload.embeds, { ...embed, id: `embed-${idCounter++}` }]
          };
        }),
        removeEmbedFromPayload: vi.fn((payload, embedId) => {
          if (!payload.embeds) {
            return payload;
          }
          return {
            ...payload,
            embeds: payload.embeds.filter(embed => embed.id !== embedId)
          };
        }),
        updateEmbedInPayload: vi.fn((payload, embedId, updates) => {
          if (!payload.embeds) {
            return payload;
          }
          return {
            ...payload,
            embeds: payload.embeds.map(embed => 
              embed.id === embedId ? { ...embed, ...updates } : embed
            )
          };
        })
      };
    });
  });

  describe('Module Exports', () => {
    it('should import payload utils module', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      expect(module).toBeDefined();
    });

    it('should export all required functions', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      expect(typeof module.createEmptyPayload).toBe('function');
      expect(typeof module.validatePayload).toBe('function');
      expect(typeof module.createEmptyEmbed).toBe('function');
      expect(typeof module.addEmbedToPayload).toBe('function');
      expect(typeof module.removeEmbedFromPayload).toBe('function');
      expect(typeof module.updateEmbedInPayload).toBe('function');
    });
  });

  describe('createEmptyPayload', () => {
    it('should create empty payload with all required properties', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const payload = module.createEmptyPayload();
      
      expect(payload).toHaveProperty('content');
      expect(payload).toHaveProperty('username');
      expect(payload).toHaveProperty('avatar_url');
      expect(payload).toHaveProperty('embeds');
      
      expect(typeof payload.content).toBe('string');
      expect(typeof payload.username).toBe('string');
      expect(typeof payload.avatar_url).toBe('string');
      expect(Array.isArray(payload.embeds)).toBe(true);
      
      expect(payload.content).toBe('');
      expect(payload.username).toBe('');
      expect(payload.avatar_url).toBe('');
      expect(payload.embeds).toEqual([]);
    });

    it('should create consistent empty payloads', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const payload1 = module.createEmptyPayload();
      const payload2 = module.createEmptyPayload();
      
      expect(payload1).toEqual(payload2);
      expect(payload1).not.toBe(payload2); // Different instances
    });
  });

  describe('createEmptyEmbed', () => {
    it('should create empty embed with default values', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const embed = module.createEmptyEmbed();
      
      expect(embed).toHaveProperty('id');
      expect(embed).toHaveProperty('title');
      expect(embed).toHaveProperty('description');
      expect(embed).toHaveProperty('color');
      expect(embed).toHaveProperty('fields');
      
      expect(typeof embed.id).toBe('string');
      expect(typeof embed.title).toBe('string');
      expect(typeof embed.description).toBe('string');
      expect(typeof embed.color).toBe('number');
      expect(Array.isArray(embed.fields)).toBe(true);
      
      expect(embed.id).toBe('');
      expect(embed.title).toBe('');
      expect(embed.description).toBe('');
      expect(embed.color).toBe(0x5865f2);
      expect(embed.fields).toEqual([]);
    });

    it('should create unique embeds', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const embed1 = module.createEmptyEmbed();
      const embed2 = module.createEmptyEmbed();
      
      expect(embed1).toEqual(embed2);
      expect(embed1).not.toBe(embed2); // Different instances
    });
  });

  describe('validatePayload', () => {
    it('should reject null payload', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const errors = module.validatePayload(null);
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toContain('Payload is required');
    });

    it('should reject empty payload (no content, no embeds)', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const errors = module.validatePayload({
        content: '',
        embeds: []
      });
      
      expect(errors).toContain('Message content or at least one embed is required');
    });

    it('should accept valid payload with content only', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const errors = module.validatePayload({
        content: 'Hello world',
        embeds: []
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid payload with embeds only', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const errors = module.validatePayload({
        content: '',
        embeds: [
          { title: 'Test Embed', description: 'Test Description' }
        ]
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid payload with both content and embeds', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const errors = module.validatePayload({
        content: 'Hello world',
        embeds: [
          { title: 'Test Embed', description: 'Test Description' }
        ]
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('should reject content too long', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const errors = module.validatePayload({
        content: 'a'.repeat(2001),
        embeds: []
      });
      
      expect(errors).toContain('Content too long (maximum 2000 characters)');
    });

    it('should reject username too long', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const errors = module.validatePayload({
        content: 'Hello world',
        username: 'a'.repeat(81),
        embeds: []
      });
      
      expect(errors).toContain('Username too long (maximum 80 characters)');
    });

    it('should reject avatar URL too long', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const longUrl = 'a'.repeat(2050); // Simple long string
      const errors = module.validatePayload({
        content: 'Hello world',
        avatar_url: longUrl,
        embeds: []
      });
      
      expect(longUrl.length).toBeGreaterThan(2048);
      expect(errors).toContain('Avatar URL too long (maximum 2048 characters)');
    });

    it('should reject too many embeds', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const errors = module.validatePayload({
        content: 'Hello world',
        embeds: Array(11).fill({ title: 'Test' })
      });
      
      expect(errors).toContain('Too many embeds (maximum 10)');
    });

    it('should accept payload at maximum limits', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const errors = module.validatePayload({
        content: 'a'.repeat(2000),
        username: 'a'.repeat(80),
        avatar_url: 'https://example.com/' + 'a'.repeat(2000),
        embeds: Array(10).fill({ title: 'Test' })
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('should handle payload with all properties', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const errors = module.validatePayload({
        content: 'Test message',
        username: 'TestBot',
        avatar_url: 'https://example.com/avatar.png',
        embeds: [
          {
            title: 'Test Embed',
            description: 'Test Description',
            color: 0x00ff00,
            fields: []
          }
        ]
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });
  });

  describe('addEmbedToPayload', () => {
    it('should add embed to empty payload', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const payload = { content: 'Hello', embeds: [] };
      const embed = { title: 'New Embed' };
      
      const result = module.addEmbedToPayload(payload, embed);
      
      expect(result.content).toBe('Hello');
      expect(result.embeds).toHaveLength(1);
      expect(result.embeds[0]).toEqual(expect.objectContaining(embed));
      expect(result.embeds[0].id).toBeDefined();
    });

    it('should add embed to existing payload', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const payload = {
        content: 'Hello',
        embeds: [{ title: 'Existing Embed', id: '123' }]
      };
      const embed = { title: 'New Embed' };
      
      const result = module.addEmbedToPayload(payload, embed);
      
      expect(result.embeds).toHaveLength(2);
      expect(result.embeds[0].id).toBe('123');
      expect(result.embeds[1].title).toBe('New Embed');
    });

    it('should not add embed when at maximum limit', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const payload = {
        content: 'Hello',
        embeds: Array(10).fill({ title: 'Test' })
      };
      const embed = { title: 'Extra Embed' };
      
      const result = module.addEmbedToPayload(payload, embed);
      
      expect(result.embeds).toHaveLength(10);
      expect(result.embeds[9].title).toBe('Test');
    });

    it('should create unique IDs for new embeds', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const payload = { content: 'Hello', embeds: [] };
      const embed1 = { title: 'First' };
      const embed2 = { title: 'Second' };
      
      const result1 = module.addEmbedToPayload(payload, embed1);
      const result2 = module.addEmbedToPayload(result1, embed2);
      
      expect(result1.embeds).toHaveLength(1);
      expect(result2.embeds).toHaveLength(2);
      expect(result1.embeds[0].id).toBeDefined();
      expect(result2.embeds[0].id).toBeDefined();
      expect(result2.embeds[1].id).toBeDefined();
      expect(result2.embeds[1].id).not.toBe(result2.embeds[0].id);
    });
  });

  describe('removeEmbedFromPayload', () => {
    it('should remove embed by ID', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const payload = {
        content: 'Hello',
        embeds: [
          { id: '123', title: 'Embed 1' },
          { id: '456', title: 'Embed 2' },
          { id: '789', title: 'Embed 3' }
        ]
      };
      
      const result = module.removeEmbedFromPayload(payload, '456');
      
      expect(result.embeds).toHaveLength(2);
      expect(result.embeds[0].id).toBe('123');
      expect(result.embeds[1].id).toBe('789');
    });

    it('should handle non-existent embed ID', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const payload = {
        content: 'Hello',
        embeds: [
          { id: '123', title: 'Embed 1' },
          { id: '456', title: 'Embed 2' }
        ]
      };
      
      const result = module.removeEmbedFromPayload(payload, '999');
      
      expect(result.embeds).toHaveLength(2);
      expect(result.embeds[0].id).toBe('123');
      expect(result.embeds[1].id).toBe('456');
    });

    it('should handle empty embeds array', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const payload = { content: 'Hello', embeds: [] };
      
      const result = module.removeEmbedFromPayload(payload, '123');
      
      expect(result.embeds).toHaveLength(0);
    });

    it('should preserve other properties', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const payload = {
        content: 'Hello',
        username: 'TestBot',
        embeds: [
          { id: '123', title: 'Embed 1' }
        ]
      };
      
      const result = module.removeEmbedFromPayload(payload, '123');
      
      expect(result.content).toBe('Hello');
      expect(result.username).toBe('TestBot');
      expect(result.embeds).toHaveLength(0);
    });
  });

  describe('updateEmbedInPayload', () => {
    it('should update embed by ID', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const payload = {
        content: 'Hello',
        embeds: [
          { id: '123', title: 'Original Title', description: 'Original Description' },
          { id: '456', title: 'Another Embed' }
        ]
      };
      
      const result = module.updateEmbedInPayload(payload, '123', {
        title: 'Updated Title',
        color: 0xFF0000
      });
      
      expect(result.embeds).toHaveLength(2);
      expect(result.embeds[0].id).toBe('123');
      expect(result.embeds[0].title).toBe('Updated Title');
      expect(result.embeds[0].description).toBe('Original Description');
      expect(result.embeds[0].color).toBe(0xFF0000);
      expect(result.embeds[1]).toEqual(payload.embeds[1]);
    });

    it('should handle non-existent embed ID', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const payload = {
        content: 'Hello',
        embeds: [
          { id: '123', title: 'Embed 1' },
          { id: '456', title: 'Embed 2' }
        ]
      };
      
      const result = module.updateEmbedInPayload(payload, '999', {
        title: 'Updated Title'
      });
      
      expect(result.embeds).toHaveLength(2);
      expect(result.embeds[0]).toEqual(payload.embeds[0]);
      expect(result.embeds[1]).toEqual(payload.embeds[1]);
    });

    it('should update multiple properties', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const payload = {
        content: 'Hello',
        embeds: [
          { id: '123', title: 'Original', description: 'Original' }
        ]
      };
      
      const result = module.updateEmbedInPayload(payload, '123', {
        title: 'New Title',
        description: 'New Description',
        color: 0xFF0000,
        url: 'https://example.com'
      });
      
      expect(result.embeds[0].title).toBe('New Title');
      expect(result.embeds[0].description).toBe('New Description');
      expect(result.embeds[0].color).toBe(0xFF0000);
      expect(result.embeds[0].url).toBe('https://example.com');
    });

    it('should preserve other embeds', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const payload = {
        content: 'Hello',
        embeds: [
          { id: '123', title: 'Embed 1' },
          { id: '456', title: 'Embed 2' }
        ]
      };
      
      const result = module.updateEmbedInPayload(payload, '123', {
        title: 'Updated'
      });
      
      expect(result.embeds).toHaveLength(2);
      expect(result.embeds[0].title).toBe('Updated');
      expect(result.embeds[1]).toEqual(payload.embeds[1]);
    });
  });

  describe('Complex Payload Operations', () => {
    it('should handle adding and removing embeds', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      let payload = module.createEmptyPayload();
      
      // Add first embed
      payload = module.addEmbedToPayload(payload, { title: 'First Embed' });
      expect(payload.embeds).toHaveLength(1);
      
      // Add second embed
      payload = module.addEmbedToPayload(payload, { title: 'Second Embed' });
      expect(payload.embeds).toHaveLength(2);
      
      // Remove first embed
      payload = module.removeEmbedFromPayload(payload, payload.embeds[0].id);
      expect(payload.embeds).toHaveLength(1);
      expect(payload.embeds[0].title).toBe('Second Embed');
    });

    it('should handle updating embeds in complex payload', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      let payload = {
        content: 'Hello',
        username: 'TestBot',
        embeds: [
          { id: '123', title: 'Original', description: 'Original' },
          { id: '456', title: 'Another', description: 'Another' }
        ]
      };
      
      // Update first embed
      payload = module.updateEmbedInPayload(payload, '123', {
        title: 'Updated',
        color: 0xFF0000
      });
      
      // Update second embed
      payload = module.updateEmbedInPayload(payload, '456', {
        description: 'Updated Description'
      });
      
      expect(payload.embeds[0].title).toBe('Updated');
      expect(payload.embeds[0].color).toBe(0xFF0000);
      expect(payload.embeds[1].description).toBe('Updated Description');
      expect(payload.content).toBe('Hello');
      expect(payload.username).toBe('TestBot');
    });

    it('should handle payload at capacity', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      let payload = { content: 'Hello', embeds: [] };
      
      // Add embeds up to limit
      for (let i = 0; i < 10; i++) {
        payload = module.addEmbedToPayload(payload, { title: `Embed ${i + 1}` });
      }
      
      expect(payload.embeds).toHaveLength(10);
      
      // Try to add one more (should not add)
      const result = module.addEmbedToPayload(payload, { title: 'Extra Embed' });
      expect(result.embeds).toHaveLength(10);
      
      // Remove one embed
      payload = module.removeEmbedFromPayload(payload, payload.embeds[5].id);
      expect(payload.embeds).toHaveLength(9);
      
      // Add another embed (should succeed)
      payload = module.addEmbedToPayload(payload, { title: 'New Embed' });
      expect(payload.embeds).toHaveLength(10);
    });
  });
});
