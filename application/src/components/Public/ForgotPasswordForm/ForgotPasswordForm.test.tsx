import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordForm from './ForgotPasswordForm';

// Mock useNavigating
jest.mock('hooks/navigation', () => ({
  useNavigating: () => ({ setNavigating: jest.fn() }),
}));

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the form', () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByText(/send magic link/i)).toBeInTheDocument();
  });

  it('shows error if email is empty and form is submitted', async () => {
    render(<ForgotPasswordForm />);
    fireEvent.submit(screen.getByTestId('forgot-password-form'));
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('shows success message when magic link is sent', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    }) as jest.Mock;
    render(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }));
    expect(await screen.findByText(/magic link sent/i)).toBeInTheDocument();
  });

  it('shows error message when backend returns error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'User not found' }),
    }) as jest.Mock;
    render(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'fail@example.com');
    fireEvent.submit(screen.getByTestId('forgot-password-form'));
    expect(await screen.findByText(/user not found/i)).toBeInTheDocument();
  });

  it('shows error message when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    render(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText(/email/i), 'fail2@example.com');
    fireEvent.submit(screen.getByTestId('forgot-password-form'));
    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
  });
});
