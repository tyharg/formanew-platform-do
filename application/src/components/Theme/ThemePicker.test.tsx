import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemePicker } from './ThemePicker';
import { useThemeMode } from './Theme';
import { useMediaQuery } from '@mui/material';
import { getAvailableThemes } from './ThemeRegistry';

// Mock dependencies
jest.mock('./Theme', () => ({
  useThemeMode: jest.fn(),
}));

jest.mock('@mui/material', () => {
  const original = jest.requireActual('@mui/material');
  return {
    ...original,
    useMediaQuery: jest.fn(),
    useTheme: jest.fn(() => ({
      breakpoints: {
        down: () => 'md',
      },
    })),
  };
});

jest.mock('./ThemeRegistry', () => ({
  getAvailableThemes: jest.fn(),
}));

describe('ThemePicker', () => {
  const mockToggleMode = jest.fn();
  const mockSetCurrentTheme = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks for desktop view
    (useThemeMode as jest.Mock).mockReturnValue({
      mode: 'light',
      toggleMode: mockToggleMode,
      currentTheme: 'modernize',
      setCurrentTheme: mockSetCurrentTheme,
    });

    (useMediaQuery as jest.Mock).mockReturnValue(false); // Default to desktop
    (getAvailableThemes as jest.Mock).mockReturnValue([
      { name: 'modernize', displayName: 'Modernize' },
      { name: 'minimalist', displayName: 'Minimalist' },
      { name: 'sky', displayName: 'Sky' },
    ]);
  });

  it('renders desktop theme picker with correct theme options', () => {
    render(<ThemePicker />);

    // Verify theme select button is rendered
    expect(screen.getByRole('button', { name: /select theme/i })).toBeInTheDocument();

    // Open the dropdown
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /select theme/i }));
    });

    // Verify theme options are rendered
    expect(screen.getByRole('menuitem', { name: /modernize/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /minimalist/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /sky/i })).toBeInTheDocument();
  });

  it('toggles theme mode when toggle button is clicked', () => {
    render(<ThemePicker />);

    const toggleButton = screen.getByRole('button', { name: /switch to dark mode/i });

    act(() => {
      fireEvent.click(toggleButton);
    });

    expect(mockToggleMode).toHaveBeenCalledTimes(1);
  });

  it('selects a theme when an option is chosen', () => {
    render(<ThemePicker />);

    // Open the dropdown
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /select theme/i }));
    });

    // Select a different theme
    act(() => {
      fireEvent.click(screen.getByRole('menuitem', { name: /minimalist/i }));
    });

    expect(mockSetCurrentTheme).toHaveBeenCalledWith('minimalist');
  });

  it('renders mobile theme picker with FAB', () => {
    (useMediaQuery as jest.Mock).mockReturnValue(true); // Mobile view

    render(<ThemePicker />);

    // Verify the FAB is rendered
    expect(screen.getByRole('button', { name: /select theme/i })).toBeInTheDocument();

    // The dropdown should not be visible initially
    expect(screen.queryByRole('menuitem', { name: /modernize/i })).not.toBeInTheDocument();
  });

  it('handles theme loading error gracefully', () => {
    (getAvailableThemes as jest.Mock).mockImplementation(() => {
      throw new Error('Failed to load themes');
    });

    render(<ThemePicker />);

    // Should still render with fallback themes
    expect(screen.getByRole('button', { name: /select theme/i })).toBeInTheDocument();
  });
});
