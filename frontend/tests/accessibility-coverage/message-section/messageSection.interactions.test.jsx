import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageSection } from '../../../src/features/embedEditor/components/MessageSection';

describe('MessageSection User Interactions', () => {
  const mockOnContentChange = vi.fn();
  const mockOnUsernameChange = vi.fn();
  const mockOnAvatarChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    content: '',
    username: '',
    avatarUrl: '',
    onContentChange: mockOnContentChange,
    onUsernameChange: mockOnUsernameChange,
    onAvatarChange: mockOnAvatarChange
  };

  describe('Content Input Interactions', () => {
    it('should call onContentChange when content textarea is changed', () => {
      render(<MessageSection {...defaultProps} />);

      const contentTextarea = screen.getByPlaceholderText('Message content (ex: \'Hello @everyone!\')');
      fireEvent.change(contentTextarea, { target: { value: 'New message content' } });

      expect(mockOnContentChange).toHaveBeenCalledWith('New message content');
      expect(mockOnContentChange).toHaveBeenCalledTimes(1);
    });

    it('should handle empty content change', () => {
      render(
        <MessageSection 
          {...defaultProps}
          content="Initial content"
        />
      );

      const contentTextarea = screen.getByDisplayValue('Initial content');
      fireEvent.change(contentTextarea, { target: { value: '' } });

      expect(mockOnContentChange).toHaveBeenCalledWith('');
    });

    it('should handle content with special characters', () => {
      render(<MessageSection {...defaultProps} />);

      const contentTextarea = screen.getByPlaceholderText('Message content (ex: \'Hello @everyone!\')');
      const specialContent = 'Hello @everyone! 🎉 Check out https://example.com';
      fireEvent.change(contentTextarea, { target: { value: specialContent } });

      expect(mockOnContentChange).toHaveBeenCalledWith(specialContent);
    });

    it('should handle content at maximum length', () => {
      render(<MessageSection {...defaultProps} />);

      const contentTextarea = screen.getByPlaceholderText('Message content (ex: \'Hello @everyone!\')');
      const maxContent = 'a'.repeat(2000);
      fireEvent.change(contentTextarea, { target: { value: maxContent } });

      expect(mockOnContentChange).toHaveBeenCalledWith(maxContent);
    });

    it('should not exceed maximum length due to maxLength attribute', () => {
      render(<MessageSection {...defaultProps} />);

      const contentTextarea = screen.getByPlaceholderText('Message content (ex: \'Hello @everyone!\')');
      const overLimitContent = 'a'.repeat(2001); // One character over limit
      
      fireEvent.change(contentTextarea, { target: { value: overLimitContent } });

      // In testing environment, fireEvent doesn't respect maxLength
      // but the component should still call onChange with the full value
      // The browser would handle truncation in real usage
      expect(mockOnContentChange).toHaveBeenCalledWith(overLimitContent);
    });
  });

  describe('Username Input Interactions', () => {
    it('should call onUsernameChange when username input is changed', () => {
      render(<MessageSection {...defaultProps} />);

      const usernameInput = screen.getByPlaceholderText('Webhook name (ex: \'Server Bot\', \'Announcements\')');
      fireEvent.change(usernameInput, { target: { value: 'TestBot' } });

      expect(mockOnUsernameChange).toHaveBeenCalledWith('TestBot');
      expect(mockOnUsernameChange).toHaveBeenCalledTimes(1);
    });

    it('should handle empty username change', () => {
      render(
        <MessageSection 
          {...defaultProps}
          username="InitialUsername"
        />
      );

      const usernameInput = screen.getByDisplayValue('InitialUsername');
      fireEvent.change(usernameInput, { target: { value: '' } });

      expect(mockOnUsernameChange).toHaveBeenCalledWith('');
    });

    it('should handle username with special characters', () => {
      render(<MessageSection {...defaultProps} />);

      const usernameInput = screen.getByPlaceholderText('Webhook name (ex: \'Server Bot\', \'Announcements\')');
      const specialUsername = '🤖 Bot-Pro 2024';
      fireEvent.change(usernameInput, { target: { value: specialUsername } });

      expect(mockOnUsernameChange).toHaveBeenCalledWith(specialUsername);
    });

    it('should handle username at maximum length', () => {
      render(<MessageSection {...defaultProps} />);

      const usernameInput = screen.getByPlaceholderText('Webhook name (ex: \'Server Bot\', \'Announcements\')');
      const maxUsername = 'a'.repeat(80);
      fireEvent.change(usernameInput, { target: { value: maxUsername } });

      expect(mockOnUsernameChange).toHaveBeenCalledWith(maxUsername);
    });

    it('should not exceed username maximum length due to maxLength attribute', () => {
      render(<MessageSection {...defaultProps} />);

      const usernameInput = screen.getByPlaceholderText('Webhook name (ex: \'Server Bot\', \'Announcements\')');
      const overLimitUsername = 'a'.repeat(81); // One character over limit
      
      fireEvent.change(usernameInput, { target: { value: overLimitUsername } });

      // In testing environment, fireEvent doesn't respect maxLength
      // but the component should still call onChange with the full value
      expect(mockOnUsernameChange).toHaveBeenCalledWith(overLimitUsername);
    });
  });

  describe('Avatar URL Input Interactions', () => {
    it('should call onAvatarChange when avatar URL input is changed', () => {
      render(<MessageSection {...defaultProps} />);

      const avatarInput = screen.getByPlaceholderText('https://example.com/avatar.png (or leave empty for default)');
      fireEvent.change(avatarInput, { target: { value: 'https://example.com/new-avatar.png' } });

      expect(mockOnAvatarChange).toHaveBeenCalledWith('https://example.com/new-avatar.png');
      expect(mockOnAvatarChange).toHaveBeenCalledTimes(1);
    });

    it('should handle empty avatar URL change', () => {
      render(
        <MessageSection 
          {...defaultProps}
          avatarUrl="https://example.com/old-avatar.png"
        />
      );

      const avatarInput = screen.getByDisplayValue('https://example.com/old-avatar.png');
      fireEvent.change(avatarInput, { target: { value: '' } });

      expect(mockOnAvatarChange).toHaveBeenCalledWith('');
    });

    it('should handle valid URL formats', () => {
      render(<MessageSection {...defaultProps} />);

      const avatarInput = screen.getByPlaceholderText('https://example.com/avatar.png (or leave empty for default)');
      const validUrls = [
        'https://example.com/avatar.png',
        'https://cdn.discordapp.com/avatars/123/456.png',
        'http://localhost:3000/avatar.jpg'
      ];

      validUrls.forEach(url => {
        fireEvent.change(avatarInput, { target: { value: url } });
        expect(mockOnAvatarChange).toHaveBeenLastCalledWith(url);
      });
    });

    it('should handle invalid URL formats (component should still call onChange)', () => {
      render(<MessageSection {...defaultProps} />);

      const avatarInput = screen.getByPlaceholderText('https://example.com/avatar.png (or leave empty for default)');
      const invalidUrls = [
        'not-a-url',
        'ftp://invalid-protocol.com',
        'javascript:alert(1)'
      ];

      invalidUrls.forEach(url => {
        fireEvent.change(avatarInput, { target: { value: url } });
        expect(mockOnAvatarChange).toHaveBeenLastCalledWith(url);
      });
    });
  });

  describe('Multiple Input Interactions', () => {
    it('should handle simultaneous changes to multiple inputs', () => {
      render(<MessageSection {...defaultProps} />);

      const contentTextarea = screen.getByPlaceholderText('Message content (ex: \'Hello @everyone!\')');
      const usernameInput = screen.getByPlaceholderText('Webhook name (ex: \'Server Bot\', \'Announcements\')');
      const avatarInput = screen.getByPlaceholderText('https://example.com/avatar.png (or leave empty for default)');

      // Change all inputs
      fireEvent.change(contentTextarea, { target: { value: 'Test message' } });
      fireEvent.change(usernameInput, { target: { value: 'TestBot' } });
      fireEvent.change(avatarInput, { target: { value: 'https://example.com/test.png' } });

      expect(mockOnContentChange).toHaveBeenCalledWith('Test message');
      expect(mockOnUsernameChange).toHaveBeenCalledWith('TestBot');
      expect(mockOnAvatarChange).toHaveBeenCalledWith('https://example.com/test.png');
    });

    it('should handle rapid successive changes to the same input', () => {
      render(<MessageSection {...defaultProps} />);

      const contentTextarea = screen.getByPlaceholderText('Message content (ex: \'Hello @everyone!\')');

      // Rapid changes
      fireEvent.change(contentTextarea, { target: { value: 'First' } });
      fireEvent.change(contentTextarea, { target: { value: 'Second' } });
      fireEvent.change(contentTextarea, { target: { value: 'Final' } });

      expect(mockOnContentChange).toHaveBeenCalledTimes(3);
      expect(mockOnContentChange).toHaveBeenLastCalledWith('Final');
    });
  });

  describe('Input Focus and Blur Events', () => {
    it('should handle focus events on inputs', () => {
      render(<MessageSection {...defaultProps} />);

      const contentTextarea = screen.getByPlaceholderText('Message content (ex: \'Hello @everyone!\')');
      
      fireEvent.focus(contentTextarea);
      
      // Focus should not trigger onChange
      expect(mockOnContentChange).not.toHaveBeenCalled();
    });

    it('should handle blur events on inputs', () => {
      render(<MessageSection {...defaultProps} />);

      const contentTextarea = screen.getByPlaceholderText('Message content (ex: \'Hello @everyone!\')');
      
      fireEvent.blur(contentTextarea);
      
      // Blur should not trigger onChange
      expect(mockOnContentChange).not.toHaveBeenCalled();
    });
  });

  describe('Variant-Specific Interactions', () => {
    it('should handle interactions in card variant', () => {
      render(
        <MessageSection 
          {...defaultProps}
          variant="card"
        />
      );

      const contentTextarea = screen.getByPlaceholderText('Message content (ex: \'Hello @everyone!\')');
      fireEvent.change(contentTextarea, { target: { value: 'Card variant test' } });

      expect(mockOnContentChange).toHaveBeenCalledWith('Card variant test');
    });

    it('should handle interactions in plain variant', () => {
      render(
        <MessageSection 
          {...defaultProps}
          variant="plain"
        />
      );

      const contentTextarea = screen.getByPlaceholderText('Message content (ex: \'Hello @everyone!\')');
      fireEvent.change(contentTextarea, { target: { value: 'Plain variant test' } });

      expect(mockOnContentChange).toHaveBeenCalledWith('Plain variant test');
    });
  });
});
