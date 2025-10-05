import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPasswordForm from './ResetPasswordForm';

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => 'test-token' }),
  useRouter: () => ({ push: jest.fn() }),
}));

global.fetch = jest.fn();

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields and submit button', () => {
    render(<ResetPasswordForm />);
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update Password/i })).toBeInTheDocument();
  });

  it('shows error if passwords do not match', async () => {
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'def' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));
    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('shows error if API returns error', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'API error' }),
    });
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));
    await waitFor(() => {
      expect(screen.getByText(/API error/i)).toBeInTheDocument();
    });
  });

  it('shows success message and login button on success', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: 'abc' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));
    await waitFor(() => {
      expect(screen.getByText(/Password Reset Successful/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Go to Login/i })).toBeInTheDocument();
    });
  });
});
