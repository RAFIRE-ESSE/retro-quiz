/**
 * In-Memory Seed Data & Types for Retro Vintage Quiz
 * Used as default questions and resilient fallback when MS SQL is in offline mode.
 */

export interface Question {
  id: number;
  questionText: string;
  codeSnippet?: string | null;
  options: string[];
  correctOption: number; // 0=A, 1=B, 2=C, 3=D
  explanation: string;
  difficulty?: string;
}

export interface Quiz {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  difficulty: string;
  questions: Question[];
}

export interface ScoreRecord {
  id: number;
  quizId: number;
  quizTitle: string;
  gamerTag: string;
  score: number;
  accuracy: number;
  maxStreak: number;
  gameMode: string;
  timeSpentSeconds: number;
  playedAt: string;
}

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 1,
    slug: 'retro-tech',
    title: '80s & 90s Retro Computing',
    description: 'Floppy disks, dial-up modems, CRT monitors, and iconic classic computers.',
    category: 'retro-tech',
    icon: '💾',
    difficulty: 'medium',
    questions: [
      {
        id: 101,
        questionText: 'What was the standard storage capacity of a typical 3.5-inch High-Density (HD) floppy disk in the 1990s?',
        options: ['720 KB', '1.44 MB', '2.88 MB', '10 MB'],
        correctOption: 1,
        explanation: 'The standard 3.5-inch MF2HD floppy disk held 1.44 Megabytes of formatted data.'
      },
      {
        id: 102,
        questionText: 'In what year was the revolutionary Commodore 64 home computer released?',
        options: ['1979', '1982', '1985', '1989'],
        correctOption: 1,
        explanation: 'The Commodore 64 was introduced in January 1982 and became the highest-selling single computer model of all time.'
      },
      {
        id: 103,
        questionText: 'What popular dial-up Internet service was famous for mailing millions of trial CDs in the 1990s and saying "You have got mail!"?',
        options: ['Prodigy', 'America Online (AOL)', 'CompuServe', 'EarthLink'],
        correctOption: 1,
        explanation: 'AOL saturated mailboxes worldwide with promotional 3.5-inch floppies and CD-ROMs offering free trial hours.'
      },
      {
        id: 104,
        questionText: 'Which sound card from Creative Technology dominated PC gaming audio throughout the late 1980s and 1990s?',
        options: ['AdLib', 'Sound Blaster', 'Roland MT-32', 'Gravis UltraSound'],
        correctOption: 1,
        explanation: 'Creative Labs released the Sound Blaster 1.0 in 1989, setting the standard for PC sound synthesis and digital audio.'
      },
      {
        id: 105,
        questionText: 'What does the abbreviation "CRT" stand for in vintage computer monitors and television sets?',
        options: ['Cathode Ray Tube', 'Color Raster Terminal', 'Computer Rendering Tube', 'Crystalline Ray Transistor'],
        correctOption: 0,
        explanation: 'CRT stands for Cathode Ray Tube, which directed beams of electrons onto a phosphorescent screen.'
      },
      {
        id: 106,
        questionText: 'Which legendary operating system was released on August 24, 1995, introducing the "Start" button and Taskbar?',
        options: ['Windows 3.1', 'Windows 95', 'OS/2 Warp', 'Macintosh System 7'],
        correctOption: 1,
        explanation: 'Windows 95 introduced the Start menu, 32-bit architecture, preemptive multitasking, and long filenames.'
      }
    ]
  },
  {
    id: 2,
    slug: 'web-dev',
    title: 'Web Dev & Modern Code',
    description: 'Test your mastery of JavaScript, CSS, React, SQL, and Algorithms.',
    category: 'web-dev',
    icon: '💻',
    difficulty: 'medium',
    questions: [
      {
        id: 201,
        questionText: 'Which keyword in modern JavaScript creates a block-scoped variable that can be reassigned?',
        options: ['var', 'let', 'const', 'global'],
        correctOption: 1,
        explanation: '`let` provides block-scoped mutable variable declaration in modern ES6+ JavaScript.'
      },
      {
        id: 202,
        questionText: 'What will the following JavaScript expression evaluate to in the console?',
        codeSnippet: 'console.log(typeof NaN);',
        options: ['"undefined"', '"number"', '"NaN"', '"object"'],
        correctOption: 1,
        explanation: 'In JavaScript, `NaN` (Not a Number) is classified under the numeric type per IEEE-754 specifications.'
      },
      {
        id: 203,
        questionText: 'Which React hook is designed for executing synchronous side effects immediately before browser paint?',
        options: ['useEffect', 'useLayoutEffect', 'useMemo', 'useImperativeHandle'],
        correctOption: 1,
        explanation: '`useLayoutEffect` fires synchronously immediately after DOM mutations, before the browser paints visual updates.'
      },
      {
        id: 204,
        questionText: 'In Microsoft SQL Server, which function returns the current system UTC date and time with high fractional precision?',
        options: ['GETDATE()', 'NOW()', 'SYSUTCDATETIME()', 'CURRENT_TIME()'],
        correctOption: 2,
        explanation: '`SYSUTCDATETIME()` returns a DATETIME2 value in UTC containing the current date and time with high nanosecond precision.'
      },
      {
        id: 205,
        questionText: 'What is the average time complexity of finding an element in a balanced Binary Search Tree (BST)?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
        correctOption: 2,
        explanation: 'Each comparison eliminates half of the remaining search space, giving logarithmic time O(log n).'
      }
    ]
  },
  {
    id: 3,
    slug: 'science-discovery',
    title: 'Science & The Cosmos',
    description: 'Relativity, quantum physics, space exploration, and natural wonders.',
    category: 'science',
    icon: '🔬',
    difficulty: 'medium',
    questions: [
      {
        id: 301,
        questionText: 'Which planet in our solar system has the most extensive and visually prominent ring system?',
        options: ['Jupiter', 'Saturn', 'Uranus', 'Neptune'],
        correctOption: 1,
        explanation: 'Saturn possesses the most spectacular ring system composed of billions of particles of water ice and rock.'
      },
      {
        id: 302,
        questionText: 'What is the approximate speed of light in a vacuum?',
        options: ['300,000 km/s', '150,000 km/s', '3,000,000 km/s', '30,000 km/s'],
        correctOption: 0,
        explanation: 'The speed of light in vacuum is approximately 299,792 km/s (or about 300,000 km/s).'
      },
      {
        id: 303,
        questionText: 'Which subatomic particle has a negative electric charge?',
        options: ['Proton', 'Neutron', 'Electron', 'Positron'],
        correctOption: 2,
        explanation: 'Electrons carry a fundamental negative electrical charge of -1e.'
      },
      {
        id: 304,
        questionText: 'Who formulated the famous General Theory of Relativity published in 1915?',
        options: ['Isaac Newton', 'Albert Einstein', 'Niels Bohr', 'Max Planck'],
        correctOption: 1,
        explanation: 'Albert Einstein published his geometric theory of gravitation, General Relativity, in 1915.'
      }
    ]
  },
  {
    id: 4,
    slug: 'world-trivia',
    title: 'World History & Wonders',
    description: 'Historic milestones, architecture, geography, and cultural trivia.',
    category: 'history',
    icon: '🏛️',
    difficulty: 'easy',
    questions: [
      {
        id: 401,
        questionText: 'Which ancient wonder was located in Alexandria, Egypt, serving as a beacon for sailors in the Mediterranean?',
        options: ['Colossus of Rhodes', 'Lighthouse of Alexandria', 'Hanging Gardens', 'Temple of Artemis'],
        correctOption: 1,
        explanation: 'The Pharos of Alexandria was built in the 3rd century BC and stood over 100 meters tall.'
      },
      {
        id: 402,
        questionText: 'What is the capital city of Australia?',
        options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
        correctOption: 2,
        explanation: 'Canberra was chosen in 1908 as the compromise capital between Melbourne and Sydney.'
      },
      {
        id: 403,
        questionText: 'Which treaty signed in 1919 formally brought an end to World War I?',
        options: ['Treaty of Versailles', 'Treaty of Paris', 'Treaty of Ghent', 'Treaty of Rome'],
        correctOption: 0,
        explanation: 'The Treaty of Versailles was signed on June 28, 1919 in the Hall of Mirrors at Versailles.'
      }
    ]
  }
];

