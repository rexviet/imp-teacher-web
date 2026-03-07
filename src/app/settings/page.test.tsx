import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import SettingsPage from './page';
import { useTeacherGuard } from '@/hooks/useTeacherGuard';
import { updateTeacherProfile } from '@/lib/teacher-api';

jest.mock('lucide-react', () => {
  const MockIcon = () => null;
  return new Proxy(
    {},
    {
      get: () => MockIcon,
    },
  );
});

jest.mock('@/hooks/useTeacherGuard', () => ({
  useTeacherGuard: jest.fn(),
}));

jest.mock('@/lib/teacher-api', () => ({
  updateTeacherProfile: jest.fn(),
}));

jest.mock('@/components/teacher-shell', () => ({
  TeacherShell: ({ children, title }: { children: ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state', () => {
    (useTeacherGuard as jest.Mock).mockReturnValue({
      loading: true,
      user: null,
      profile: null,
      token: null,
    });

    render(<SettingsPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('saves settings via API when token exists', async () => {
    (useTeacherGuard as jest.Mock).mockReturnValue({
      loading: false,
      token: 'token-1',
      user: { displayName: 'Teacher A', email: 'teacher@example.com' },
      profile: {
        teacherProfile: {
          headline: 'Initial headline',
          bio: 'Initial bio',
          creditRate: 120,
        },
      },
    });
    (updateTeacherProfile as jest.Mock).mockResolvedValue({});

    render(<SettingsPage />);

    const headlineInput = screen.getByPlaceholderText('IELTS Speaking & Writing Examiner');
    const saveButton = screen.getByRole('button', { name: /Save Settings/i });

    fireEvent.change(headlineInput, { target: { value: 'New headline' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(updateTeacherProfile).toHaveBeenCalledWith('token-1', {
        headline: 'New headline',
        bio: 'Initial bio',
        creditRate: 120,
      });
    });

    expect(screen.getByText('Saved to backend.')).toBeInTheDocument();
  });

  it('shows error when token is missing', async () => {
    (useTeacherGuard as jest.Mock).mockReturnValue({
      loading: false,
      token: null,
      user: { displayName: 'Teacher A', email: 'teacher@example.com' },
      profile: {
        teacherProfile: {
          headline: '',
          bio: '',
          creditRate: 120,
        },
      },
    });

    render(<SettingsPage />);

    fireEvent.click(screen.getByRole('button', { name: /Save Settings/i }));

    await waitFor(() => {
      expect(screen.getByText('Missing auth token')).toBeInTheDocument();
    });
  });
});
