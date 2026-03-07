import type { TeacherGradingDetail } from './teacher-api';

type RubricScoreMap = Record<string, number>;

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

export function normalizeRubricScores(
  rubric: Record<string, unknown> | null | undefined,
  keys: string[],
): RubricScoreMap {
  const result: RubricScoreMap = {};
  keys.forEach((key) => {
    const value = rubric ? toNumber(rubric[key]) : null;
    if (value !== null) {
      result[key] = value;
    }
  });
  return result;
}

export function computeAverageBand(scores: number[]) {
  if (scores.length === 0) {
    return 0;
  }
  const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Math.round(avg * 2) / 2;
}

export function getWritingResponseText(detail: TeacherGradingDetail) {
  const answers = detail.attempt.answers;
  if (!answers || typeof answers !== 'object') {
    return '';
  }

  const writingQuestionIds = new Set(
    detail.attempt.test.sections
      .filter((section) => section.type === 'WRITING')
      .flatMap((section) => section.questions.map((question) => question.id)),
  );

  for (const [questionId, value] of Object.entries(answers)) {
    if (!writingQuestionIds.has(questionId)) {
      continue;
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return '';
}

export function getSpeakingTranscript(detail: TeacherGradingDetail) {
  const answers = detail.attempt.answers;
  if (!answers || typeof answers !== 'object') {
    return [];
  }

  const messages: Array<{ role: string; content: string }> = [];
  Object.values(answers).forEach((value) => {
    if (!value || typeof value !== 'object') {
      return;
    }
    const maybeHistory = (value as { history?: unknown }).history;
    if (!Array.isArray(maybeHistory)) {
      return;
    }

    maybeHistory.forEach((entry) => {
      if (!entry || typeof entry !== 'object') {
        return;
      }
      const role = (entry as { role?: unknown }).role;
      const content = (entry as { content?: unknown }).content;
      if (typeof role === 'string' && typeof content === 'string') {
        messages.push({ role, content });
      }
    });
  });

  return messages;
}
