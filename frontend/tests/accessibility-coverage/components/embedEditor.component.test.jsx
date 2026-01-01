import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmbedEditor } from '../../../src/features/embedEditor/components/EmbedEditor';

// Mock the child components to focus on EmbedEditor logic
vi.mock('../../../src/features/embedEditor/components/MessageSection', () => ({
  MessageSection: vi.fn(({ content, username, avatarUrl, onContentChange, onUsernameChange, onAvatarChange }) => (
    <div data-testid="message-section">
      <div data-testid="content">{content}</div>
      <div data-testid="username">{username}</div>
      <div data-testid="avatar-url">{avatarUrl}</div>
      <button onClick={() => onContentChange('new content')}>Change Content</button>
      <button onClick={() => onUsernameChange('new username')}>Change Username</button>
      <button onClick={() => onAvatarChange('new avatar')}>Change Avatar</button>
    </div>
  ))
}));

vi.mock('../../../src/features/embedEditor/components/EmbedSection', () => ({
  EmbedSection: vi.fn(({ _embed, index, onChange, onRemove, onMove }) => (
    <div data-testid="embed-section" data-index={index}>
      <div data-testid="embed-title">{_embed.title}</div>
      <div data-testid="embed-description">{_embed.description}</div>
      <button onClick={() => onChange({ ..._embed, title: 'Updated Title' })}>Update Embed</button>
      <button onClick={() => onRemove()}>Remove Embed</button>
      <button onClick={() => onMove('up')}>Move Up</button>
      <button onClick={() => onMove('down')}>Move Down</button>
    </div>
  ))
}));

vi.mock('../../../src/features/embedEditor/utils/payload', () => ({
  createEmptyEmbed: vi.fn(() => ({
    id: 'test-embed-id',
    title: '',
    description: '',
    color: 0,
    fields: []
  }))
}));

describe('EmbedEditor Component Rendering', () => {
  const mockOnChange = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnNameChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultPayload = {
    content: '',
    username: '',
    avatar_url: '',
    embeds: []
  };

  it('should render without crashing', () => {
    render(
      <EmbedEditor
        payload={defaultPayload}
        onChange={mockOnChange}
      />
    );
    
    // Component should render without throwing
    expect(screen.getByTestId('message-section')).toBeInTheDocument();
  });

  it('should render with initial payload data', () => {
    const payloadWithData = {
      content: 'Test content',
      username: 'TestUser',
      avatar_url: 'https://example.com/avatar.png',
      embeds: []
    };

    render(
      <EmbedEditor
        payload={payloadWithData}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByTestId('content')).toHaveTextContent('Test content');
    expect(screen.getByTestId('username')).toHaveTextContent('TestUser');
    expect(screen.getByTestId('avatar-url')).toHaveTextContent('https://example.com/avatar.png');
  });

  it('should render project name when provided', () => {
    render(
      <EmbedEditor
        payload={defaultPayload}
        onChange={mockOnChange}
        projectName="Test Project"
        onNameChange={mockOnNameChange}
      />
    );

    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
  });

  it('should render save button when onSave prop is provided', () => {
    render(
      <EmbedEditor
        payload={defaultPayload}
        onChange={mockOnChange}
        onSave={mockOnSave}
        saveLabel="Save Changes"
      />
    );

    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('should not render save button when onSave prop is not provided', () => {
    render(
      <EmbedEditor
        payload={defaultPayload}
        onChange={mockOnChange}
      />
    );

    expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
  });

  it('should render embed sections when embeds exist', () => {
    const payloadWithEmbeds = {
      content: '',
      username: '',
      avatar_url: '',
      embeds: [
        {
          id: 'embed-1',
          title: 'First Embed',
          description: 'First description',
          color: 0x5865f2,
          fields: []
        },
        {
          id: 'embed-2',
          title: 'Second Embed',
          description: 'Second description',
          color: 0x57f287,
          fields: []
        }
      ]
    };

    render(
      <EmbedEditor
        payload={payloadWithEmbeds}
        onChange={mockOnChange}
      />
    );

    const embedSections = screen.getAllByTestId('embed-section');
    expect(embedSections).toHaveLength(2);
    expect(screen.getByText('First Embed')).toBeInTheDocument();
    expect(screen.getByText('Second Embed')).toBeInTheDocument();
  });

  it('should render empty state when no embeds exist', () => {
    render(
      <EmbedEditor
        payload={defaultPayload}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('No embeds yet. Click "Add Embed" to create one.')).toBeInTheDocument();
  });

  it('should render add embed button', () => {
    render(
      <EmbedEditor
        payload={defaultPayload}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('Add Embed')).toBeInTheDocument();
  });

  it('should render save status when provided', () => {
    render(
      <EmbedEditor
        payload={defaultPayload}
        onChange={mockOnChange}
        onSave={mockOnSave}
        saveStatus="saving"
      />
    );

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should render save error when provided', () => {
    render(
      <EmbedEditor
        payload={defaultPayload}
        onChange={mockOnChange}
        onSave={mockOnSave}
        saveError="Failed to save"
      />
    );

    expect(screen.getByText('Failed to save')).toBeInTheDocument();
  });

  it('should render with custom save label', () => {
    render(
      <EmbedEditor
        payload={defaultPayload}
        onChange={mockOnChange}
        onSave={mockOnSave}
        saveLabel="Publish Changes"
      />
    );

    expect(screen.getByText('Publish Changes')).toBeInTheDocument();
  });
});
