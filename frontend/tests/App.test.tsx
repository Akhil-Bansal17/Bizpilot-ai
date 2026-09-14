import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';
import { api } from '../src/api/client';
import { useAuthStore } from '../src/store/useAuthStore';

vi.mock('../src/api/client', () => ({
  api: {
    getHealth: vi.fn(),
    getDBHealth: vi.fn(),
    getMe: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
  },
  setUnauthorizedCallback: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(message: string) {
      super(message);
    }
  },
}));

describe('BizPilot AI Frontend App & Auth Shell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useAuthStore.getState().logout();
  });

  it('renders login page when unauthenticated and no token present', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Sign in to your restaurant management dashboard')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  it('renders app shell and homepage when authenticated session exists', async () => {
    localStorage.setItem('bizpilot_token', 'mock-valid-jwt');
    (api.getMe as any).mockResolvedValue({
      id: 'usr-123',
      email: 'owner@bizpilot.ai',
      full_name: 'Test Owner',
      is_active: true,
      created_at: '2026-09-14T00:00:00Z',
      businesses: [
        {
          id: 'bus-123',
          owner_user_id: 'usr-123',
          name: 'Tasty Bites Cafe',
          business_type: 'restaurant_cafe',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
          is_active: true,
          created_at: '2026-09-14T00:00:00Z',
          updated_at: '2026-09-14T00:00:00Z',
          role: 'owner',
        },
      ],
    });
    (api.getHealth as any).mockResolvedValue({
      status: 'ok',
      service: 'bizpilot-ai-backend',
      version: '0.1.0',
    });
    (api.getDBHealth as any).mockResolvedValue({
      status: 'ok',
      database: 'reachable',
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Welcome, Test Owner')).toBeInTheDocument();
      expect(screen.getAllByText('Tasty Bites Cafe').length).toBeGreaterThan(0);
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });
});
