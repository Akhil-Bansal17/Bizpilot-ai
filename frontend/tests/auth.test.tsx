import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '../src/pages/LoginPage';
import { RegisterPage } from '../src/pages/RegisterPage';
import { ProtectedRoute } from '../src/components/ProtectedRoute';
import { useAuthStore } from '../src/store/useAuthStore';
import { api } from '../src/api/client';

vi.mock('../src/api/client', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn(),
  },
  setUnauthorizedCallback: vi.fn(),
}));

describe('Frontend Authentication Components & Flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it('renders login form and submits credentials', async () => {
    (api.login as any).mockResolvedValue({
      access_token: 'jwt-token-123',
      token_type: 'bearer',
      user: {
        id: 'u1',
        email: 'test@example.com',
        full_name: 'Test User',
        is_active: true,
        created_at: '2026-09-14T00:00:00Z',
      },
      selected_business: {
        id: 'b1',
        name: 'My Bistro',
        role: 'owner',
      },
    });

    (api.getMe as any).mockResolvedValue({
      id: 'u1',
      email: 'test@example.com',
      full_name: 'Test User',
      is_active: true,
      businesses: [{ id: 'b1', name: 'My Bistro', role: 'owner' }],
    });

    const onSwitch = vi.fn();
    render(<LoginPage onSwitchToRegister={onSwitch} />);

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  it('renders registration form and submits registration data', async () => {
    (api.register as any).mockResolvedValue({
      access_token: 'reg-token-456',
      token_type: 'bearer',
      user: {
        id: 'u2',
        email: 'new@example.com',
        full_name: 'New Owner',
        is_active: true,
        created_at: '2026-09-14T00:00:00Z',
      },
      selected_business: {
        id: 'b2',
        name: 'New Restaurant',
        role: 'owner',
      },
    });

    (api.getMe as any).mockResolvedValue({
      id: 'u2',
      email: 'new@example.com',
      full_name: 'New Owner',
      is_active: true,
      businesses: [{ id: 'b2', name: 'New Restaurant', role: 'owner' }],
    });

    const onSwitch = vi.fn();
    render(<RegisterPage onSwitchToLogin={onSwitch} />);

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'New Owner' },
    });
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/business \/ restaurant name/i), {
      target: { value: 'New Restaurant' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register & launch/i }));

    await waitFor(() => {
      expect(api.register).toHaveBeenCalledWith({
        full_name: 'New Owner',
        email: 'new@example.com',
        password: 'password123',
        business_name: 'New Restaurant',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
      });
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });
  });

  it('ProtectedRoute renders content when authenticated and hides when unauthenticated', () => {
    const { rerender } = render(
      <ProtectedRoute fallback={<div>Redirecting to Login</div>}>
        <div>Protected Dashboard</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Redirecting to Login')).toBeInTheDocument();

    // Authenticate in store
    useAuthStore.setState({ isAuthenticated: true, isLoading: false });

    rerender(
      <ProtectedRoute fallback={<div>Redirecting to Login</div>}>
        <div>Protected Dashboard</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Dashboard')).toBeInTheDocument();
  });
});
