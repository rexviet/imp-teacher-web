import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import WalletPage from './page';
import { useTeacherGuard } from '@/hooks/useTeacherGuard';
import { getCreditTransactions } from '@/lib/teacher-api';

jest.mock('@/hooks/useTeacherGuard', () => ({
  useTeacherGuard: jest.fn(),
}));

jest.mock('@/lib/teacher-api', () => ({
  getCreditTransactions: jest.fn(),
}));

jest.mock('@/components/teacher-shell', () => ({
  TeacherShell: ({ children, title }: { children: ReactNode; title: string }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

describe('WalletPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (useTeacherGuard as jest.Mock).mockReturnValue({
      loading: true,
      user: null,
      token: null,
      profile: null,
    });

    render(<WalletPage />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders empty state when no transactions', () => {
    (useTeacherGuard as jest.Mock).mockReturnValue({
      loading: false,
      user: { displayName: 'Teacher A', email: 'teacher@example.com' },
      token: null,
      profile: { creditBalance: 50 },
    });

    render(<WalletPage />);

    expect(screen.getByText('No transactions found.')).toBeInTheDocument();
    expect(getCreditTransactions).not.toHaveBeenCalled();
  });

  it('renders transactions fetched from API', async () => {
    (useTeacherGuard as jest.Mock).mockReturnValue({
      loading: false,
      user: { displayName: 'Teacher A', email: 'teacher@example.com' },
      token: 'token-1',
      profile: { creditBalance: 120 },
    });
    (getCreditTransactions as jest.Mock).mockResolvedValue([
      {
        id: 'tx-1',
        amount: 80,
        type: 'EARN',
        description: 'Review payout',
        createdAt: '2026-03-07T10:00:00.000Z',
      },
      {
        id: 'tx-2',
        amount: 20,
        type: 'SPEND',
        description: 'Platform fee',
        createdAt: '2026-03-07T11:00:00.000Z',
      },
    ]);

    render(<WalletPage />);

    await waitFor(() => {
      expect(screen.getByText('Review payout')).toBeInTheDocument();
      expect(screen.getByText('Platform fee')).toBeInTheDocument();
    });

    expect(screen.getByText('+80 CR')).toBeInTheDocument();
    expect(getCreditTransactions).toHaveBeenCalledWith('token-1');
  });
});
