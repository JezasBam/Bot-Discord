import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageSection } from '../../../src/features/embedEditor/components/MessageSection';

describe('MessageSection Component Rendering', () => {
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

  it('should render without crashing', () => {
    render(<MessageSection {...defaultProps} />);
    
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('should render with initial content', () => {
    render(
      <MessageSection 
        {...defaultProps}
        content="Test message content"
      />
    );

    const contentTextarea = screen.getByDisplayValue('Test message content');
    expect(contentTextarea).toBeInTheDocument();
    expect(contentTextarea).toHaveAttribute('placeholder', 'Message content (ex: \'Hello @everyone!\')');
  });

  it('should render with initial username', () => {
    render(
      <MessageSection 
        {...defaultProps}
        username="TestBot"
      />
    );

    const usernameInput = screen.getByDisplayValue('TestBot');
    expect(usernameInput).toBeInTheDocument();
    expect(usernameInput).toHaveAttribute('placeholder', 'Webhook name (ex: \'Server Bot\', \'Announcements\')');
  });

  it('should render with initial avatar URL', () => {
    render(
      <MessageSection 
        {...defaultProps}
        avatarUrl="https://example.com/avatar.png"
      />
    );

    const avatarInput = screen.getByDisplayValue('https://example.com/avatar.png');
    expect(avatarInput).toBeInTheDocument();
    expect(avatarInput).toHaveAttribute('placeholder', 'https://example.com/avatar.png (or leave empty for default)');
  });

  it('should display content character count', () => {
    render(
      <MessageSection 
        {...defaultProps}
        content="Hello world"
      />
    );

    // Find the character count span within the content label
    const contentLabel = screen.getByText('Content').closest('label');
    const countSpan = contentLabel.querySelector('.text-discord-muted');
    expect(countSpan).toHaveTextContent('(11/2000)');
  });

  
  it('should render with card variant by default', () => {
    render(<MessageSection {...defaultProps} />);

    const section = screen.getByText('Message').closest('section');
    expect(section).toHaveClass('bg-discord-dark', 'rounded-lg', 'p-4');
  });

  it('should render with plain variant when specified', () => {
    render(
      <MessageSection 
        {...defaultProps}
        variant="plain"
      />
    );

    const section = screen.getByText('Message').closest('section');
    expect(section).toHaveClass('space-y-4');
    expect(section).not.toHaveClass('bg-discord-dark', 'rounded-lg', 'p-4');
  });

  it('should have proper input attributes for content textarea', () => {
    render(<MessageSection {...defaultProps} />);

    const contentTextarea = screen.getByPlaceholderText('Message content (ex: \'Hello @everyone!\')');
    expect(contentTextarea).toHaveAttribute('maxLength', '2000');
    expect(contentTextarea).toHaveAttribute('rows', '4');
    expect(contentTextarea).toHaveClass('input', 'resize-y');
  });

  it('should have proper input attributes for username input', () => {
    render(<MessageSection {...defaultProps} />);

    const usernameInput = screen.getByPlaceholderText('Webhook name (ex: \'Server Bot\', \'Announcements\')');
    expect(usernameInput).toHaveAttribute('type', 'text');
    expect(usernameInput).toHaveAttribute('maxLength', '80');
    expect(usernameInput).toHaveClass('input');
  });

  it('should have proper input attributes for avatar URL input', () => {
    render(<MessageSection {...defaultProps} />);

    const avatarInput = screen.getByPlaceholderText('https://example.com/avatar.png (or leave empty for default)');
    expect(avatarInput).toHaveAttribute('type', 'url');
    expect(avatarInput).toHaveClass('input');
  });

  it('should display zero character counts for empty content', () => {
    render(<MessageSection {...defaultProps} />);

    const contentLabel = screen.getByText('Content').closest('label');
    const countSpan = contentLabel.querySelector('.text-discord-muted');
    expect(countSpan).toHaveTextContent('(0/2000)');
  });

  it('should handle maximum character counts display', () => {
    const longContent = 'a'.repeat(2000);

    render(
      <MessageSection 
        {...defaultProps}
        content={longContent}
      />
    );

    const contentLabel = screen.getByText('Content').closest('label');
    const countSpan = contentLabel.querySelector('.text-discord-muted');
    expect(countSpan).toHaveTextContent('(2000/2000)');
  });

  it('should render all form labels correctly', () => {
    render(<MessageSection {...defaultProps} />);

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Username Override')).toBeInTheDocument();
    expect(screen.getByText('Avatar URL')).toBeInTheDocument();
  });

  it('should have proper form structure', () => {
    render(<MessageSection {...defaultProps} />);

    const contentTextarea = screen.getByPlaceholderText('Message content (ex: \'Hello @everyone!\')');
    const usernameInput = screen.getByPlaceholderText('Webhook name (ex: \'Server Bot\', \'Announcements\')');
    const avatarInput = screen.getByPlaceholderText('https://example.com/avatar.png (or leave empty for default)');

    // Check that inputs exist and are properly structured
    expect(contentTextarea).toBeInTheDocument();
    expect(usernameInput).toBeInTheDocument();
    expect(avatarInput).toBeInTheDocument();
  });
});
