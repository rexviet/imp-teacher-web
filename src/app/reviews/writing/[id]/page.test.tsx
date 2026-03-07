import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import WritingFeedbackPage from './page';
import { useTeacherGuard } from '@/hooks/useTeacherGuard';
import {
  getTeacherGradingDetail,
  saveTeacherGradingDraft,
  submitTeacherGrading,
} from '@/lib/teacher-api';

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
  getTeacherGradingDetail: jest.fn(),
  saveTeacherGradingDraft: jest.fn(),
  submitTeacherGrading: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ id: 'gr-1' })),
}));

describe('WritingFeedbackPage', () => {
  const detailPayload = {
    id: 'gr-1',
    status: 'PENDING',
    feedback: 'Initial feedback',
    rubric: { task: 7, cohesion: 7, lexical: 6.5, grammar: 7 },
    attempt: {
      id: 'a-1',
      user: { id: 'u-1', name: 'Student A', email: 's@example.com' },
      answers: { 'q-writing-1': 'This is my IELTS essay text.' },
      test: {
        id: 't-1',
        title: 'Mock 1',
        sections: [
          {
            id: 'sec-writing',
            type: 'WRITING',
            order: 1,
            questions: [{ id: 'q-writing-1', order: 1, content: {} }],
          },
        ],
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTeacherGuard as jest.Mock).mockReturnValue({
      loading: false,
      token: 'token-1',
      user: { displayName: 'Teacher A', email: 'teacher@example.com' },
    });

    (getTeacherGradingDetail as jest.Mock).mockResolvedValue(detailPayload);
    (saveTeacherGradingDraft as jest.Mock).mockResolvedValue(detailPayload);
    (submitTeacherGrading as jest.Mock).mockResolvedValue(detailPayload);
  });

  it('loads detail and saves draft', async () => {
    render(<WritingFeedbackPage />);

    await waitFor(() => {
      expect(screen.getByText('Student A')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Save as Draft/i }));

    await waitFor(() => {
      expect(saveTeacherGradingDraft).toHaveBeenCalledWith(
        'token-1',
        'gr-1',
        {
          feedback: 'Initial feedback',
          rubric: {
            task: 7,
            cohesion: 7,
            lexical: 6.5,
            grammar: 7,
          },
        },
      );
    });

    expect(submitTeacherGrading).not.toHaveBeenCalled();
  });
});
