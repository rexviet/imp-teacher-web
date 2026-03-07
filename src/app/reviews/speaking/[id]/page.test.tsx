import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SpeakingFeedbackPage from './page';
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
  useParams: jest.fn(() => ({ id: 'gr-2' })),
}));

describe('SpeakingFeedbackPage', () => {
  const detailPayload = {
    id: 'gr-2',
    status: 'PENDING',
    feedback: 'Initial speaking feedback',
    rubric: { fluency: 7, lexical: 6.5, grammar: 7, pronunciation: 6.5 },
    attempt: {
      id: 'a-2',
      user: { id: 'u-2', name: 'Student B', email: 'b@example.com' },
      masterAudioUrl: 'https://audio.example.com/master.webm',
      answers: {
        'q-speaking-1': {
          history: [
            { role: 'EXAMINER', content: 'Tell me about your hometown.' },
            { role: 'STUDENT', content: 'I come from a coastal city.' },
          ],
        },
      },
      test: {
        id: 't-2',
        title: 'Mock 2',
        sections: [
          {
            id: 'sec-speaking',
            type: 'SPEAKING',
            order: 1,
            questions: [{ id: 'q-speaking-1', order: 1, content: {} }],
          },
        ],
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTeacherGuard as jest.Mock).mockReturnValue({
      loading: false,
      token: 'token-2',
      user: { displayName: 'Teacher A', email: 'teacher@example.com' },
    });

    (getTeacherGradingDetail as jest.Mock).mockResolvedValue(detailPayload);
    (saveTeacherGradingDraft as jest.Mock).mockResolvedValue(detailPayload);
    (submitTeacherGrading as jest.Mock).mockResolvedValue(detailPayload);
  });

  it('loads detail and submits grading', async () => {
    render(<SpeakingFeedbackPage />);

    await waitFor(() => {
      expect(screen.getByText(/Speaking Grading/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit All Grades/i }));

    await waitFor(() => {
      expect(submitTeacherGrading).toHaveBeenCalledWith(
        'token-2',
        'gr-2',
        expect.objectContaining({
          feedback: 'Initial speaking feedback',
        }),
      );
    });
  });
});
