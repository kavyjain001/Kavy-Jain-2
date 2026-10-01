import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'clarity_db.json');

export interface PracticeResultRecord {
  id: string;
  topic: string;
  subject: string;
  difficulty: string;
  scorePct: number;
  correctCount: number;
  totalCount: number;
  timeSpentSeconds: number;
  timestamp: number;
}

export interface StudySessionRecord {
  id: string;
  mode: string;
  durationMinutes: number;
  timestamp: number;
}

export interface DatabaseSchema {
  doubts: any[];
  practiceResults: PracticeResultRecord[];
  studySessions: StudySessionRecord[];
  stats: {
    totalDoubtsSolved: number;
    totalPracticeTests: number;
    totalFocusMinutes: number;
  };
}

const DEFAULT_DB: DatabaseSchema = {
  doubts: [
    {
      id: 'doubt_default_zero_division',
      doubt: 'Why is dividing by zero mathematically undefined or impossible?',
      subject: 'math',
      level: 'highschool',
      timestamp: Date.now() - 3600000,
      title: 'Why Dividing by Zero Breaks the Rules of Mathematics',
      oneSentenceAha: 'Division is just asking "how many times can you subtract this number until you hit zero?" — and if you subtract zero, you will subtract forever and never finish.',
      simpleAnalogy: {
        title: 'The Cookie Jar with Zero-Ounce Scoops',
        story: 'Imagine you have a jar with 10 chocolate chip cookies, and you want to share them among friends. If you give 2 cookies to each friend, you can serve 5 friends (10 ÷ 2 = 5). But if you have a magic scoop that dishes out exactly 0 cookies per friend, how many friends can you serve until the jar is empty? You scoop 0 cookies for friend #1, friend #2, friend #1,000,000... the jar STILL has 10 cookies! You can never empty the jar.',
        connection: 'Because no finite number of zeroes can ever sum up to 10, there is no single answer to 10 ÷ 0. In algebra, division must have exactly one consistent answer, so mathematicians classify it as "undefined".',
      },
      coreConcept: {
        summary: 'In mathematics, division is the inverse operation of multiplication. For a / b = c to be true, it must be true that b * c = a. When b is zero, this equation becomes 0 * c = a. If a is not zero, no number c can ever make 0 * c nonzero.',
        keyPoints: [
          'Multiplication Inverse: If 12 ÷ 3 = 4, then 4 × 3 = 12. If 12 ÷ 0 = c, then c × 0 = 12, which is impossible because anything times zero is zero.',
          'Limits and Infinity: As you divide by numbers closer to zero, the answer grows toward +∞ from the positive side, but -∞ from the negative side.',
          'Two Contradicting Directions: Approaching from positive numbers yields +∞, while approaching from negative numbers yields -∞. A limit with two conflicting answers does not exist.',
        ],
      },
      stepByStep: [
        {
          step: 1,
          title: 'Define division as repeated subtraction',
          explanation: 'To compute 15 ÷ 5, you count how many times you can subtract 5 until reaching 0: 15 - 5 - 5 - 5 = 0 (3 times).',
          whyItMatters: 'It shows arithmetic is grounded in counting physical operations.',
        },
        {
          step: 2,
          title: 'Attempt repeated subtraction with zero',
          explanation: 'Try computing 10 ÷ 0: 10 - 0 = 10; 10 - 0 = 10... You can repeat this infinite times without ever changing the remaining number.',
          whyItMatters: 'The counting process never terminates or converges to an end state.',
        },
        {
          step: 3,
          title: 'Check the multiplication inverse rule',
          explanation: 'If 10 ÷ 0 = X, then X × 0 must equal 10. But by definition of zero in arithmetic, any number multiplied by zero equals zero.',
          whyItMatters: 'Allowing division by zero would destroy mathematical consistency and allow proving that 1 = 2.',
        },
      ],
      visualModel: {
        type: 'flow',
        caption: 'Why 10 / x diverges as x approaches 0 from both sides',
        content: '  x -> 0 (+): 10/0.0001 = 100,000 -> +Infinity\n  x -> 0 (-): 10/(-0.0001) = -100,000 -> -Infinity\n  Conclusion: +Infinity != -Infinity (Undefined)',
      },
      commonTraps: [
        'Assuming 10 ÷ 0 = 0 (Dividing into zero groups does not leave zero things).',
        'Assuming 10 ÷ 0 = Infinity (Infinity is not a real number).',
      ],
      realWorldApplication: 'CPU processors trigger hardware exceptions to prevent infinite division clock cycles.',
      quickQuiz: [
        {
          question: 'Why is 10 ÷ 0 not equal to 0?',
          options: [
            'Because if 10 ÷ 0 = 0, then 0 × 0 would have to equal 10, which is false.',
            'Because 10 is too large to fit into 0.',
            'Because calculators run out of battery.',
            'Because zero is an imaginary number.',
          ],
          correctIndex: 0,
          explanation: 'Division must reverse multiplication. 0 * 0 can never equal 10.',
        },
      ],
      flashcards: [
        {
          id: 'fc_sample_1',
          front: 'Why is dividing by zero considered "undefined"?',
          back: 'Because division is the inverse of multiplication, and no number multiplied by 0 can ever equal a non-zero number.',
          tip: 'Remember: a / 0 = c implies 0 * c = a.',
          mastered: false,
        },
      ],
      suggestedFollowUps: [
        'What is 0 divided by 0? Is that also undefined or indeterminate?',
        'How do calculus limits let us divide by numbers that get infinitely close to zero?',
      ],
    },
  ],
  practiceResults: [
    {
      id: 'pr_sample_1',
      topic: "Newton's Laws of Motion & Friction",
      subject: 'physics',
      difficulty: 'intermediate',
      scorePct: 80,
      correctCount: 4,
      totalCount: 5,
      timeSpentSeconds: 142,
      timestamp: Date.now() - 7200000,
    },
  ],
  studySessions: [
    {
      id: 'ss_sample_1',
      mode: 'focus',
      durationMinutes: 25,
      timestamp: Date.now() - 10800000,
    },
  ],
  stats: {
    totalDoubtsSolved: 1,
    totalPracticeTests: 1,
    totalFocusMinutes: 25,
  },
};

