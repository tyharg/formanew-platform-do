import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MaterialThemeProvider, { useThemeMode } from './Theme';

// Create a test component that uses the theme context
const TestComponent = () => {
  const { mode, toggleMode } = useThemeMode();
  return (
    <div>
      <div data-testid="theme-mode">{mode}</div>
      <button onClick={toggleMode} data-testid="toggle-button">
        Toggle Theme
      </button>
    </div>
  );
};

describe('Theme Component', () => {
  it('renders children', () => {
    render(
      <MaterialThemeProvider>
        <div data-testid="child">Child Component</div>
      </MaterialThemeProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('theme context provides mode and toggleColorMode', () => {
    render(
      <MaterialThemeProvider>
        <TestComponent />
      </MaterialThemeProvider>
    );

    // Default mode should be light
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');

    // Test toggle functionality
    fireEvent.click(screen.getByTestId('toggle-button'));
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');

    // Toggle back to light
    fireEvent.click(screen.getByTestId('toggle-button'));
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
  });

  it('persists theme mode in localStorage', () => {
    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        clear: () => {
          store = {};
        },
      };
    })();

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Set initial value in localStorage
    localStorageMock.setItem('themeMode', 'dark');

    render(
      <MaterialThemeProvider>
        <TestComponent />
      </MaterialThemeProvider>
    );

    // Should load dark theme from localStorage
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');

    // Toggle to light
    fireEvent.click(screen.getByTestId('toggle-button'));
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');

    // Check if localStorage was updated
    expect(localStorageMock.getItem('themeMode')).toBe('light');
  });
});
