import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';
import { useTeacherGuard } from './useTeacherGuard';
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

describe('useTeacherGuard', () => {
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

    renderHook(() => useTeacherGuard());

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/login');
    });
  });

  it('sets profile when backend confirms teacher role', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { displayName: 'Teacher A', email: 'teacher@example.com' },
      token: 'token-1',
      loading: false,
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'u-1',
        name: 'Teacher A',
        email: 'teacher@example.com',
        role: 'TEACHER',
        creditBalance: 200,
      }),
    }) as jest.Mock;

    const { result } = renderHook(() => useTeacherGuard());

    await waitFor(() => {
      expect(result.current.profile?.role).toBe('TEACHER');
      expect(result.current.syncError).toBeNull();
    });
  });

  it('signs out and redirects when role is not teacher', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { displayName: 'Student A', email: 'student@example.com' },
      token: 'token-2',
      loading: false,
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'u-2',
        name: 'Student A',
        email: 'student@example.com',
        role: 'STUDENT',
        creditBalance: 0,
      }),
    }) as jest.Mock;

    const { result } = renderHook(() => useTeacherGuard());

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(replaceMock).toHaveBeenCalledWith('/login');
      expect(result.current.syncError).toBe(
        'Only TEACHER accounts can access teacher portal',
      );
    });
  });
});
