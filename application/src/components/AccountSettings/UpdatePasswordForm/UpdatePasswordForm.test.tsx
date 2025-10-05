import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UpdatePasswordForm from './UpdatePasswordForm';

describe('UpdatePasswordForm', () => {
  it('renders the form', () => {
    render(<UpdatePasswordForm />);
    expect(screen.getByTestId('update-password-button')).toBeInTheDocument();
  });

  it('shows error if new passwords do not match', async () => {
    const user = userEvent.setup();
    render(<UpdatePasswordForm />);

    const currentPasswordInput = screen
      .getByTestId('current-password-input')
      .querySelector('input') as HTMLInputElement;
    const newPasswordInput = screen
      .getByTestId('new-password-input')
      .querySelector('input') as HTMLInputElement;
    const confirmPasswordInput = screen
      .getByTestId('confirm-password-input')
      .querySelector('input') as HTMLInputElement;

    await user.type(currentPasswordInput, 'oldpass');
    await user.type(newPasswordInput, 'newpass1');
    await user.type(confirmPasswordInput, 'newpass2');
    await user.click(screen.getByTestId('update-password-button'));

    expect(await screen.findByText(/new passwords do not match/i)).toBeInTheDocument();
  });

  it('shows error if API returns error', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid current password.' }),
    });
    render(<UpdatePasswordForm />);

    const currentPasswordInput = screen
      .getByTestId('current-password-input')
      .querySelector('input') as HTMLInputElement;
    const newPasswordInput = screen
      .getByTestId('new-password-input')
      .querySelector('input') as HTMLInputElement;
    const confirmPasswordInput = screen
      .getByTestId('confirm-password-input')
      .querySelector('input') as HTMLInputElement;

    await user.type(currentPasswordInput, 'wrongpass');
    await user.type(newPasswordInput, 'newpass');
    await user.type(confirmPasswordInput, 'newpass');
    await user.click(screen.getByTestId('update-password-button'));

    expect(await screen.findByText(/invalid current password/i)).toBeInTheDocument();
    (global.fetch as jest.Mock).mockRestore?.();
  });

  it('shows success and clears fields on successful update', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    render(<UpdatePasswordForm />);

    const currentPasswordInput = screen
      .getByTestId('current-password-input')
      .querySelector('input') as HTMLInputElement;
    const newPasswordInput = screen
      .getByTestId('new-password-input')
      .querySelector('input') as HTMLInputElement;
    const confirmPasswordInput = screen
      .getByTestId('confirm-password-input')
      .querySelector('input') as HTMLInputElement;

    await user.type(currentPasswordInput, 'oldpass');
    await user.type(newPasswordInput, 'newpass');
    await user.type(confirmPasswordInput, 'newpass');
    await user.click(screen.getByTestId('update-password-button'));

    expect(await screen.findByText(/password updated successfully/i)).toBeInTheDocument();
    expect(currentPasswordInput.value).toBe('');
    expect(newPasswordInput.value).toBe('');
    expect(confirmPasswordInput.value).toBe('');
    (global.fetch as jest.Mock).mockRestore?.();
  });

  it('disables button and shows loading text while submitting', async () => {
    const user = userEvent.setup();
    let fetchResolve: (() => void) | undefined;
    const fetchPromise = new Promise<Response>((resolve) => {
      fetchResolve = () => resolve({ ok: true, json: async () => ({}) } as Response);
    });
    global.fetch = jest.fn(() => fetchPromise);
    render(<UpdatePasswordForm />);

    const currentPasswordInput = screen
      .getByTestId('current-password-input')
      .querySelector('input') as HTMLInputElement;
    const newPasswordInput = screen
      .getByTestId('new-password-input')
      .querySelector('input') as HTMLInputElement;
    const confirmPasswordInput = screen
      .getByTestId('confirm-password-input')
      .querySelector('input') as HTMLInputElement;

    await user.type(currentPasswordInput, 'oldpass');
    await user.type(newPasswordInput, 'newpass');
    await user.type(confirmPasswordInput, 'newpass');
    await user.click(screen.getByTestId('update-password-button'));

    expect(screen.getByTestId('update-password-button')).toBeDisabled();
    expect(screen.getByTestId('update-password-button')).toHaveTextContent('Updating...');

    // Finish fetch
    if (fetchResolve) fetchResolve();
    await waitFor(() => expect(screen.getByTestId('update-password-button')).not.toBeDisabled());
    (global.fetch as jest.Mock).mockRestore?.();
  });
});
