import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../src/App';
import { api } from '../src/api/client';
import { useHealthStore } from '../src/store/useHealthStore';

vi.mock('../src/api/client', () => ({
  api: {
    getHealth: vi.fn(),
    getDBHealth: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(message: string) {
      super(message);
    }
  },
}));

describe('BizPilot AI Frontend Foundation Shell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useHealthStore.getState().reset();
  });

  it('renders the shell layout and header correctly', async () => {
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

    expect(screen.getByText('BizPilot AI')).toBeInTheDocument();
    expect(screen.getByText('BizPilot AI Foundation Shell')).toBeInTheDocument();
    expect(screen.getByText('System Infrastructure Health')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('ONLINE')).toBeInTheDocument();
    });
  });

  it('shows operational health status when backend and DB succeed', async () => {
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
      expect(screen.getByText('ONLINE')).toBeInTheDocument();
      expect(screen.getByText('CONNECTED')).toBeInTheDocument();
    });
  });

  it('shows error state when backend connection fails', async () => {
    (api.getHealth as any).mockRejectedValue(new Error('Network error'));
    (api.getDBHealth as any).mockRejectedValue(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Backend Connection Error')).toBeInTheDocument();
    });
  });
});
