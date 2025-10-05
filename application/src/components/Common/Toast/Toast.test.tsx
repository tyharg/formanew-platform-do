import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toast from './Toast';

describe('Toast component', () => {
  it('renders with default props', () => {
    const handleClose = jest.fn();

    render(<Toast open={true} message="Test message" onClose={handleClose} />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardInfo');
  });

  it('renders with custom severity', () => {
    const handleClose = jest.fn();

    render(<Toast open={true} message="Error occurred" severity="error" onClose={handleClose} />);

    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardError');
  });

  it('calls onClose when alert close button is clicked', async () => {
    const handleClose = jest.fn();

    render(<Toast open={true} message="Closable message" onClose={handleClose} />);

    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);

    await waitFor(() => expect(handleClose).toHaveBeenCalledTimes(1));
  });
});
