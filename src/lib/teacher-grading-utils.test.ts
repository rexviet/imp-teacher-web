import type { TeacherGradingDetail } from './teacher-api';
import {
  computeAverageBand,
  getSpeakingTranscript,
  getWritingResponseText,
  normalizeRubricScores,
} from './teacher-grading-utils';

function mockDetail(
  answers: Record<string, unknown> | null,
  sections: TeacherGradingDetail['attempt']['test']['sections'] = [],
): TeacherGradingDetail {
  return {
    id: 'gr-1',
    status: 'PENDING',
    attempt: {
      id: 'a-1',
      answers,
      createdAt: new Date().toISOString(),
      user: { id: 'u-1', name: 'Student A', email: 'a@example.com' },
      test: {
        id: 't-1',
        title: 'Mock test',
        sections,
      },
    },
  };
}

describe('teacher-grading-utils', () => {
  it('normalizes rubric scores from number and numeric string', () => {
    const result = normalizeRubricScores(
      { task: 7, lexical: '6.5', invalid: 'abc' },
      ['task', 'lexical', 'invalid', 'missing'],
    );

    expect(result).toEqual({ task: 7, lexical: 6.5 });
  });

  it('computes average and rounds to nearest 0.5', () => {
    expect(computeAverageBand([6, 6.5, 7.5, 7])).toBe(7);
    expect(computeAverageBand([6, 6, 6.5, 6.5])).toBe(6.5);
    expect(computeAverageBand([])).toBe(0);
  });

  it('returns first non-empty writing response from answers payload', () => {
    const detail = mockDetail(
      { q1: 'Listening answer', q2: 'Essay text', q3: 'Another one' },
      [
        {
          id: 's-reading',
          type: 'READING',
          order: 1,
          questions: [{ id: 'q1', order: 1, content: {} }],
        },
        {
          id: 's-writing',
          type: 'WRITING',
          order: 2,
          questions: [{ id: 'q2', order: 1, content: {} }],
        },
      ],
    );

    expect(getWritingResponseText(detail)).toBe('Essay text');
  });

  it('extracts speaking transcript messages from nested history', () => {
    const detail = mockDetail({
      q1: {
        history: [
          { role: 'EXAMINER', content: 'How are you?' },
          { role: 'STUDENT', content: 'I am fine.' },
        ],
      },
      q2: { history: [{ role: 'STUDENT', content: 'Second answer' }] },
      q3: { history: [{ role: 'SYSTEM', message: 'ignored' }] },
    });

    expect(getSpeakingTranscript(detail)).toEqual([
      { role: 'EXAMINER', content: 'How are you?' },
      { role: 'STUDENT', content: 'I am fine.' },
      { role: 'STUDENT', content: 'Second answer' },
    ]);
  });
});
