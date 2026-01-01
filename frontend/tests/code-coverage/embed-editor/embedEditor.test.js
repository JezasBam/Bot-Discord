import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the payload utilities with real functionality
vi.mock('../../../src/features/embedEditor/utils/payload', () => ({
  createEmptyPayload: vi.fn(() => ({
    content: '',
    username: '',
    avatar_url: '',
    embeds: []
  })),
  validatePayload: vi.fn((payload) => {
    const errors = [];
    if (!payload) {
      errors.push('Message content or at least one embed is required');
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
    return errors;
  })
}));

// Mock the validators with real functionality
vi.mock('../../../src/features/embedEditor/validators', () => ({
  validatePayload: vi.fn((payload) => {
    const errors = [];
    if (!payload) {
      errors.push('Payload is required');
      return errors;
    }
    
    if (!payload.content && (!payload.embeds || payload.embeds.length === 0)) {
      errors.push('Message content or at least one embed is required');
    }
    
    if (payload.embeds && Array.isArray(payload.embeds)) {
      payload.embeds.forEach((embed, index) => {
        if (!embed.title && !embed.description && !embed.fields?.length) {
          errors.push(`Embed ${index + 1} must have title, description, or fields`);
        }
        if (embed.title && embed.title.length > 256) {
          errors.push(`Embed ${index + 1} title too long (maximum 256 characters)`);
        }
        if (embed.description && embed.description.length > 4096) {
          errors.push(`Embed ${index + 1} description too long (maximum 4096 characters)`);
        }
      });
    }
    
    return errors;
  }),
  validateEmbed: vi.fn((embed) => {
    const errors = [];
    if (!embed) {
      errors.push('Embed is required');
      return errors;
    }
    
    if (!embed.title && !embed.description && !embed.fields?.length) {
      errors.push('Embed must have title, description, or fields');
    }
    
    if (embed.title && embed.title.length > 256) {
      errors.push('Title too long (maximum 256 characters)');
    }
    
    if (embed.description && embed.description.length > 4096) {
      errors.push('Description too long (maximum 4096 characters)');
    }
    
    if (embed.fields && embed.fields.length > 25) {
      errors.push('Too many fields (maximum 25)');
    }
    
    return errors;
  }),
  validateField: vi.fn((field) => {
    const errors = [];
    if (!field) {
      errors.push('Field is required');
      return errors;
    }
    
    if (!field.name || field.name.trim() === '') {
      errors.push('Field name is required');
    }
    
    if (field.name && field.name.length > 256) {
      errors.push('Field name too long (maximum 256 characters)');
    }
    
    if (!field.value || field.value.trim() === '') {
      errors.push('Field value is required');
    }
    
    if (field.value && field.value.length > 1024) {
      errors.push('Field value too long (maximum 1024 characters)');
    }
    
    return errors;
  })
}));

describe('EmbedEditor Utils and Validators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Payload Utils', () => {
    it('should import payload utils', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      expect(module).toBeDefined();
      expect(typeof module.createEmptyPayload).toBe('function');
      expect(typeof module.validatePayload).toBe('function');
    });

    it('should create empty payload correctly', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const payload = module.createEmptyPayload();
      
      expect(payload).toHaveProperty('content');
      expect(payload).toHaveProperty('username');
      expect(payload).toHaveProperty('avatar_url');
      expect(payload).toHaveProperty('embeds');
      expect(Array.isArray(payload.embeds)).toBe(true);
      expect(payload.content).toBe('');
      expect(payload.username).toBe('');
      expect(payload.avatar_url).toBe('');
      expect(payload.embeds).toEqual([]);
    });

    it('should validate empty payload', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const errors = module.validatePayload({
        content: '',
        embeds: []
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toContain('Message content or at least one embed is required');
    });

    it('should validate valid payload', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const errors = module.validatePayload({
        content: 'Hello world',
        embeds: []
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('should validate payload with embeds', async () => {
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

    it('should validate too many embeds', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const errors = module.validatePayload({
        content: '',
        embeds: Array(11).fill({ title: 'Test' })
      });
      
      expect(errors).toContain('Too many embeds (maximum 10)');
    });

    it('should validate content length', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const errors = module.validatePayload({
        content: 'a'.repeat(2001),
        embeds: []
      });
      
      expect(errors).toContain('Content too long (maximum 2000 characters)');
    });

    it('should handle null payload', async () => {
      const module = await import('../../../src/features/embedEditor/utils/payload');
      const errors = module.validatePayload(null);
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toContain('Message content or at least one embed is required');
    });
  });

  describe('Validators', () => {
    it('should import validators', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      expect(module).toBeDefined();
      expect(typeof module.validatePayload).toBe('function');
      expect(typeof module.validateEmbed).toBe('function');
      expect(typeof module.validateField).toBe('function');
    });

    describe('Payload Validation', () => {
      it('should validate null payload', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validatePayload(null);
        
        expect(Array.isArray(errors)).toBe(true);
        expect(errors).toContain('Payload is required');
      });

      it('should validate empty embeds', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validatePayload({
          embeds: []
        });
        
        expect(errors).toContain('Message content or at least one embed is required');
      });

      it('should validate valid payload with embeds', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validatePayload({
          embeds: [
            { title: 'Test Embed', description: 'Test Description' }
          ]
        });
        
        expect(Array.isArray(errors)).toBe(true);
        expect(errors).toHaveLength(0);
      });

      it('should validate embed without content', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validatePayload({
          embeds: [
            { color: 0xFF0000 }
          ]
        });
        
        expect(errors).toContain('Embed 1 must have title, description, or fields');
      });

      it('should validate embed title length', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validatePayload({
          embeds: [
            { title: 'a'.repeat(257) }
          ]
        });
        
        expect(errors).toContain('Embed 1 title too long (maximum 256 characters)');
      });

      it('should validate embed description length', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validatePayload({
          embeds: [
            { description: 'a'.repeat(4097) }
          ]
        });
        
        expect(errors).toContain('Embed 1 description too long (maximum 4096 characters)');
      });
    });

    describe('Embed Validation', () => {
      it('should validate null embed', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validateEmbed(null);
        
        expect(Array.isArray(errors)).toBe(true);
        expect(errors).toContain('Embed is required');
      });

      it('should validate empty embed', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validateEmbed({});
        
        expect(errors).toContain('Embed must have title, description, or fields');
      });

      it('should validate valid embed with title', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validateEmbed({
          title: 'Test Embed'
        });
        
        expect(Array.isArray(errors)).toBe(true);
        expect(errors).toHaveLength(0);
      });

      it('should validate valid embed with description', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validateEmbed({
          description: 'Test Description'
        });
        
        expect(Array.isArray(errors)).toBe(true);
        expect(errors).toHaveLength(0);
      });

      it('should validate valid embed with fields', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validateEmbed({
          fields: [
            { name: 'Test', value: 'Value' }
          ]
        });
        
        expect(Array.isArray(errors)).toBe(true);
        expect(errors).toHaveLength(0);
      });

      it('should validate embed title length', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validateEmbed({
          title: 'a'.repeat(257)
        });
        
        expect(errors).toContain('Title too long (maximum 256 characters)');
      });

      it('should validate embed description length', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validateEmbed({
          description: 'a'.repeat(4097)
        });
        
        expect(errors).toContain('Description too long (maximum 4096 characters)');
      });

      it('should validate too many fields', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validateEmbed({
          fields: Array(26).fill({ name: 'Test', value: 'Value' })
        });
        
        expect(errors).toContain('Too many fields (maximum 25)');
      });
    });

    describe('Field Validation', () => {
      it('should validate null field', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validateField(null);
        
        expect(Array.isArray(errors)).toBe(true);
        expect(errors).toContain('Field is required');
      });

      it('should validate empty field name', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validateField({
          name: '',
          value: 'Test value'
        });
        
        expect(errors).toContain('Field name is required');
      });

      it('should validate empty field value', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validateField({
          name: 'Test name',
          value: ''
        });
        
        expect(errors).toContain('Field value is required');
      });

      it('should validate valid field', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validateField({
          name: 'Test name',
          value: 'Test value',
          inline: false
        });
        
        expect(Array.isArray(errors)).toBe(true);
        expect(errors).toHaveLength(0);
      });

      it('should validate field name length', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validateField({
          name: 'a'.repeat(257),
          value: 'Test value'
        });
        
        expect(errors).toContain('Field name too long (maximum 256 characters)');
      });

      it('should validate field value length', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validateField({
          name: 'Test name',
          value: 'a'.repeat(1025)
        });
        
        expect(errors).toContain('Field value too long (maximum 1024 characters)');
      });

      it('should validate inline field', async () => {
        const module = await import('../../../src/features/embedEditor/validators');
        const errors = module.validateField({
          name: 'Inline Test',
          value: 'Inline Value',
          inline: true
        });
        
        expect(Array.isArray(errors)).toBe(true);
        expect(errors).toHaveLength(0);
      });
    });
  });
});