export const INITIAL_LEADERBOARD: ScoreRecord[] = [
  {
    id: 1,
    quizId: 1,
    quizTitle: '80s & 90s Retro Computing',
    gamerTag: 'RETRO_KING',
    score: 1450,
    accuracy: 100,
    maxStreak: 6,
    gameMode: 'standard',
    timeSpentSeconds: 42,
    playedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 2,
    quizId: 1,
    quizTitle: '80s & 90s Retro Computing',
    gamerTag: 'PIXEL_CHAMP',
    score: 1280,
    accuracy: 83,
    maxStreak: 5,
    gameMode: 'standard',
    timeSpentSeconds: 55,
    playedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: 3,
    quizId: 2,
    quizTitle: 'Web Dev & Modern Code',
    gamerTag: 'BYTE_RUNNER',
    score: 1520,
    accuracy: 100,
    maxStreak: 5,
    gameMode: 'standard',
    timeSpentSeconds: 38,
    playedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 4,
    quizId: 2,
    quizTitle: 'Web Dev & Modern Code',
    gamerTag: 'CODE_NINJA',
    score: 1310,
    accuracy: 80,
    maxStreak: 4,
    gameMode: 'standard',
    timeSpentSeconds: 49,
    playedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 5,
    quizId: 1,
    quizTitle: '80s & 90s Retro Computing',
    gamerTag: 'SYNTH_WAVE',
    score: 1100,
    accuracy: 83,
    maxStreak: 4,
    gameMode: 'blitz',
    timeSpentSeconds: 60,
    playedAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];
