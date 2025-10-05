import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';
import { signIn } from 'next-auth/react';
import React from 'react';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('hooks/navigation', () => ({
  usePrefetchRouter: () => ({ navigate: jest.fn() }),
  useNavigating: () => ({ setNavigating: jest.fn() }),
}));

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('renders email and password inputs', () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  it('submits form and calls signIn with correct credentials', async () => {
    const mockSignIn = signIn as jest.Mock;
    mockSignIn.mockResolvedValue({ ok: true });
    render(<LoginForm />);
    await userEvent.type(screen.getByPlaceholderText(/enter your email/i), 'test@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'password123');

    // Get the form element and submit it
    const form = screen.getByTestId('login-form');
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        redirect: false,
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows error message on failed login', async () => {
    const mockSignIn = signIn as jest.Mock;

    mockSignIn.mockResolvedValue({
      ok: false,
      error: true,
      code: 'Invalid credentials',
    });
    render(<LoginForm />);
    await userEvent.type(screen.getByPlaceholderText(/enter your email/i), 'fail@example.com');
    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'wrong-pass'); // Submit the form by clicking the submit button
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
