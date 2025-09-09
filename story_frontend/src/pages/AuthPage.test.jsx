import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthPage } from './AuthPage';

// Create a simple location display to assert navigation
function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
}

function renderWithRouter(ui, initialEntries = ['/auth']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/auth" element={
          <>
            {ui}
            <LocationDisplay />
          </>
        } />
        <Route path="/" element={<LocationDisplay />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AuthPage', () => {
  const mockLogin = jest.fn();
  const mockSignup = jest.fn();

  // Mock useAuth from AuthContext to control login/signup behaviors
  jest.mock('../state/AuthContext', () => {
    const originalModule = jest.requireActual('../state/AuthContext');
    return {
      ...originalModule,
      useAuth: () => ({
        user: null,
        token: null,
        loading: false,
        login: mockLogin,
        signup: mockSignup,
        logout: jest.fn(),
      }),
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login mode by default and allows email/password input', async () => {
    renderWithRouter(<AuthPage />);
    // Title for login mode
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();

    // No display name input in login mode
    expect(screen.queryByLabelText(/Display name/i)).not.toBeInTheDocument();

    // Fill in email/password
    await userEvent.type(screen.getByLabelText(/Email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'secret123');

    expect(screen.getByLabelText(/Email/i)).toHaveValue('test@example.com');
    expect(screen.getByLabelText(/Password/i)).toHaveValue('secret123');
  });

  test('successful login navigates to home "/"', async () => {
    mockLogin.mockResolvedValueOnce({ user: { id: 'u1' }, token: 't1' });

    renderWithRouter(<AuthPage />);

    await userEvent.type(screen.getByLabelText(/Email/i), 'user@site.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'passw0rd');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Ensure login called with correct parameters
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('user@site.com', 'passw0rd');
    });

    // Navigation to "/"
    await waitFor(() => {
      expect(screen.getByTestId('location-display')).toHaveTextContent('/');
    });
  });

  test('failed login displays error message and stays on page', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderWithRouter(<AuthPage />);

    await userEvent.type(screen.getByLabelText(/Email/i), 'nope@site.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Error message is shown
    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();

    // Still on /auth
    expect(screen.getByTestId('location-display')).toHaveTextContent('/auth');
  });

  test('toggle to signup mode shows display name and uses signup flow', async () => {
    mockSignup.mockResolvedValueOnce({ user: { id: 'u2' }, token: 't2' });

    renderWithRouter(<AuthPage />);

    // Toggle to signup
    await userEvent.click(screen.getByRole('button', { name: /Create account/i }));
    expect(screen.getByText(/Create your account/i)).toBeInTheDocument();

    // Display name is now present
    const displayNameInput = screen.getByLabelText(/Display name/i);
    expect(displayNameInput).toBeInTheDocument();

    // Fill fields
    await userEvent.type(displayNameInput, 'Nova');
    await userEvent.type(screen.getByLabelText(/Email/i), 'new@user.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'newPass123');

    // Submit signup
    await userEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('new@user.com', 'newPass123', 'Nova');
    });

    // Navigates to home
    await waitFor(() => {
      expect(screen.getByTestId('location-display')).toHaveTextContent('/');
    });
  });

  test('failed signup shows error and stays on signup mode', async () => {
    mockSignup.mockRejectedValueOnce(new Error('Email already in use'));

    renderWithRouter(<AuthPage />);

    // Switch to signup
    await userEvent.click(screen.getByRole('button', { name: /Create account/i }));
    expect(screen.getByText(/Create your account/i)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/Display name/i), 'Echo');
    await userEvent.type(screen.getByLabelText(/Email/i), 'existing@site.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'password!');

    await userEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    // Error visible
    expect(await screen.findByText(/Email already in use/i)).toBeInTheDocument();

    // Still on /auth and still in signup mode; toggle button should say "Have an account? Sign in"
    expect(screen.getByTestId('location-display')).toHaveTextContent('/auth');
    expect(screen.getByRole('button', { name: /Have an account\? Sign in/i })).toBeInTheDocument();
  });

  test('loading state disables submit and shows loading text', async () => {
    // Create a pending Promise to hold the submit
    let resolveLogin;
    const pending = new Promise((res) => { resolveLogin = res; });
    mockLogin.mockReturnValueOnce(pending);

    renderWithRouter(<AuthPage />);

    await userEvent.type(screen.getByLabelText(/Email/i), 'slow@site.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'slowpass');
    await userEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    // Button shows loading text and is disabled
    expect(screen.getByRole('button', { name: /Please wait\.\.\./i })).toBeDisabled();

    // Resolve and ensure navigation after completion
    resolveLogin({ user: { id: 'u3' }, token: 't3' });

    await waitFor(() => {
      expect(screen.getByTestId('location-display')).toHaveTextContent('/');
    });
  });

  test('toggle between modes changes button labels appropriately', async () => {
    renderWithRouter(<AuthPage />);

    // Initially login mode
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument();

    // Switch to signup
    await userEvent.click(screen.getByRole('button', { name: /Create account/i }));
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Have an account\? Sign in/i })).toBeInTheDocument();

    // Switch back to login
    await userEvent.click(screen.getByRole('button', { name: /Have an account\? Sign in/i }));
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument();
  });
});
