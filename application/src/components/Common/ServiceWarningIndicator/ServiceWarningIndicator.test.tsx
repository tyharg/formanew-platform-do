import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ServiceWarningIndicator from './ServiceWarningIndicator';

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ServiceWarningIndicator', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockPush.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('does not render when there are no issues', async () => {
    const servicesWithoutOptionalIssues = [
      { name: 'Database', configured: true, connected: true, required: true },
      { name: 'Cache', configured: true, connected: true, required: false },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: servicesWithoutOptionalIssues }),
    });

    const { container } = render(
      <TestWrapper>
        <ServiceWarningIndicator />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('renders warning indicator when optional and required services have issues', async () => {
    const servicesWithOptionalIssues = [
      { name: 'Database', configured: true, connected: true, required: true },
      { name: 'Email', configured: false, connected: false, required: false },
      { name: 'Analytics', configured: true, connected: false, required: false },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: servicesWithOptionalIssues }),
    });

    render(
      <TestWrapper>
        <ServiceWarningIndicator />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  it('displays correct badge count for issues', async () => {
    const servicesWithTwoOptionalIssues = [
      { name: 'Database', configured: true, connected: true, required: true },
      { name: 'Email', configured: false, connected: false, required: false },
      { name: 'Analytics', configured: true, connected: false, required: false },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: servicesWithTwoOptionalIssues }),
    });

    render(
      <TestWrapper>
        <ServiceWarningIndicator />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('shows correct tooltip text for single service issue', async () => {
    const servicesWithOneOptionalIssue = [
      { name: 'Database', configured: true, connected: true, required: true },
      { name: 'Email', configured: false, connected: false, required: false },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: servicesWithOneOptionalIssue }),
    });

    render(
      <TestWrapper>
        <ServiceWarningIndicator />
      </TestWrapper>
    );

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.mouseOver(button);
    });

    await waitFor(() => {
      expect(
        screen.getByText('1 optional service have configuration issues. Click to view details.')
      ).toBeInTheDocument();
    });
  });

  it('shows correct tooltip text for multiple service issues', async () => {
    const servicesWithMultipleOptionalIssues = [
      { name: 'Database', configured: true, connected: true, required: true },
      { name: 'Email', configured: false, connected: false, required: false },
      { name: 'Analytics', configured: true, connected: false, required: false },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: servicesWithMultipleOptionalIssues }),
    });

    render(
      <TestWrapper>
        <ServiceWarningIndicator />
      </TestWrapper>
    );

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.mouseOver(button);
    });

    await waitFor(() => {
      expect(
        screen.getByText('2 optional services have configuration issues. Click to view details.')
      ).toBeInTheDocument();
    });
  });

  it('navigates to system status page when clicked', async () => {
    const servicesWithOptionalIssues = [
      { name: 'Database', configured: true, connected: true, required: true },
      { name: 'Email', configured: false, connected: false, required: false },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: servicesWithOptionalIssues }),
    });

    render(
      <TestWrapper>
        <ServiceWarningIndicator />
      </TestWrapper>
    );

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });

    expect(mockPush).toHaveBeenCalledWith('/system-status');
  });

  it('handles fetch errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { container } = render(
      <TestWrapper>
        <ServiceWarningIndicator />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });

    expect(console.error).toHaveBeenCalledWith(
      'Failed to check service status:',
      expect.any(Error)
    );
  });

  it('handles non-ok response status gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    });

    const { container } = render(
      <TestWrapper>
        <ServiceWarningIndicator />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('checks status every 5 minutes', async () => {
    const servicesWithOptionalIssues = [
      { name: 'Database', configured: true, connected: true, required: true },
      { name: 'Email', configured: false, connected: false, required: false },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ services: servicesWithOptionalIssues }),
    });

    render(
      <TestWrapper>
        <ServiceWarningIndicator />
      </TestWrapper>
    );

    // Initial call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Fast-forward 5 minutes
    jest.advanceTimersByTime(5 * 60 * 1000);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    // Fast-forward another 5 minutes
    jest.advanceTimersByTime(5 * 60 * 1000);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  it('clears interval on component unmount', async () => {
    const servicesWithOptionalIssues = [
      { name: 'Database', configured: true, connected: true, required: true },
      { name: 'Email', configured: false, connected: false, required: false },
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ services: servicesWithOptionalIssues }),
    });

    const { unmount } = render(
      <TestWrapper>
        <ServiceWarningIndicator />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    unmount();

    // Fast-forward time after unmount
    jest.advanceTimersByTime(5 * 60 * 1000);

    // Should not make additional calls after unmount
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('handles missing services in response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}), // No services property
    });

    const { container } = render(
      <TestWrapper>
        <ServiceWarningIndicator />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('correctly identifies configured but disconnected services as having issues', async () => {
    const servicesWithConnectionIssues = [
      { name: 'Database', configured: true, connected: true, required: true },
      { name: 'Email', configured: true, connected: false, required: false },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: servicesWithConnectionIssues }),
    });

    render(
      <TestWrapper>
        <ServiceWarningIndicator />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  it('correctly identifies unconfigured services as having issues', async () => {
    const servicesWithConfigurationIssues = [
      { name: 'Database', configured: true, connected: true, required: true },
      { name: 'Email', configured: false, connected: true, required: false },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ services: servicesWithConfigurationIssues }),
    });

    render(
      <TestWrapper>
        <ServiceWarningIndicator />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});
