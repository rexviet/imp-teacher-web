export type TeacherRole = 'TEACHER' | 'STUDENT' | 'ADMIN';

export interface TeacherUserProfile {
  id: string;
  name: string | null;
  email: string;
  role: TeacherRole;
  creditBalance: number;
  teacherProfile?: {
    id: string;
    headline?: string | null;
    bio?: string | null;
    creditRate?: number | null;
  } | null;
}

export interface TeacherGradingListItem {
  targetSectionType?: 'WRITING' | 'SPEAKING';
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  feedback?: string | null;
  finalScore?: number | null;
  rubric?: Record<string, unknown> | null;
  attempt: {
    id: string;
    status: string;
    score?: number | null;
    createdAt: string;
    candidate: {
      id: string;
      name: string | null;
      email: string;
    };
    test: {
      id: string;
      title: string;
      sectionTypes: Array<'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING'>;
    };
  };
}

export interface TeacherGradingDetail {
  id: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  feedback?: string | null;
  finalScore?: number | null;
  rubric?: Record<string, unknown> | null;
  attempt: {
    id: string;
    answers?: Record<string, unknown> | null;
    aiGrades?: Record<string, unknown> | null;
    score?: number | null;
    masterAudioUrl?: string | null;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
    test: {
      id: string;
      title: string;
      sections: Array<{
        id: string;
        type: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';
        order: number;
        questions: Array<{
          id: string;
          order: number;
          content: unknown;
        }>;
      }>;
    };
  };
}

export interface CreditTransaction {
  id: string;
  amount: number;
  type: 'TOPUP' | 'SPEND' | 'EARN';
  description?: string | null;
  createdAt: string;
}

function getApiBaseUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is missing');
  }
  return apiUrl;
}

async function apiFetch<T>(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}/api/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function registerTeacher(
  token: string,
  payload: { name?: string | null; role: TeacherRole },
) {
  return apiFetch<TeacherUserProfile>(token, '/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(token: string) {
  return apiFetch<TeacherUserProfile>(token, '/users/me');
}

export function updateTeacherProfile(
  token: string,
  payload: { headline?: string; bio?: string; creditRate?: number },
) {
  return apiFetch<TeacherUserProfile>(token, '/users/me/teacher-profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function getTeacherGradingRequests(token: string) {
  return apiFetch<TeacherGradingListItem[]>(token, '/teacher/grading-requests');
}

export function getTeacherGradingDetail(token: string, requestId: string) {
  return apiFetch<TeacherGradingDetail>(
    token,
    `/teacher/grading-requests/${requestId}`,
  );
}

export function saveTeacherGradingDraft(
  token: string,
  requestId: string,
  payload: { feedback?: string; rubric?: Record<string, unknown> },
) {
  return apiFetch<TeacherGradingDetail>(
    token,
    `/teacher/grading-requests/${requestId}/draft`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export function submitTeacherGrading(
  token: string,
  requestId: string,
  payload: {
    feedback?: string;
    rubric?: Record<string, unknown>;
    finalScore: number;
  },
) {
  return apiFetch<TeacherGradingDetail>(
    token,
    `/teacher/grading-requests/${requestId}/submit`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export function getCreditTransactions(token: string) {
  return apiFetch<CreditTransaction[]>(token, '/credits/transactions');
}
