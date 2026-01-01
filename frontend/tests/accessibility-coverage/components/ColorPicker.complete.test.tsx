import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ColorPicker } from '../../../src/features/embedEditor/components/ColorPicker';

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

describe('ColorPicker Component - 100% Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with initial color', () => {
    const mockOnChange = vi.fn();
    
    render(<ColorPicker _color={0x5865f2} onChange={mockOnChange} />);
    
    // Verificăm label-ul
    expect(screen.getByText('Embed Color')).toBeInTheDocument();
    
    // Verificăm input-urile folosind getAllByDisplayValue
    const colorInputs = screen.getAllByDisplayValue('#5865f2');
    expect(colorInputs).toHaveLength(2);
    
    // Primul ar trebui să fie input-ul de tip color
    expect(colorInputs[0]).toHaveAttribute('type', 'color');
    
    // Al doilea ar trebui să fie input-ul text
    expect(colorInputs[1]).toHaveAttribute('type', 'text');
    expect(colorInputs[1]).toHaveAttribute('placeholder', '#5865f2');
  });

  it('should handle color input change', () => {
    const mockOnChange = vi.fn();
    
    render(<ColorPicker _color={0x5865f2} onChange={mockOnChange} />);
    
    // Găsim input-ul de tip color
    const colorInputs = screen.getAllByDisplayValue('#5865f2');
    const colorInput = colorInputs.find(input => input.getAttribute('type') === 'color');
    
    // Simulăm schimbare culoare
    fireEvent.change(colorInput!, { target: { value: '#FF0000' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(0xFF0000);
  });

  it('should handle text input change with valid hex', () => {
    const mockOnChange = vi.fn();
    
    render(<ColorPicker _color={0x5865f2} onChange={mockOnChange} />);
    
    // Găsim input-ul text
    const colorInputs = screen.getAllByDisplayValue('#5865f2');
    const textInput = colorInputs.find(input => input.getAttribute('type') === 'text');
    
    // Simulăm schimbare validă
    fireEvent.change(textInput!, { target: { value: '#00FF00' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(0x00FF00);
  });

  it('should handle text input change with invalid hex', () => {
    const mockOnChange = vi.fn();
    
    render(<ColorPicker _color={0x5865f2} onChange={mockOnChange} />);
    
    // Găsim input-ul text
    const colorInputs = screen.getAllByDisplayValue('#5865f2');
    const textInput = colorInputs.find(input => input.getAttribute('type') === 'text');
    
    // Simulăm schimbare invalidă
    fireEvent.change(textInput!, { target: { value: 'invalid' } });
    
    // Nu ar trebui să fie apelat onChange
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should handle text input change with partial hex', () => {
    const mockOnChange = vi.fn();
    
    render(<ColorPicker _color={0x5865f2} onChange={mockOnChange} />);
    
    // Găsim input-ul text
    const colorInputs = screen.getAllByDisplayValue('#5865f2');
    const textInput = colorInputs.find(input => input.getAttribute('type') === 'text');
    
    // Simulăm schimbare parțială
    fireEvent.change(textInput!, { target: { value: '#123' } });
    
    // Nu ar trebui să fie apelat onChange
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should handle text input change with lowercase hex', () => {
    const mockOnChange = vi.fn();
    
    render(<ColorPicker _color={0x5865f2} onChange={mockOnChange} />);
    
    // Găsim input-ul text
    const colorInputs = screen.getAllByDisplayValue('#5865f2');
    const textInput = colorInputs.find(input => input.getAttribute('type') === 'text');
    
    // Simulăm schimbare cu lowercase
    fireEvent.change(textInput!, { target: { value: '#ff0000' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(0xFF0000);
  });

  it('should render all preset color buttons', () => {
    const mockOnChange = vi.fn();
    
    render(<ColorPicker _color={0x5865f2} onChange={mockOnChange} />);
    
    // Verificăm că există 8 preset colors
    const presetButtons = screen.getAllByRole('button');
    expect(presetButtons).toHaveLength(8);
    
    // Verificăm culorile preset
    expect(presetButtons[0]).toHaveStyle('background-color: #5865f2');
    expect(presetButtons[1]).toHaveStyle('background-color: #57f287');
    expect(presetButtons[2]).toHaveStyle('background-color: #fee75c');
    expect(presetButtons[3]).toHaveStyle('background-color: #eb459e');
    expect(presetButtons[4]).toHaveStyle('background-color: #ed4245');
    expect(presetButtons[5]).toHaveStyle('background-color: #ffffff');
    expect(presetButtons[6]).toHaveStyle('background-color: #23272a');
    expect(presetButtons[7]).toHaveStyle('background-color: #2f3136');
  });

  it('should handle preset color button clicks', () => {
    const mockOnChange = vi.fn();
    
    render(<ColorPicker _color={0x5865f2} onChange={mockOnChange} />);
    
    // Găsim toate butoanele preset
    const presetButtons = screen.getAllByRole('button');
    
    // Testăm click pe primul preset (Blurple)
    fireEvent.click(presetButtons[0]);
    expect(mockOnChange).toHaveBeenCalledWith(0x5865f2);
    
    // Resetăm mock
    mockOnChange.mockClear();
    
    // Testăm click pe al doilea preset (Green)
    fireEvent.click(presetButtons[1]);
    expect(mockOnChange).toHaveBeenCalledWith(0x57f287);
    
    // Resetăm mock
    mockOnChange.mockClear();
    
    // Testăm click pe Red preset
    fireEvent.click(presetButtons[4]);
    expect(mockOnChange).toHaveBeenCalledWith(0xed4245);
    
    // Resetăm mock
    mockOnChange.mockClear();
    
    // Testăm click pe White preset
    fireEvent.click(presetButtons[5]);
    expect(mockOnChange).toHaveBeenCalledWith(0xffffff);
    
    // Resetăm mock
    mockOnChange.mockClear();
    
    // Testăm click pe Dark preset
    fireEvent.click(presetButtons[6]);
    expect(mockOnChange).toHaveBeenCalledWith(0x23272a);
  });

  it('should handle zero color', () => {
    const mockOnChange = vi.fn();
    
    render(<ColorPicker _color={0} onChange={mockOnChange} />);
    
    // Verificăm că afișează #000000
    const colorInputs = screen.getAllByDisplayValue('#000000');
    expect(colorInputs).toHaveLength(2);
  });

  it('should handle maximum color value', () => {
    const mockOnChange = vi.fn();
    
    render(<ColorPicker _color={0xFFFFFF} onChange={mockOnChange} />);
    
    // Verificăm că afișează #ffffff
    const colorInputs = screen.getAllByDisplayValue('#ffffff');
    expect(colorInputs).toHaveLength(2);
  });

  it('should have proper accessibility attributes', () => {
    const mockOnChange = vi.fn();
    
    render(<ColorPicker _color={0x5865f2} onChange={mockOnChange} />);
    
    // Verificăm title attributes pe preset buttons
    const presetButtons = screen.getAllByRole('button');
    expect(presetButtons[0]).toHaveAttribute('title', '#5865f2');
    expect(presetButtons[1]).toHaveAttribute('title', '#57f287');
    expect(presetButtons[2]).toHaveAttribute('title', '#fee75c');
  });

  it('should handle edge case hex without #', () => {
    const mockOnChange = vi.fn();
    
    render(<ColorPicker _color={0x5865f2} onChange={mockOnChange} />);
    
    // Găsim input-ul text
    const colorInputs = screen.getAllByDisplayValue('#5865f2');
    const textInput = colorInputs.find(input => input.getAttribute('type') === 'text');
    
    // Simulăm schimbare fără #
    fireEvent.change(textInput!, { target: { value: 'FF0000' } });
    
    // Nu ar trebui să fie apelat onChange
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should handle edge case hex with too many characters', () => {
    const mockOnChange = vi.fn();
    
    render(<ColorPicker _color={0x5865f2} onChange={mockOnChange} />);
    
    // Găsim input-ul text
    const colorInputs = screen.getAllByDisplayValue('#5865f2');
    const textInput = colorInputs.find(input => input.getAttribute('type') === 'text');
    
    // Simulăm schimbare cu prea multe caractere
    fireEvent.change(textInput!, { target: { value: '#FF0000FF' } });
    
    // Nu ar trebui să fie apelat onChange
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should handle edge case hex with invalid characters', () => {
    const mockOnChange = vi.fn();
    
    render(<ColorPicker _color={0x5865f2} onChange={mockOnChange} />);
    
    // Găsim input-ul text
    const colorInputs = screen.getAllByDisplayValue('#5865f2');
    const textInput = colorInputs.find(input => input.getAttribute('type') === 'text');
    
    // Simulăm schimbare cu caractere invalide
    fireEvent.change(textInput!, { target: { value: '#GGGGGG' } });
    
    // Nu ar trebui să fie apelat onChange
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should handle color 0x000000 (black)', () => {
    const mockOnChange = vi.fn();
    
    render(<ColorPicker _color={0x000000} onChange={mockOnChange} />);
    
    // Verificăm că afișează #000000
    const colorInputs = screen.getAllByDisplayValue('#000000');
    expect(colorInputs).toHaveLength(2);
    
    // Testăm schimbare la alb
    const colorInput = colorInputs.find(input => input.getAttribute('type') === 'color');
    fireEvent.change(colorInput!, { target: { value: '#FFFFFF' } });
    expect(mockOnChange).toHaveBeenCalledWith(0xFFFFFF);
  });

  it('should handle color 0x808080 (gray)', () => {
    const mockOnChange = vi.fn();
    
    render(<ColorPicker _color={0x808080} onChange={mockOnChange} />);
    
    // Verificăm că afișează #808080
    const colorInputs = screen.getAllByDisplayValue('#808080');
    expect(colorInputs).toHaveLength(2);
  });
});
