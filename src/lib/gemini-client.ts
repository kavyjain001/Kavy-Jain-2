import { DoubtExplanation, SimplicityLevel, SubjectId, FollowUpMessage, PracticeDifficulty, PracticeQuestion } from '../types';

export async function requestDoubtExplanation(params: {
  doubt: string;
  subject: SubjectId;
  level: SimplicityLevel;
  imageBase64?: string;
  imageMimeType?: string;
}): Promise<DoubtExplanation> {
  const response = await fetch('/api/solve-doubt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Server error (${response.status})`);
  }

  return response.json();
}

export async function requestTtsAudio(text: string, voiceName: 'Kore' | 'Puck' | 'Zephyr' = 'Kore'): Promise<string> {
  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceName }),
  });

  if (!response.ok) {
    throw new Error('TTS service failed');
  }

  const data = await response.json();
  return `data:${data.mimeType};base64,${data.audioData}`;
}

export async function sendFollowUpDoubt(params: {
  initialConceptTitle: string;
  originalDoubt: string;
  level: SimplicityLevel;
  followUpQuestion: string;
  conversationHistory: FollowUpMessage[];
}): Promise<string> {
  const response = await fetch('/api/follow-up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to get follow-up answer');
  }

  const data = await response.json();
  return data.reply;
}

export async function requestPracticeProblems(params: {
  conceptTitle: string;
  level: SimplicityLevel;
  subject: SubjectId;
}) {
  const response = await fetch('/api/practice-problems', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to generate practice problems');
  }

  const data = await response.json();
  return data.problems;
}

export async function requestPracticeSession(params: {
  topic: string;
  subject: SubjectId;
  difficulty: PracticeDifficulty;
  numQuestions: number;
}): Promise<{
  topic: string;
  subject: SubjectId;
  difficulty: PracticeDifficulty;
  questions: PracticeQuestion[];
}> {
  const response = await fetch('/api/generate-practice-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate practice session');
  }

  return response.json();
}

// Local & Backend Database synchronization helpers
const STORAGE_KEY = 'clarity_saved_doubts_v1';

export async function fetchSavedDoubtsFromDb(): Promise<DoubtExplanation[]> {
  try {
    const res = await fetch('/api/db/doubts');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.doubts)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.doubts));
        return data.doubts;
      }
    }
  } catch (err) {
    console.warn('Backend database fetch failed, falling back to local storage cache:', err);
  }
  return getSavedDoubts();
}

export function getSavedDoubts(): DoubtExplanation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Failed to load saved doubts', e);
    return [];
  }
}

export async function saveDoubtToStorage(explanation: DoubtExplanation): Promise<void> {
  // 1. Save to local cache
  try {
    const current = getSavedDoubts();
    const exists = current.some((d) => d.id === explanation.id || d.title === explanation.title);
    if (!exists) {
      const updated = [explanation, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error('Failed to save doubt locally', e);
  }

  // 2. Persist to backend database
  try {
    await fetch('/api/db/doubts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(explanation),
    });
  } catch (e) {
    console.warn('Failed to persist doubt to backend database:', e);
  }
}

export async function removeDoubtFromStorage(id: string): Promise<void> {
  // 1. Remove from local cache
  try {
    const current = getSavedDoubts();
    const updated = current.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to remove doubt locally', e);
  }

  // 2. Remove from backend database
  try {
    await fetch(`/api/db/doubts/${id}`, {
      method: 'DELETE',
    });
  } catch (e) {
    console.warn('Failed to remove doubt from backend database:', e);
  }
}

export async function updateFlashcardMastery(doubtId: string, cardId: string, mastered: boolean): Promise<void> {
  try {
    const current = getSavedDoubts();
    const updated = current.map((d) => {
      if (d.id === doubtId) {
        return {
          ...d,
          flashcards: d.flashcards.map((fc) => (fc.id === cardId ? { ...fc, mastered } : fc)),
        };
      }
      return d;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update flashcard locally', e);
  }

  try {
    await fetch(`/api/db/flashcards/${doubtId}/${cardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mastered }),
    });
  } catch (e) {
    console.warn('Failed to update flashcard in backend database:', e);
  }
}

// Practice Results Database helpers
export async function savePracticeResultToDb(result: {
  topic: string;
  subject: string;
  difficulty: string;
  scorePct: number;
  correctCount: number;
  totalCount: number;
  timeSpentSeconds: number;
}) {
  try {
    const res = await fetch('/api/db/practice-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to save practice result to database:', e);
  }
  return null;
}

export async function fetchPracticeResultsFromDb() {
  try {
    const res = await fetch('/api/db/practice-results');
    if (res.ok) {
      const data = await res.json();
      return data.results || [];
    }
  } catch (e) {
    console.warn('Failed to fetch practice results:', e);
  }
  return [];
}

// Pomodoro Study Sessions Database helpers
export async function logStudySessionToDb(mode: string, durationMinutes: number) {
  try {
    const res = await fetch('/api/db/study-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, durationMinutes }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Failed to log study session to database:', e);
  }
  return null;
}

// Database status helper
export async function fetchDatabaseHealth() {
  try {
    const res = await fetch('/api/db/status');
    if (res.ok) return await res.json();
  } catch (e) {}
  return { status: 'offline', storageType: 'localStorage fallback' };
}
