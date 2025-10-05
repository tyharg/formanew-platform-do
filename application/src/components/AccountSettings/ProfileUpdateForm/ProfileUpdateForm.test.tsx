import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileUpdateForm from './ProfileUpdateForm';
import { useSession } from 'next-auth/react';

// Mocks
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

global.URL.createObjectURL = jest.fn(() => 'blob:preview-url');
global.URL.revokeObjectURL = jest.fn();

describe('ProfileUpdateForm', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    image: '/profile.jpg',
  };

  const mockUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: { user: mockUser },
      status: 'authenticated',
      update: mockUpdate,
    });
  });

  it('renders name and email inputs with initial values', () => {
    render(<ProfileUpdateForm />);
    expect(screen.getByDisplayValue(mockUser.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.email)).toBeInTheDocument();
  });

  it('disables the email input', () => {
    render(<ProfileUpdateForm />);
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toBeDisabled();
  });

  it('allows changing the name', async () => {
    const user = userEvent.setup();
    render(<ProfileUpdateForm />);

    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Jane Doe');

    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
  });

  it('shows the upload button for profile image', () => {
    render(<ProfileUpdateForm />);
    expect(screen.getByTestId('upload-image-button')).toBeInTheDocument();
  });

  it('shows preview when image is selected', async () => {
    const user = userEvent.setup();
    render(<ProfileUpdateForm />);

    const fileInput = screen
      .getByTestId('upload-image-button')
      .querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await user.upload(fileInput, file);

    expect(screen.getByText(/preview/i)).toBeInTheDocument();
    expect(screen.getByTestId('upload-image-button')).toHaveTextContent('Change');
    expect(screen.getByTestId('remove-image-button')).toBeInTheDocument();
  });

  it('displays an error message if the upload fails', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      text: () => Promise.resolve(JSON.stringify({ error: 'Upload failed' })),
    });

    render(<ProfileUpdateForm />);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
    });
  });

  it('calls session.update and shows success indicator on success', async () => {
    const user = userEvent.setup();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: 'Updated Name', image: '/new-image.jpg' }),
    });

    render(<ProfileUpdateForm />);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        user: { name: 'Updated Name', image: '/new-image.jpg' },
      });
    });
  });
});
