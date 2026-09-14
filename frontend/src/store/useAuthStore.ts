import { create } from 'zustand';
import { api, setUnauthorizedCallback } from '../api/client';
import { User, Business, LoginCredentials, RegisterData } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  businesses: Business[];
  currentBusiness: Business | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  setCurrentBusiness: (business: Business) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Set global unauthorized interceptor callback
  setUnauthorizedCallback(() => {
    get().logout();
  });

  const initialToken = localStorage.getItem('bizpilot_token');

  return {
    user: null,
    token: initialToken,
    businesses: [],
    currentBusiness: null,
    isAuthenticated: false,
    isLoading: !!initialToken,
    error: null,

    login: async (credentials: LoginCredentials) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.login(credentials);
        localStorage.setItem('bizpilot_token', response.access_token);
        
        const currentBus = response.selected_business || null;
        if (currentBus) {
          localStorage.setItem('bizpilot_business_id', currentBus.id);
        }

        set({
          user: response.user,
          token: response.access_token,
          currentBusiness: currentBus,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        // Also fetch user profile & all businesses
        await get().fetchCurrentUser();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed';
        set({ error: message, isLoading: false, isAuthenticated: false });
        throw err;
      }
    },

    register: async (data: RegisterData) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.register(data);
        localStorage.setItem('bizpilot_token', response.access_token);

        const currentBus = response.selected_business || null;
        if (currentBus) {
          localStorage.setItem('bizpilot_business_id', currentBus.id);
        }

        set({
          user: response.user,
          token: response.access_token,
          currentBusiness: currentBus,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        await get().fetchCurrentUser();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        set({ error: message, isLoading: false, isAuthenticated: false });
        throw err;
      }
    },

    logout: () => {
      localStorage.removeItem('bizpilot_token');
      localStorage.removeItem('bizpilot_business_id');
      set({
        user: null,
        token: null,
        businesses: [],
        currentBusiness: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    },

    fetchCurrentUser: async () => {
      const token = get().token || localStorage.getItem('bizpilot_token');
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }

      set({ isLoading: true });
      try {
        const profile = await api.getMe();
        const storedBusinessId = localStorage.getItem('bizpilot_business_id');
        const selectedBus = profile.businesses.find((b) => b.id === storedBusinessId) || profile.businesses[0] || null;

        if (selectedBus) {
          localStorage.setItem('bizpilot_business_id', selectedBus.id);
        }

        set({
          user: {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            is_active: profile.is_active,
            created_at: profile.created_at,
            last_login_at: profile.last_login_at,
          },
          businesses: profile.businesses,
          currentBusiness: selectedBus,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        get().logout();
      }
    },

    setCurrentBusiness: (business: Business) => {
      localStorage.setItem('bizpilot_business_id', business.id);
      set({ currentBusiness: business });
    },

    clearError: () => set({ error: null }),
  };
});
