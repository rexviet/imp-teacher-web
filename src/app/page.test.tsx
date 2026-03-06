import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import HomePage from './page';
import { useAuth } from '@/providers/AuthProvider';
import { signOut } from 'firebase/auth';

const replaceMock = jest.fn();

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/lib/firebase/config', () => ({
  auth: {},
}));

jest.mock('firebase/auth', () => ({
  signOut: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ replace: replaceMock })),
}));

describe('Teacher HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
  });

  it('redirects to /login when unauthenticated', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      token: null,
      loading: false,
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/login');
    });
  });

  it('renders teacher profile after successful TEACHER sync', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { displayName: 'Teacher A', email: 'teacher@example.com' },
      token: 'token-1',
      loading: false,
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 't-1',
        name: 'Teacher A',
        email: 'teacher@example.com',
        role: 'TEACHER',
        creditBalance: 100,
      }),
    }) as jest.Mock;

    render(<HomePage />);

    expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Role: TEACHER')).toBeInTheDocument();
      expect(screen.getByText('Credits: 100')).toBeInTheDocument();
    });
  });

  it('signs out and redirects when backend returns non-teacher role', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { displayName: 'Student A', email: 'student@example.com' },
      token: 'token-2',
      loading: false,
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'u-1',
        name: 'Student A',
        email: 'student@example.com',
        role: 'STUDENT',
        creditBalance: 0,
      }),
    }) as jest.Mock;

    render(<HomePage />);

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(replaceMock).toHaveBeenCalledWith('/login');
      expect(
        screen.getByText('Only TEACHER accounts can access teacher portal'),
      ).toBeInTheDocument();
    });
  });
});
