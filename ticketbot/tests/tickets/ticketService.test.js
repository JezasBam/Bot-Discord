import { describe, it, expect } from 'vitest';

function getTicketName(lang, user) {
  const base = user.username?.replaceAll(' ', '-')?.toLowerCase() || 'user';
  const tag = lang === 'ro' ? 'ro' : 'en';
  return `ticket-${tag}-${base}`.slice(0, 100);
}

function getKey(lang, userId) {
  return `${lang}:${userId}`;
}

describe('Ticket Service', () => {
  describe('getTicketName', () => {
    it('should format RO ticket name correctly', () => {
      const name = getTicketName('ro', { username: 'Test User' });
      expect(name).toBe('ticket-ro-test-user');
    });

    it('should format EN ticket name correctly', () => {
      const name = getTicketName('en', { username: 'John Doe' });
      expect(name).toBe('ticket-en-john-doe');
    });

    it('should handle missing username', () => {
      const name = getTicketName('en', {});
      expect(name).toBe('ticket-en-user');
    });

    it('should truncate long usernames', () => {
      const longUsername = 'a'.repeat(150);
      const name = getTicketName('en', { username: longUsername });
      expect(name.length).toBeLessThanOrEqual(100);
    });
  });

  describe('getKey', () => {
    it('should create correct key format', () => {
      const key = getKey('ro', '123456789');
      expect(key).toBe('ro:123456789');
    });

    it('should work with EN language', () => {
      const key = getKey('en', '987654321');
      expect(key).toBe('en:987654321');
    });
  });
});
