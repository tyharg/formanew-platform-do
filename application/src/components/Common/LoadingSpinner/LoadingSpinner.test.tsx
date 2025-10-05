import { render, screen } from '@testing-library/react';
import WithLoadingSpinner from './LoadingSpinner';
import '@testing-library/jest-dom';

// Mock the custom hook
jest.mock('hooks/navigation', () => ({
  useNavigating: jest.fn(),
}));
import { useNavigating } from 'hooks/navigation';

describe('WithLoadingSpinner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when not navigating', () => {
    (useNavigating as jest.Mock).mockReturnValue({ navigating: false });

    render(
      <WithLoadingSpinner>
        <p>App content</p>
      </WithLoadingSpinner>
    );

    expect(screen.getByText('App content')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows spinner when navigating is true', () => {
    (useNavigating as jest.Mock).mockReturnValue({ navigating: true });

    render(
      <WithLoadingSpinner>
        <p>Loaded content</p>
      </WithLoadingSpinner>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Loaded content')).toBeInTheDocument();
  });
});
