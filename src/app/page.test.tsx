import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import HomePage from './page';
import { useTeacherGuard } from '@/hooks/useTeacherGuard';
import { getTeacherGradingRequests } from '@/lib/teacher-api';

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
  getTeacherGradingRequests: jest.fn(),
}));

jest.mock('@/components/teacher-shell', () => ({
  TeacherShell: ({
    title,
    children,
  }: {
    title: string;
    children: ReactNode;
  }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

describe('Teacher HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state while teacher guard is loading', () => {
    (useTeacherGuard as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
      syncError: null,
    });

    render(<HomePage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders dashboard and review list', async () => {
    (useTeacherGuard as jest.Mock).mockReturnValue({
      user: { displayName: 'Teacher A', email: 'teacher@example.com' },
      token: 'token-1',
      profile: { creditBalance: 150 },
      loading: false,
      syncError: null,
    });
    (getTeacherGradingRequests as jest.Mock).mockResolvedValue([
      {
        id: 'gr-1',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        attempt: {
          candidate: { name: 'Candidate One', email: 'c1@example.com' },
          test: { sectionTypes: ['WRITING'] },
        },
      },
    ]);

    render(<HomePage />);

    expect(screen.getByText('Welcome back, Teacher')).toBeInTheDocument();
    expect(screen.getByText('Pending Submissions')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Candidate One')).toBeInTheDocument();
    });
  });

  it('uses explicit targetSectionType from API response for route labeling', async () => {
    (useTeacherGuard as jest.Mock).mockReturnValue({
      user: { displayName: 'Teacher A', email: 'teacher@example.com' },
      token: 'token-1',
      profile: { creditBalance: 150 },
      loading: false,
      syncError: null,
    });
    (getTeacherGradingRequests as jest.Mock).mockResolvedValue([
      {
        id: 'gr-2',
        status: 'PENDING',
        targetSectionType: 'SPEAKING',
        createdAt: new Date().toISOString(),
        attempt: {
          candidate: { name: 'Candidate Two', email: 'c2@example.com' },
          test: { sectionTypes: ['WRITING', 'SPEAKING'] },
        },
      },
    ]);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText('Speaking Mock')).toBeInTheDocument();
    });
  });

  it('renders sync error banner', () => {
    (useTeacherGuard as jest.Mock).mockReturnValue({
      user: { displayName: 'Teacher A', email: 'teacher@example.com' },
      token: null,
      profile: { creditBalance: 0 },
      loading: false,
      syncError: 'Only TEACHER accounts can access teacher portal',
    });

    render(<HomePage />);
    expect(
      screen.getByText('Only TEACHER accounts can access teacher portal'),
    ).toBeInTheDocument();
  });
});
