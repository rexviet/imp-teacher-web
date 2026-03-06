import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import HomePage from './page';
import { useTeacherGuard } from '@/hooks/useTeacherGuard';

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

  it('renders dashboard and review list', () => {
    (useTeacherGuard as jest.Mock).mockReturnValue({
      user: { displayName: 'Teacher A', email: 'teacher@example.com' },
      loading: false,
      syncError: null,
    });

    render(<HomePage />);

    expect(screen.getByText('Welcome back, Teacher')).toBeInTheDocument();
    expect(screen.getByText('Pending Submissions')).toBeInTheDocument();
    expect(screen.getByText('Alexander Sterling')).toBeInTheDocument();
  });

  it('renders sync error banner', () => {
    (useTeacherGuard as jest.Mock).mockReturnValue({
      user: { displayName: 'Teacher A', email: 'teacher@example.com' },
      loading: false,
      syncError: 'Only TEACHER accounts can access teacher portal',
    });

    render(<HomePage />);
    expect(
      screen.getByText('Only TEACHER accounts can access teacher portal'),
    ).toBeInTheDocument();
  });
});
