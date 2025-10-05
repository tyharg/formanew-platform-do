import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ConfigurableServiceCard from './ConfigurableServiceCard';

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

const mockService = {
  name: 'Test Service',
  configured: true,
  connected: true,
  required: true,
};

describe('ConfigurableServiceCard', () => {
  it('renders service name correctly', () => {
    render(
      <TestWrapper>
        <ConfigurableServiceCard service={mockService} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Service')).toBeInTheDocument();
  });

  it('shows "Required" chip for required services', () => {
    render(
      <TestWrapper>
        <ConfigurableServiceCard service={mockService} />
      </TestWrapper>
    );

    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('shows "Optional" chip for optional services', () => {
    const optionalService = { ...mockService, required: false };

    render(
      <TestWrapper>
        <ConfigurableServiceCard service={optionalService} />
      </TestWrapper>
    );

    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('shows valid configuration status when configured', () => {
    render(
      <TestWrapper>
        <ConfigurableServiceCard service={mockService} />
      </TestWrapper>
    );

    expect(screen.getByText('Configuration: Valid')).toBeInTheDocument();
  });

  it('shows invalid configuration status when not configured', () => {
    const unconfiguredService = { ...mockService, configured: false };

    render(
      <TestWrapper>
        <ConfigurableServiceCard service={unconfiguredService} />
      </TestWrapper>
    );

    expect(screen.getByText('Configuration: Invalid')).toBeInTheDocument();
  });

  it('shows successful connection status when connected and configured', () => {
    render(
      <TestWrapper>
        <ConfigurableServiceCard service={mockService} />
      </TestWrapper>
    );

    expect(screen.getByText('Connection: Successful')).toBeInTheDocument();
  });

  it('shows failed connection status when not connected but configured', () => {
    const disconnectedService = { ...mockService, connected: false };

    render(
      <TestWrapper>
        <ConfigurableServiceCard service={disconnectedService} />
      </TestWrapper>
    );

    expect(screen.getByText('Connection: Failed')).toBeInTheDocument();
  });

  it('shows "Not tested" connection status when not configured', () => {
    const unconfiguredService = { ...mockService, configured: false, connected: false };

    render(
      <TestWrapper>
        <ConfigurableServiceCard service={unconfiguredService} />
      </TestWrapper>
    );

    expect(screen.getByText('Connection: Not tested')).toBeInTheDocument();
  });

  it('displays error message when error exists', () => {
    const serviceWithError = {
      ...mockService,
      configured: false,
      error: 'Configuration error',
      configToReview: ['API_KEY', 'SECRET'],
    };

    render(
      <TestWrapper>
        <ConfigurableServiceCard service={serviceWithError} />
      </TestWrapper>
    );

    expect(screen.getByText('Missing settings: API_KEY, SECRET')).toBeInTheDocument();
  });

  it('displays error alert for required services with error severity', () => {
    const serviceWithError = {
      ...mockService,
      error: 'Test error message',
    };

    render(
      <TestWrapper>
        <ConfigurableServiceCard service={serviceWithError} />
      </TestWrapper>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('displays warning alert for optional services with error', () => {
    const optionalServiceWithError = {
      ...mockService,
      required: false,
      error: 'Optional service error',
    };

    render(
      <TestWrapper>
        <ConfigurableServiceCard service={optionalServiceWithError} />
      </TestWrapper>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Optional service error')).toBeInTheDocument();
  });

  it('does not display alert when no error exists', () => {
    render(
      <TestWrapper>
        <ConfigurableServiceCard service={mockService} />
      </TestWrapper>
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('formats complex error messages with configToReview when configured', () => {
    const serviceWithComplexError = {
      ...mockService,
      configured: true,
      connected: false,
      error: 'Connection failed',
      configToReview: ['HOST', 'PORT'],
    };

    render(
      <TestWrapper>
        <ConfigurableServiceCard service={serviceWithComplexError} />
      </TestWrapper>
    );

    expect(
      screen.getByText('Connection failed. Please review the following settings: HOST, PORT')
    ).toBeInTheDocument();
  });

  it('handles missing configToReview gracefully', () => {
    const serviceWithError = {
      ...mockService,
      error: 'Simple error message',
    };

    render(
      <TestWrapper>
        <ConfigurableServiceCard service={serviceWithError} />
      </TestWrapper>
    );

    expect(screen.getByText('Simple error message')).toBeInTheDocument();
  });
});
