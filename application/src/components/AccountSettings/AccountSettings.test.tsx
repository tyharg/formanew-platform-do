import { render, screen } from '@testing-library/react';
import AccountSettings from './AccountSettingsPage';
import { useSession } from 'next-auth/react';

// Mocks
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('./ProfileUpdateForm/ProfileUpdateForm', () => {
  return function MockProfileUpdateForm() {
    return <div data-testid="profile-update-form">Profile Update Form</div>;
  };
});

jest.mock('./UpdatePasswordForm/UpdatePasswordForm', () => {
  return function MockUpdatePasswordForm() {
    return <div data-testid="update-password-form">Update Password Form</div>;
  };
});

describe('AccountSettings', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    image: '/profile.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: { user: mockUser },
      status: 'authenticated',
    });
  });

  it('renders the profile update form', () => {
    render(<AccountSettings />);
    expect(screen.getByTestId('profile-update-form')).toBeInTheDocument();
  });

  it('renders the update password form', () => {
    render(<AccountSettings />);
    expect(screen.getByTestId('update-password-form')).toBeInTheDocument();
  });

  it('renders the page title', () => {
    render(<AccountSettings />);
    expect(screen.getByRole('heading', { name: /Account Settings/i })).toBeInTheDocument();
  });
});
