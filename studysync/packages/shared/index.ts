export interface AIStudyResponse {
  summary: string;
  roadmap: string[];
  quiz: { question: string; answer: string }[];
  complexityScore: number;
}

export interface UserPod {
  id: string;
  topic: string;
  aiData?: AIStudyResponse;
  rentItsStatus: 'unlinked' | 'linked' | 'verified';
}