// Ensure data directory exists
function initDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to initialize database folder/file:', err);
  }
}

// Read database
export function readDb(): DatabaseSchema {
  initDb();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read db, returning default:', err);
    return DEFAULT_DB;
  }
}

// Write database atomically using temporary file to prevent corruption
export function writeDb(data: DatabaseSchema): boolean {
  initDb();
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  try {
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Failed to write db atomically:', err);
    try {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    } catch {}
    return false;
  }
}

// Database Operations
export const dbOps = {
  // Doubts
  getAllDoubts: () => {
    const db = readDb();
    return db.doubts || [];
  },

  getDoubtById: (id: string) => {
    const db = readDb();
    return (db.doubts || []).find((d) => d.id === id);
  },

  saveDoubt: (doubt: any) => {
    const db = readDb();
    const existingIndex = db.doubts.findIndex((d) => d.id === doubt.id || d.title === doubt.title);
    if (existingIndex >= 0) {
      db.doubts[existingIndex] = { ...db.doubts[existingIndex], ...doubt, updatedAt: Date.now() };
    } else {
      db.doubts.unshift(doubt);
      db.stats.totalDoubtsSolved = (db.stats.totalDoubtsSolved || 0) + 1;
    }
    writeDb(db);
    return doubt;
  },

  deleteDoubt: (id: string) => {
    const db = readDb();
    const prevLength = db.doubts.length;
    db.doubts = db.doubts.filter((d) => d.id !== id);
    writeDb(db);
    return db.doubts.length < prevLength;
  },

  updateFlashcard: (doubtId: string, cardId: string, mastered: boolean) => {
    const db = readDb();
    let updated = false;
    db.doubts = db.doubts.map((d) => {
      if (d.id === doubtId && Array.isArray(d.flashcards)) {
        return {
          ...d,
          flashcards: d.flashcards.map((fc: any) => {
            if (fc.id === cardId) {
              updated = true;
              return { ...fc, mastered };
            }
            return fc;
          }),
        };
      }
      return d;
    });
    if (updated) writeDb(db);
    return updated;
  },

  // Practice Results
  getPracticeResults: () => {
    const db = readDb();
    return db.practiceResults || [];
  },

  savePracticeResult: (result: Omit<PracticeResultRecord, 'id' | 'timestamp'>) => {
    const db = readDb();
    const newRecord: PracticeResultRecord = {
      ...result,
      id: `pr_${Date.now()}`,
      timestamp: Date.now(),
    };
    db.practiceResults.unshift(newRecord);
    db.stats.totalPracticeTests = (db.stats.totalPracticeTests || 0) + 1;
    writeDb(db);
    return newRecord;
  },

  // Study Sessions (Pomodoro)
  getStudySessions: () => {
    const db = readDb();
    return db.studySessions || [];
  },

  logStudySession: (mode: string, durationMinutes: number) => {
    const db = readDb();
    const newSession: StudySessionRecord = {
      id: `ss_${Date.now()}`,
      mode,
      durationMinutes,
      timestamp: Date.now(),
    };
    db.studySessions.unshift(newSession);
    if (mode === 'focus') {
      db.stats.totalFocusMinutes = (db.stats.totalFocusMinutes || 0) + durationMinutes;
    }
    writeDb(db);
    return newSession;
  },

  // Database Stats
  getStats: () => {
    const db = readDb();
    return {
      status: 'healthy',
      storageType: 'file-backed persistent JSON',
      stats: db.stats,
      counts: {
        doubts: db.doubts.length,
        practiceTests: db.practiceResults.length,
        studySessions: db.studySessions.length,
      },
    };
  },
};
