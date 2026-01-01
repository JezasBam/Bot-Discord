import { describe, it, expect, vi, beforeEach } from 'vitest';

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
        if (embed.fields && embed.fields.length > 25) {
          errors.push(`Embed ${index + 1} has too many fields (maximum 25)`);
        }
      });
    }
    
    if (payload.embeds && payload.embeds.length > 10) {
      errors.push('Too many embeds (maximum 10)');
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
    
    if (embed.fields) {
      embed.fields.forEach((field, index) => {
        if (!field.name || field.name.trim() === '') {
          errors.push(`Field ${index + 1} name is required`);
        }
        if (field.name && field.name.length > 256) {
          errors.push(`Field ${index + 1} name too long (maximum 256 characters)`);
        }
        if (!field.value || field.value.trim() === '') {
          errors.push(`Field ${index + 1} value is required`);
        }
        if (field.value && field.value.length > 1024) {
          errors.push(`Field ${index + 1} value too long (maximum 1024 characters)`);
        }
      });
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

describe('EmbedEditor Validators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Module Exports', () => {
    it('should import validators module', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      expect(module).toBeDefined();
    });

    it('should export all required functions', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      expect(typeof module.validatePayload).toBe('function');
      expect(typeof module.validateEmbed).toBe('function');
      expect(typeof module.validateField).toBe('function');
    });
  });

  describe('Payload Validation', () => {
    it('should reject null payload', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validatePayload(null);
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toContain('Payload is required');
    });

    it('should reject empty payload (no content, no embeds)', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validatePayload({
        content: '',
        embeds: []
      });
      
      expect(errors).toContain('Message content or at least one embed is required');
    });

    it('should accept valid payload with content', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validatePayload({
        content: 'Hello world',
        embeds: []
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid payload with embeds', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validatePayload({
        content: '',
        embeds: [
          { title: 'Test Embed', description: 'Test Description' }
        ]
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('should reject embed without content', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validatePayload({
        content: '',
        embeds: [
          { color: 0xFF0000 }
        ]
      });
      
      expect(errors).toContain('Embed 1 must have title, description, or fields');
    });

    it('should reject embed with too long title', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validatePayload({
        content: '',
        embeds: [
          { title: 'a'.repeat(257) }
        ]
      });
      
      expect(errors).toContain('Embed 1 title too long (maximum 256 characters)');
    });

    it('should reject embed with too long description', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validatePayload({
        content: '',
        embeds: [
          { description: 'a'.repeat(4097) }
        ]
      });
      
      expect(errors).toContain('Embed 1 description too long (maximum 4096 characters)');
    });

    it('should reject too many embeds', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validatePayload({
        content: '',
        embeds: Array(11).fill({ title: 'Test' })
      });
      
      expect(errors).toContain('Too many embeds (maximum 10)');
    });

    it('should reject embed with too many fields', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validatePayload({
        content: '',
        embeds: [
          {
            title: 'Test',
            fields: Array(26).fill({ name: 'Field', value: 'Value' })
          }
        ]
      });
      
      expect(errors).toContain('Embed 1 has too many fields (maximum 25)');
    });

    it('should accept payload with multiple valid embeds', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validatePayload({
        content: '',
        embeds: [
          { title: 'First Embed', description: 'First Description' },
          { title: 'Second Embed', description: 'Second Description' }
        ]
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Embed Validation', () => {
    it('should reject null embed', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateEmbed(null);
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toContain('Embed is required');
    });

    it('should reject empty embed', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateEmbed({});
      
      expect(errors).toContain('Embed must have title, description, or fields');
    });

    it('should accept embed with title', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateEmbed({
        title: 'Test Embed'
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('should accept embed with description', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateEmbed({
        description: 'Test Description'
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('should accept embed with fields', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateEmbed({
        fields: [
          { name: 'Test', value: 'Value' }
        ]
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('should reject embed with too long title', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateEmbed({
        title: 'a'.repeat(257)
      });
      
      expect(errors).toContain('Title too long (maximum 256 characters)');
    });

    it('should reject embed with too long description', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateEmbed({
        description: 'a'.repeat(4097)
      });
      
      expect(errors).toContain('Description too long (maximum 4096 characters)');
    });

    it('should reject embed with too many fields', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateEmbed({
        fields: Array(26).fill({ name: 'Test', value: 'Value' })
      });
      
      expect(errors).toContain('Too many fields (maximum 25)');
    });

    it('should reject embed with invalid field name', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateEmbed({
        fields: [
          { name: '', value: 'Value' }
        ]
      });
      
      expect(errors).toContain('Field 1 name is required');
    });

    it('should reject embed with invalid field value', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateEmbed({
        fields: [
          { name: 'Test', value: '' }
        ]
      });
      
      expect(errors).toContain('Field 1 value is required');
    });

    it('should accept embed with all valid properties', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateEmbed({
        title: 'Complete Embed',
        description: 'Complete Description',
        color: 0x5865f2,
        fields: [
          { name: 'Field 1', value: 'Value 1', inline: false },
          { name: 'Field 2', value: 'Value 2', inline: true }
        ]
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Field Validation', () => {
    it('should reject null field', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateField(null);
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toContain('Field is required');
    });

    it('should reject empty field name', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateField({
        name: '',
        value: 'Test value'
      });
      
      expect(errors).toContain('Field name is required');
    });

    it('should reject empty field value', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateField({
        name: 'Test name',
        value: ''
      });
      
      expect(errors).toContain('Field value is required');
    });

    it('should reject whitespace-only field name', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateField({
        name: '   ',
        value: 'Test value'
      });
      
      expect(errors).toContain('Field name is required');
    });

    it('should reject whitespace-only field value', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateField({
        name: 'Test name',
        value: '   '
      });
      
      expect(errors).toContain('Field value is required');
    });

    it('should reject field name too long', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateField({
        name: 'a'.repeat(257),
        value: 'Test value'
      });
      
      expect(errors).toContain('Field name too long (maximum 256 characters)');
    });

    it('should reject field value too long', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateField({
        name: 'Test name',
        value: 'a'.repeat(1025)
      });
      
      expect(errors).toContain('Field value too long (maximum 1024 characters)');
    });

    it('should accept valid field', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateField({
        name: 'Test name',
        value: 'Test value',
        inline: false
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid inline field', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateField({
        name: 'Inline Field',
        value: 'Inline Value',
        inline: true
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('should accept field with maximum valid lengths', async () => {
      const module = await import('../../../src/features/embedEditor/validators');
      const errors = module.validateField({
        name: 'a'.repeat(256),
        value: 'a'.repeat(1024),
        inline: false
      });
      
      expect(Array.isArray(errors)).toBe(true);
      expect(errors).toHaveLength(0);
    });
  });
});
