import {
  getTeacherGradingDetail,
  registerTeacher,
  saveTeacherGradingDraft,
  submitTeacherGrading,
  updateTeacherProfile,
} from './teacher-api';

describe('teacher-api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
  });

  it('sends register teacher request with bearer token and payload', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'u-1', role: 'TEACHER' }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await registerTeacher('token-1', { role: 'TEACHER', name: 'Teacher A' });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/users/register',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ role: 'TEACHER', name: 'Teacher A' }),
        headers: expect.objectContaining({
          Authorization: 'Bearer token-1',
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('calls grading detail endpoint with request id', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'gr-1' }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await getTeacherGradingDetail('token-2', 'gr-1');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/teacher/grading-requests/gr-1',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token-2' }),
      }),
    );
  });

  it('sends grading draft payload to draft endpoint', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'gr-1', status: 'IN_PROGRESS' }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await saveTeacherGradingDraft('token-4', 'gr-1', {
      feedback: 'Draft feedback',
      rubric: { task: 7, cohesion: 7 },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/teacher/grading-requests/gr-1/draft',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({
          feedback: 'Draft feedback',
          rubric: { task: 7, cohesion: 7 },
        }),
        headers: expect.objectContaining({ Authorization: 'Bearer token-4' }),
      }),
    );
  });

  it('sends finalScore payload to submit endpoint', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ id: 'gr-1', status: 'COMPLETED', finalScore: 7.5 }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await submitTeacherGrading('token-5', 'gr-1', {
      feedback: 'Final feedback',
      rubric: { task: 7.5, cohesion: 7.5, lexical: 7, grammar: 7 },
      finalScore: 7.5,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5000/api/v1/teacher/grading-requests/gr-1/submit',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          feedback: 'Final feedback',
          rubric: { task: 7.5, cohesion: 7.5, lexical: 7, grammar: 7 },
          finalScore: 7.5,
        }),
        headers: expect.objectContaining({ Authorization: 'Bearer token-5' }),
      }),
    );
  });

  it('throws backend error text when response is not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: async () => 'Forbidden',
    }) as unknown as typeof fetch;

    await expect(
      updateTeacherProfile('token-3', { creditRate: 50 }),
    ).rejects.toThrow('Forbidden');
  });

  it('throws when NEXT_PUBLIC_API_URL is missing', async () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    await expect(
      registerTeacher('token-1', { role: 'TEACHER' }),
    ).rejects.toThrow('NEXT_PUBLIC_API_URL is missing');
  });
});
