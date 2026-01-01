import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Importăm componentele reale
import { ChannelsSidebar } from '../../../src/features/discord/components/ChannelsSidebar';
import { EmbedEditor } from '../../../src/features/embedEditor/components/EmbedEditor';
import { EmbedFieldsEditor } from '../../../src/features/embedEditor/components/EmbedFieldsEditor';
import { EmbedSection } from '../../../src/features/embedEditor/components/EmbedSection';
import { MessageSection } from '../../../src/features/embedEditor/components/MessageSection';
import { ColorPicker } from '../../../src/features/embedEditor/components/ColorPicker';
import { BotProfileEditor } from '../../../src/features/discord/components/BotProfileEditor';

// Mock-uri minime doar pentru dependențe externe
vi.mock('../../../src/api/client', () => ({
  api: {
    getGuilds: vi.fn(() => Promise.resolve([])),
    getGuildChannels: vi.fn(() => Promise.resolve({ categories: [], uncategorized: [] })),
    getChannelMessages: vi.fn(() => Promise.resolve([])),
    sendMessage: vi.fn(() => Promise.resolve({})),
  }
}));

vi.mock('../../../src/hooks/useSocket', () => ({
  useSocket: vi.fn(() => ({ socket: null, connected: false }))
}));

vi.mock('../../../src/features/projects/hooks/useProjects', () => ({
  useProjects: vi.fn(() => ({ projects: [], createProject: vi.fn(), updateProject: vi.fn(), deleteProject: vi.fn() }))
}));

vi.mock('../../../src/features/projects/hooks/useCurrentProject', () => ({
  useCurrentProject: vi.fn(() => ({ project: null, setProject: vi.fn() }))
}));

