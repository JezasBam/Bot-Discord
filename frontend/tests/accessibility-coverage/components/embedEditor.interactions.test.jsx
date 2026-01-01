import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmbedEditor } from '../../../src/features/embedEditor/components/EmbedEditor';

// Mock the child components to focus on EmbedEditor interactions
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

describe('EmbedEditor User Interactions', () => {
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

  describe('Content Changes', () => {
    it('should handle content change through MessageSection', async () => {
      render(
        <EmbedEditor
          payload={defaultPayload}
          onChange={mockOnChange}
        />
      );

      const changeButton = screen.getByText('Change Content');
      fireEvent.click(changeButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultPayload,
        content: 'new content'
      });
    });

    it('should handle username change through MessageSection', async () => {
      render(
        <EmbedEditor
          payload={defaultPayload}
          onChange={mockOnChange}
        />
      );

      const changeButton = screen.getByText('Change Username');
      fireEvent.click(changeButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultPayload,
        username: 'new username'
      });
    });

    it('should handle avatar URL change through MessageSection', async () => {
      render(
        <EmbedEditor
          payload={defaultPayload}
          onChange={mockOnChange}
        />
      );

      const changeButton = screen.getByText('Change Avatar');
      fireEvent.click(changeButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultPayload,
        avatar_url: 'new avatar'
      });
    });
  });

  describe('Embed Management', () => {
    it('should add new embed when Add Embed button is clicked', async () => {
      render(
        <EmbedEditor
          payload={defaultPayload}
          onChange={mockOnChange}
        />
      );

      const addButton = screen.getByText('Add Embed');
      fireEvent.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultPayload,
        embeds: [{
          id: 'test-embed-id',
          title: '',
          description: '',
          color: 0,
          fields: []
        }]
      });
    });

    it('should not add embed when maximum limit is reached', async () => {
      const payloadWithMaxEmbeds = {
        ...defaultPayload,
        embeds: Array(10).fill(null).map((_, i) => ({
          id: `embed-${i}`,
          title: `Embed ${i}`,
          description: '',
          color: 0,
          fields: []
        }))
      };

      render(
        <EmbedEditor
          payload={payloadWithMaxEmbeds}
          onChange={mockOnChange}
        />
      );

      const addButton = screen.getByText('Add Embed');
      fireEvent.click(addButton);

      // Should not call onChange because limit is reached
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should handle embed update from EmbedSection', async () => {
      const payloadWithEmbed = {
        ...defaultPayload,
        embeds: [{
          id: 'embed-1',
          title: 'Original Title',
          description: 'Original Description',
          color: 0x5865f2,
          fields: []
        }]
      };

      render(
        <EmbedEditor
          payload={payloadWithEmbed}
          onChange={mockOnChange}
        />
      );

      const updateButton = screen.getByText('Update Embed');
      fireEvent.click(updateButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...payloadWithEmbed,
        embeds: [{
          id: 'embed-1',
          title: 'Updated Title',
          description: 'Original Description',
          color: 0x5865f2,
          fields: []
        }]
      });
    });

    it('should handle embed removal from EmbedSection', async () => {
      const payloadWithEmbed = {
        ...defaultPayload,
        embeds: [{
          id: 'embed-1',
          title: 'Test Embed',
          description: '',
          color: 0,
          fields: []
        }]
      };

      render(
        <EmbedEditor
          payload={payloadWithEmbed}
          onChange={mockOnChange}
        />
      );

      const removeButton = screen.getByText('Remove Embed');
      fireEvent.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith({
        ...defaultPayload,
        embeds: []
      });
    });

    it('should handle embed move up from EmbedSection', async () => {
      const payloadWithTwoEmbeds = {
        ...defaultPayload,
        embeds: [
          {
            id: 'embed-1',
            title: 'First Embed',
            description: '',
            color: 0,
            fields: []
          },
          {
            id: 'embed-2',
            title: 'Second Embed',
            description: '',
            color: 0,
            fields: []
          }
        ]
      };

      render(
        <EmbedEditor
          payload={payloadWithTwoEmbeds}
          onChange={mockOnChange}
        />
      );

      const moveUpButtons = screen.getAllByText('Move Up');
      fireEvent.click(moveUpButtons[1]); // Move second embed up

      expect(mockOnChange).toHaveBeenCalledWith({
        ...payloadWithTwoEmbeds,
        embeds: [
          {
            id: 'embed-2',
            title: 'Second Embed',
            description: '',
            color: 0,
            fields: []
          },
          {
            id: 'embed-1',
            title: 'First Embed',
            description: '',
            color: 0,
            fields: []
          }
        ]
      });
    });

    it('should handle embed move down from EmbedSection', async () => {
      const payloadWithTwoEmbeds = {
        ...defaultPayload,
        embeds: [
          {
            id: 'embed-1',
            title: 'First Embed',
            description: '',
            color: 0,
            fields: []
          },
          {
            id: 'embed-2',
            title: 'Second Embed',
            description: '',
            color: 0,
            fields: []
          }
        ]
      };

      render(
        <EmbedEditor
          payload={payloadWithTwoEmbeds}
          onChange={mockOnChange}
        />
      );

      const moveDownButtons = screen.getAllByText('Move Down');
      fireEvent.click(moveDownButtons[0]); // Move first embed down

      expect(mockOnChange).toHaveBeenCalledWith({
        ...payloadWithTwoEmbeds,
        embeds: [
          {
            id: 'embed-2',
            title: 'Second Embed',
            description: '',
            color: 0,
            fields: []
          },
          {
            id: 'embed-1',
            title: 'First Embed',
            description: '',
            color: 0,
            fields: []
          }
        ]
      });
    });
  });

  describe('Project Section', () => {
    it('should toggle project section expansion', async () => {
      render(
        <EmbedEditor
          payload={defaultPayload}
          onChange={mockOnChange}
          projectName="Test Project"
          onNameChange={mockOnNameChange}
        />
      );

      // Initially expanded - project name input should be visible
      expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();

      // Find and click the toggle button (the header with "Project" text)
      const toggleButton = screen.getByText('Project').closest('div').parentElement;
      
      fireEvent.click(toggleButton);

      // After collapse, the project name input should no longer be visible
      expect(screen.queryByDisplayValue('Test Project')).not.toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    it('should call onSave when save button is clicked', async () => {
      render(
        <EmbedEditor
          payload={defaultPayload}
          onChange={mockOnChange}
          onSave={mockOnSave}
          saveLabel="Save Changes"
        />
      );

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });

    it('should show loading state when saveStatus is saving', () => {
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

    it('should show success state when saveStatus is success', () => {
      render(
        <EmbedEditor
          payload={defaultPayload}
          onChange={mockOnChange}
          onSave={mockOnSave}
          saveStatus="success"
        />
      );

      expect(screen.getByText('Saved!')).toBeInTheDocument();
    });

    it('should show error state when saveStatus is error', () => {
      render(
        <EmbedEditor
          payload={defaultPayload}
          onChange={mockOnChange}
          onSave={mockOnSave}
          saveStatus="error"
          saveError="Failed to save"
        />
      );

      expect(screen.getByText('Failed to save')).toBeInTheDocument();
    });
  });

  describe('Project Name Changes', () => {
    it('should handle project name change', async () => {
      render(
        <EmbedEditor
          payload={defaultPayload}
          onChange={mockOnChange}
          projectName="Test Project"
          onNameChange={mockOnNameChange}
        />
      );

      const projectInput = screen.getByDisplayValue('Test Project');
      fireEvent.change(projectInput, { target: { value: 'New Project Name' } });

      expect(mockOnNameChange).toHaveBeenCalledWith('New Project Name');
    });
  });
});
