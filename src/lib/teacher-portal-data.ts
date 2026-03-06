export type ReviewType = 'WRITING' | 'LISTENING';

export interface TeacherReviewItem {
  id: string;
  type: ReviewType;
  candidateName: string;
  candidateId: string;
  submittedAt: string;
  duration: string;
  targetBand: number;
  prompt: string;
  responseText?: string;
  transcript?: Array<{ speaker: 'STUDENT' | 'EXAMINER'; text: string }>;
  audioUrl?: string;
}

export const MOCK_TEACHER_REVIEWS: TeacherReviewItem[] = [
  {
    id: 'wr-4829',
    type: 'WRITING',
    candidateName: 'Alexander Sterling',
    candidateId: '88291',
    submittedAt: '2026-03-05T10:30:00.000Z',
    duration: '38:12',
    targetBand: 7.0,
    prompt:
      'In contemporary society, the debate regarding whether technological advancements have improved human communication remains highly contentious. Discuss both views and give your own opinion.',
    responseText:
      'In contemporary society, the debate regarding whether technological advancements have improved human communication remains highly contentious. While some argue that digital tools have isolated individuals, I believe that technology has fundamentally enhanced our ability to connect globally. Firstly, the speed of information transfer has reached unprecedented levels. In the past, letters took weeks to arrive; however, today\'s instant messaging allows for real-time interaction regardless of geographic boundaries. This is particularly beneficial for international businesses and families separated by distance. Furthermore, the cost of communication has plummeted. High-speed internet and free calling applications have made it possible for anyone with a basic device to maintain relationships. This democratization of access ensures that socio-economic status is no longer a primary barrier to staying informed and connected. However, critics point out that the quality of face-to-face interactions may have diminished. People often find themselves distracted by notifications during physical gatherings. Despite this, the sheer volume of positive connections facilitated by the internet outweighs these minor social drawbacks. In conclusion, although there are minor negative impacts on social etiquette, the overall effect of technology on communication is overwhelmingly positive. It has bridged gaps and created a more integrated global community.',
  },
  {
    id: 'ls-7712',
    type: 'LISTENING',
    candidateName: 'Mina Tran',
    candidateId: '90411',
    submittedAt: '2026-03-05T13:45:00.000Z',
    duration: '04:30',
    targetBand: 6.5,
    prompt:
      'Part 2: Describe a recent experience that changed your perspective.',
    audioUrl:
      'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
    transcript: [
      {
        speaker: 'EXAMINER',
        text: 'Describe a recent experience that changed your perspective.',
      },
      {
        speaker: 'STUDENT',
        text: 'Last year I volunteered at a community shelter for three months. Before that, I thought success was mostly about individual achievement.',
      },
      {
        speaker: 'STUDENT',
        text: 'Working with families there showed me how support systems can dramatically change outcomes. I became more empathetic and practical.',
      },
    ],
  },
  {
    id: 'wr-5091',
    type: 'WRITING',
    candidateName: 'Liam Pham',
    candidateId: '90008',
    submittedAt: '2026-03-06T08:20:00.000Z',
    duration: '35:04',
    targetBand: 7.5,
    prompt:
      'Some people believe universities should focus on academic subjects. Others think practical skills are more important. Discuss both views.',
    responseText:
      'Universities have traditionally prioritized academic theory, but modern economies increasingly demand practical capabilities. In my opinion, a balanced curriculum is the most effective approach.',
  },
];

export function getReviewById(id: string): TeacherReviewItem | undefined {
  return MOCK_TEACHER_REVIEWS.find((item) => item.id === id);
}

export function getDashboardStats() {
  const pending = MOCK_TEACHER_REVIEWS.length;
  const writing = MOCK_TEACHER_REVIEWS.filter((r) => r.type === 'WRITING').length;
  const listening = MOCK_TEACHER_REVIEWS.filter(
    (r) => r.type === 'LISTENING',
  ).length;

  return {
    pending,
    writing,
    listening,
    averageTargetBand: (
      MOCK_TEACHER_REVIEWS.reduce((sum, item) => sum + item.targetBand, 0) /
      Math.max(MOCK_TEACHER_REVIEWS.length, 1)
    ).toFixed(1),
  };
}
