import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Importăm componentele reale pentru integrare
import { EmbedEditor } from '../../../src/features/embedEditor/components/EmbedEditor';
import { MessageSection } from '../../../src/features/embedEditor/components/MessageSection';
import { EmbedSection } from '../../../src/features/embedEditor/components/EmbedSection';
import { EmbedFieldsEditor } from '../../../src/features/embedEditor/components/EmbedFieldsEditor';

// Mock-uri minime pentru dependențe externe
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

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('EmbedEditor + MessageSection Integration', () => {
    it('should sync content changes between parent and child', async () => {
      const mockOnChange = vi.fn();
      const initialPayload = {
        content: '',
        username: '',
        avatar_url: '',
        embeds: []
      };
      
      render(
        <EmbedEditor 
          payload={initialPayload}
          onChange={mockOnChange}
        />
      );

      // Găsim textarea-ul pentru conținut
      const contentTextarea = screen.getByPlaceholderText('Message content (ex: \'Hello @everyone!\')');
      
      // Simulăm schimbarea conținutului
      fireEvent.change(contentTextarea, { target: { value: 'Hello world!' } });
      
      // Verificăm că onChange a fost apelat cu payload-ul actualizat
      expect(mockOnChange).toHaveBeenCalledWith({
        ...initialPayload,
        content: 'Hello world!'
      });
    });

    it('should sync username changes', async () => {
      const mockOnChange = vi.fn();
      const initialPayload = {
        content: '',
        username: '',
        avatar_url: '',
        embeds: []
      };
      
      render(
        <EmbedEditor 
          payload={initialPayload}
          onChange={mockOnChange}
        />
      );

      // Găsim input-ul pentru username
      const usernameInput = screen.getByPlaceholderText('Webhook name (ex: \'Server Bot\', \'Announcements\')');
      
      // Simulăm schimbarea username-ului
      fireEvent.change(usernameInput, { target: { value: 'TestBot' } });
      
      // Verificăm că onChange a fost apelat
      expect(mockOnChange).toHaveBeenCalledWith({
        ...initialPayload,
        username: 'TestBot'
      });
    });
  });

  describe('EmbedEditor + EmbedSection Integration', () => {
    it('should handle embed creation and editing', async () => {
      const mockOnChange = vi.fn();
      const initialPayload = {
        content: 'Test message',
        username: 'TestBot',
        avatar_url: '',
        embeds: []
      };
      
      render(
        <EmbedEditor 
          payload={initialPayload}
          onChange={mockOnChange}
        />
      );

      // Găsim butonul "Add Embed"
      const addEmbedButton = screen.getByText('Add Embed');
      expect(addEmbedButton).toBeInTheDocument();
      
      // Simulăm click pe "Add Embed"
      fireEvent.click(addEmbedButton);
      
      // Verificăm că onChange a fost apelat cu un embed nou
      expect(mockOnChange).toHaveBeenCalled();
      
      // Verificăm că payload-ul actualizat conține un embed
      const updatedPayload = mockOnChange.mock.calls[0][0];
      expect(updatedPayload.embeds).toHaveLength(1);
      expect(updatedPayload.embeds[0]).toHaveProperty('id');
    });
  });

  describe('EmbedSection + EmbedFieldsEditor Integration', () => {
    it('should handle field addition and removal', async () => {
      const mockOnChange = vi.fn();
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
          onRemove={vi.fn()}
          onMove={vi.fn()}
        />
      );

      // Găsim butonul "Add Field"
      const addFieldButton = screen.getByText('Add Field');
      expect(addFieldButton).toBeInTheDocument();
      
      // Simulăm adăugarea unui field
      fireEvent.click(addFieldButton);
      
      // Verificăm că onChange a fost apelat
      expect(mockOnChange).toHaveBeenCalled();
      
      // Verificăm că embed-ul actualizat conține un field
      const updatedEmbed = mockOnChange.mock.calls[0][0];
      expect(updatedEmbed.fields).toHaveLength(1);
    });
  });

  describe('Complex Workflow Integration', () => {
    it('should handle complete message creation workflow', async () => {
      const mockOnChange = vi.fn();
      const initialPayload = {
        content: '',
        username: '',
        avatar_url: '',
        embeds: []
      };
      
      render(
        <EmbedEditor 
          payload={initialPayload}
          onChange={mockOnChange}
        />
      );

      // Pasul 1: Adăugăm conținut mesajului
      const contentTextarea = screen.getByPlaceholderText('Message content (ex: \'Hello @everyone!\')');
      fireEvent.change(contentTextarea, { target: { value: 'Hello @everyone!' } });
      
      // Pasul 2: Adăugăm username
      const usernameInput = screen.getByPlaceholderText('Webhook name (ex: \'Server Bot\', \'Announcements\')');
      fireEvent.change(usernameInput, { target: { value: 'Announcement Bot' } });
      
      // Pasul 3: Adăugăm un embed
      const addEmbedButton = screen.getByText('Add Embed');
      fireEvent.click(addEmbedButton);
      
      // Verificăm că schimbările au fost capturate
      expect(mockOnChange).toHaveBeenCalledTimes(3);
      
      // Verificăm payload-ul final
      const finalPayload = mockOnChange.mock.calls[2][0];
      expect(finalPayload.embeds).toHaveLength(1);
      expect(finalPayload.embeds[0]).toHaveProperty('id');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid payload gracefully', async () => {
      const mockOnChange = vi.fn();
      const invalidPayload = {
        content: '',
        username: '',
        avatar_url: '',
        embeds: [
          { id: 'embed1' } // Embed fără title/description/fields
        ]
      };
      
      render(
        <EmbedEditor 
          payload={invalidPayload}
          onChange={mockOnChange}
        />
      );

      // Verificăm că componenta se randează chiar și cu payload invalid
      expect(screen.getByText('Message')).toBeInTheDocument();
      expect(screen.getByText(/Embeds/)).toBeInTheDocument();
      
      // Verificăm că embed-ul invalid este afișat
      const titleInputs = screen.getAllByDisplayValue('');
      expect(titleInputs.length).toBeGreaterThan(0); // Există input-uri goale
    });
  });
});