describe('Real Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ChannelsSidebar', () => {
    it('should render with empty guilds', () => {
      const mockOnChannelSelect = vi.fn();
      
      render(
        <ChannelsSidebar 
          guilds={[]}
          onChannelSelect={mockOnChannelSelect}
        />
      );

      // Verificăm că componenta se randează
      expect(screen.getByText('Connect to see channels')).toBeInTheDocument();
    });

    it('should render with guilds', () => {
      const mockOnChannelSelect = vi.fn();
      const mockGuilds = [
        { id: 'guild1', name: 'Test Guild', icon: null, memberCount: 100 }
      ];
      
      render(
        <ChannelsSidebar 
          guilds={mockGuilds}
          onChannelSelect={mockOnChannelSelect}
        />
      );

      expect(screen.getByText('Connect to see channels')).toBeInTheDocument();
    });
  });

  describe('MessageSection', () => {
    it('should render and handle content changes', () => {
      const mockOnContentChange = vi.fn();
      const mockOnUsernameChange = vi.fn();
      const mockOnAvatarChange = vi.fn();
      
      render(
        <MessageSection 
          content=""
          username=""
          avatarUrl=""
          onContentChange={mockOnContentChange}
          onUsernameChange={mockOnUsernameChange}
          onAvatarChange={mockOnAvatarChange}
        />
      );

      // Verificăm că textarea-urile există
      const contentTextarea = screen.getByPlaceholderText('Message content (ex: \'Hello @everyone!\')');
      const usernameInput = screen.getByPlaceholderText('Webhook name (ex: \'Server Bot\', \'Announcements\')');
      
      expect(contentTextarea).toBeInTheDocument();
      expect(usernameInput).toBeInTheDocument();

      // Testăm schimbarea conținutului
      fireEvent.change(contentTextarea, { target: { value: 'Hello world' } });
      expect(mockOnContentChange).toHaveBeenCalledWith('Hello world');
    });

    it('should handle username changes', () => {
      const mockOnContentChange = vi.fn();
      const mockOnUsernameChange = vi.fn();
      const mockOnAvatarChange = vi.fn();
      
      render(
        <MessageSection 
          content=""
          username=""
          avatarUrl=""
          onContentChange={mockOnContentChange}
          onUsernameChange={mockOnUsernameChange}
          onAvatarChange={mockOnAvatarChange}
        />
      );

      const usernameInput = screen.getByPlaceholderText('Webhook name (ex: \'Server Bot\', \'Announcements\')');
      fireEvent.change(usernameInput, { target: { value: 'TestBot' } });
      expect(mockOnUsernameChange).toHaveBeenCalledWith('TestBot');
    });
  });

  describe('EmbedSection', () => {
    it('should render with embed', () => {
      const mockOnChange = vi.fn();
      const mockOnRemove = vi.fn();
      const mockOnMove = vi.fn();
      const mockEmbed = {
        id: 'embed1',
        title: 'Test Embed',
        description: 'Test Description',
        color: 0x5865f2,
        fields: []
      };
      
      render(
        <EmbedSection 
          _embed={mockEmbed}
          index={0}
          total={1}
          onChange={mockOnChange}
          onRemove={mockOnRemove}
          onMove={mockOnMove}
        />
      );

      expect(screen.getByDisplayValue('Test Embed')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
    });
  });

  describe('EmbedEditor', () => {
    it('should render with empty payload', () => {
      const mockOnChange = vi.fn();
      const mockPayload = {
        content: '',
        username: '',
        avatar_url: '',
        embeds: []
      };
      
      render(
        <EmbedEditor 
          payload={mockPayload}
          onChange={mockOnChange}
        />
      );

      // Verificăm că componenta principală se randează
      expect(screen.getByText('Message')).toBeInTheDocument();
      expect(screen.getByText(/Embeds/)).toBeInTheDocument();
    });

    it('should render with embeds', () => {
      const mockOnChange = vi.fn();
      const mockPayload = {
        content: 'Test message',
        username: 'TestBot',
        avatar_url: '',
        embeds: [
          { id: 'embed1', title: 'Test Embed', description: 'Test Description' }
        ]
      };
      
      render(
        <EmbedEditor 
          payload={mockPayload}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByDisplayValue('Test message')).toBeInTheDocument();
    });
  });

  describe('EmbedFieldsEditor', () => {
    it('should render with empty fields', () => {
      const mockOnChange = vi.fn();
      
      render(
        <EmbedFieldsEditor 
          _fields={[]}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('No _fields added yet.')).toBeInTheDocument();
    });

    it('should render with fields', () => {
      const mockOnChange = vi.fn();
      const mockFields = [
        { name: 'Field 1', value: 'Value 1', inline: false }
      ];
      
      render(
        <EmbedFieldsEditor 
          _fields={mockFields}
          onChange={mockOnChange}
        />
      );

      expect(screen.getByDisplayValue('Field 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Value 1')).toBeInTheDocument();
    });
  });

  describe('ColorPicker', () => {
    it('should render and handle color changes', () => {
      const mockOnChange = vi.fn();
      
      render(
        <ColorPicker 
          _color={0x5865f2}
          onChange={mockOnChange}
        />
      );

      // Verificăm că input-ul de culoare există
      const colorInputs = screen.getAllByDisplayValue('#5865f2');
      expect(colorInputs).toHaveLength(2);
      const colorInput = colorInputs[0]; // Primul element (text input)
      expect(colorInput).toBeInTheDocument();
      
      // Testăm schimbarea culorii
      fireEvent.change(colorInput, { target: { value: '#FF0000' } });
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('BotProfileEditor', () => {
    it('should render and handle profile updates', () => {
      const mockOnUpdate = vi.fn();
      const mockOnClose = vi.fn();
      const mockProfile = {
        id: 'bot1',
        username: 'CurrentBot',
        tag: 'CurrentBot#1234',
        avatarUrl: 'https://example.com/avatar.png'
      };
      
      render(
        <BotProfileEditor 
          isOpen={true}
          onClose={mockOnClose}
          currentProfile={mockProfile}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByDisplayValue('CurrentBot')).toBeInTheDocument();
    });

    it('should render with empty profile', () => {
      const mockOnUpdate = vi.fn();
      const mockOnClose = vi.fn();
      
      render(
        <BotProfileEditor 
          isOpen={true}
          onClose={mockOnClose}
          currentProfile={null}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByPlaceholderText('Enter bot username')).toBeInTheDocument();
    });
  });
});
