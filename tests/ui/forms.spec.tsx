import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/contexts/I18nContext', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('Form persistence', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    vi.resetModules();
  });

  it('Login keeps email but clears password on auth error', async () => {
    const signInEmail = vi.fn(() => Promise.reject(new Error('invalid')));
    vi.doMock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        signInEmail,
        signInGoogle: vi.fn(),
        error: null,
        clearError: vi.fn(),
        loading: false,
      }),
    }));

    const { default: Login } = await import('@/pages/Login');

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('email@secure.tech'), { target: { value: 'demo@secure.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass' } });

    fireEvent.submit(screen.getByRole('button', { name: /auth.login.cta/i }));

    await waitFor(() =>
      expect((screen.getByPlaceholderText('••••••••') as HTMLInputElement).value).toBe('')
    );
    expect((screen.getByPlaceholderText('email@secure.tech') as HTMLInputElement).value).toBe(
      'demo@secure.com'
    );
  });

  it('Register keeps fields when validation fails', async () => {
    vi.doMock('@/contexts/AuthContext', () => ({
      useAuth: () => ({
        signUpEmail: vi.fn(),
        error: null,
        clearError: vi.fn(),
        loading: false,
      }),
    }));

    const { default: Register } = await import('@/pages/Register');

    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Ej: Ana Gómez'), { target: { value: 'Ana Test' } });
    fireEvent.change(screen.getByPlaceholderText('+32 470 000 000'), { target: { value: '+32470000000' } });
    fireEvent.change(screen.getByPlaceholderText('correo@ejemplo.com'), { target: { value: 'ana@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 6 caracteres'), { target: { value: '123' } });

    fireEvent.submit(screen.getByRole('button', { name: /auth.register.cta/i }));

    expect((screen.getByPlaceholderText('Ej: Ana Gómez') as HTMLInputElement).value).toBe('Ana Test');
    expect((screen.getByPlaceholderText('correo@ejemplo.com') as HTMLInputElement).value).toBe(
      'ana@test.com'
    );
    expect((screen.getByPlaceholderText('Mínimo 6 caracteres') as HTMLInputElement).value).toBe('123');
  });

  it('Collateral form keeps values when required field missing', async () => {
    vi.doMock('@/contexts/AuthContext', () => ({
      useAuth: () => ({ user: { uid: '123' }, userData: { fullName: 'Tester' } }),
    }));
    vi.doMock('@tanstack/react-query', () => ({
      useQuery: () => ({ data: [], isLoading: false }),
      useMutation: (opts: { mutationFn: () => unknown }) => ({
        mutate: () => opts.mutationFn(),
        isPending: false,
      }),
      useQueryClient: () => ({ invalidateQueries: vi.fn() }),
    }));
    vi.doMock('@/lib/firestoreClient', () => ({
      listCollaterals: () => [],
      registerCollateralWithRefs: vi.fn(),
      uploadFile: vi.fn(),
    }));

    const { default: CustomerCollateral } = await import('@/pages/customer/Collateral');

    render(
      <MemoryRouter>
        <CustomerCollateral />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByText('collateral.add.cta')[0]);

    fireEvent.change(screen.getByPlaceholderText("Ej: MacBook Pro M3 14'"), { target: { value: 'MacBook' } });
    fireEvent.change(screen.getByPlaceholderText('Ej: Como nuevo'), { target: { value: 'Nuevo' } });
    fireEvent.change(screen.getByPlaceholderText('IMEI / Serial Number'), { target: { value: '' } });
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '1200' } });

    fireEvent.click(screen.getByRole('button', { name: /collateral.form.submit/i }));

    expect((screen.getByPlaceholderText("Ej: MacBook Pro M3 14'") as HTMLInputElement).value).toBe('MacBook');
    expect((screen.getByRole('spinbutton') as HTMLInputElement).value).toBe('1200');
  });
});
