/**
 * Microsoft SQL Server Database Manager & Resilient Hybrid Layer
 * Connects to MS SQL / Azure SQL via 'mssql' package.
 * Seamlessly falls back to memory store if credentials are not configured or offline.
 */
import sql from 'mssql';
import { INITIAL_QUIZZES, INITIAL_LEADERBOARD, Quiz, Question, ScoreRecord } from './seedData';

export interface DbStatus {
  connected: boolean;
  mode: 'mssql' | 'offline_fallback';
  databaseName: string;
  server?: string;
  message: string;
  totalQuizzes: number;
  totalScores: number;
}

// In-Memory Storage Fallback (persists in Node runtime memory)
class MemoryStore {
  quizzes: Quiz[] = JSON.parse(JSON.stringify(INITIAL_QUIZZES));
  scores: ScoreRecord[] = JSON.parse(JSON.stringify(INITIAL_LEADERBOARD));

  getQuizzes() {
    return this.quizzes.map(q => ({
      id: q.id,
      slug: q.slug,
      title: q.title,
      description: q.description,
      category: q.category,
      icon: q.icon,
      difficulty: q.difficulty,
      questionCount: q.questions.length
    }));
  }

  getQuiz(idOrSlug: string | number) {
    const isNum = !isNaN(Number(idOrSlug));
    return this.quizzes.find(q => isNum ? q.id === Number(idOrSlug) : q.slug === idOrSlug);
  }

  createQuiz(data: { title: string; description: string; category: string; icon?: string; questions: Omit<Question, 'id'>[] }) {
    const newId = this.quizzes.length + 1;
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `quiz-${newId}`;
    
    const newQuiz: Quiz = {
      id: newId,
      slug,
      title: data.title,
      description: data.description,
      category: data.category || 'custom',
      icon: data.icon || '✨',
      difficulty: 'medium',
      questions: data.questions.map((q, idx) => ({
        id: newId * 100 + idx + 1,
        questionText: q.questionText,
        codeSnippet: q.codeSnippet || null,
        options: q.options,
        correctOption: q.correctOption,
        explanation: q.explanation
      }))
    };

    this.quizzes.unshift(newQuiz);
    return newQuiz;
  }

  getScores(limit = 20) {
    return [...this.scores].sort((a, b) => b.score - a.score).slice(0, limit);
  }

  saveScore(record: Omit<ScoreRecord, 'id' | 'playedAt'>) {
    const newRecord: ScoreRecord = {
      id: this.scores.length + 1,
      ...record,
      playedAt: new Date().toISOString()
    };
    this.scores.unshift(newRecord);
    return newRecord;
  }
}

const memoryStore = new MemoryStore();

// MSSQL Connection Configuration
const mssqlConfig: sql.config = {
  server: process.env.MSSQL_SERVER || '',
  port: parseInt(process.env.MSSQL_PORT || '1433', 10),
  database: process.env.MSSQL_DATABASE || 'QuizArcadeDB',
  user: process.env.MSSQL_USER || '',
  password: process.env.MSSQL_PASSWORD || '',
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === 'true',
    trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERTIFICATE !== 'false',
    enableArithAbort: true,
    connectTimeout: 10000,
    requestTimeout: 15000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise: Promise<sql.ConnectionPool> | null = null;
let isMssqlAvailable: boolean | null = null;
let lastErrorMsg = '';

async function getPool(): Promise<sql.ConnectionPool | null> {
  // If no server is defined in environment, skip immediately to memory store
  if (!process.env.MSSQL_SERVER) {
    isMssqlAvailable = false;
    lastErrorMsg = 'MSSQL_SERVER environment variable is not defined.';
    return null;
  }

  if (isMssqlAvailable === false) {
    return null;
  }

  if (!poolPromise) {
    poolPromise = sql.connect(mssqlConfig)
      .then(pool => {
        isMssqlAvailable = true;
        console.log(`[Database] Successfully connected to Microsoft SQL Server: ${mssqlConfig.server}/${mssqlConfig.database}`);
        return pool;
      })
      .catch(err => {
        isMssqlAvailable = false;
        lastErrorMsg = err.message || 'Connection to MS SQL failed';
        console.warn(`[Database Fallback] MS SQL connection failed (${lastErrorMsg}). Operating in Resilient Offline Mode with Seed Data.`);
        poolPromise = null;
        return null;
      });
  }

  return poolPromise;
}

export async function getDbStatus(): Promise<DbStatus> {
  try {
    const pool = await getPool();
    if (pool && pool.connected) {
      const quizCountResult = await pool.request().query('SELECT COUNT(*) AS count FROM Quizzes');
      const scoreCountResult = await pool.request().query('SELECT COUNT(*) AS count FROM Scores');

      return {
        connected: true,
        mode: 'mssql',
        server: mssqlConfig.server,
        databaseName: String(mssqlConfig.database),
        message: 'Connected to Microsoft SQL Server',
        totalQuizzes: quizCountResult.recordset[0]?.count || 0,
        totalScores: scoreCountResult.recordset[0]?.count || 0
      };
    }
  } catch (err: any) {
    lastErrorMsg = err?.message || 'Error querying MS SQL';
  }

  return {
    connected: false,
    mode: 'offline_fallback',
    databaseName: 'In-Memory / Local Seed',
    server: process.env.MSSQL_SERVER || 'Not configured',
    message: lastErrorMsg || 'MS SQL not reachable. Running on resilient offline fallback.',
    totalQuizzes: memoryStore.quizzes.length,
    totalScores: memoryStore.scores.length
  };
}

export async function getAllQuizzes() {
  const pool = await getPool();
  if (pool && pool.connected) {
    try {
      const result = await pool.request().query(`
        SELECT 
          q.QuizId AS id,
          q.Slug AS slug,
          q.Title AS title,
          q.Description AS description,
          q.Category AS category,
          q.Icon AS icon,
          q.Difficulty AS difficulty,
          COUNT(qn.QuestionId) AS questionCount
        FROM Quizzes q
        LEFT JOIN Questions qn ON q.QuizId = qn.QuizId
        GROUP BY q.QuizId, q.Slug, q.Title, q.Description, q.Category, q.Icon, q.Difficulty
        ORDER BY q.QuizId ASC
      `);
      return result.recordset;
    } catch (e) {
      console.error('MS SQL getAllQuizzes error, falling back to memory store:', e);
    }
  }

  return memoryStore.getQuizzes();
}

export async function getQuizBySlugOrId(idOrSlug: string | number) {
  const pool = await getPool();
  if (pool && pool.connected) {
    try {
      const isNum = !isNaN(Number(idOrSlug));
      const req = pool.request();
      let query = `SELECT QuizId, Slug, Title, Description, Category, Icon, Difficulty FROM Quizzes WHERE `;
      if (isNum) {
        req.input('id', sql.Int, Number(idOrSlug));
        query += `QuizId = @id`;
      } else {
        req.input('slug', sql.NVarChar, String(idOrSlug));
        query += `Slug = @slug`;
      }

      const quizRes = await req.query(query);
      if (quizRes.recordset.length === 0) return null;

      const qRow = quizRes.recordset[0];
      const questionsRes = await pool.request()
        .input('quizId', sql.Int, qRow.QuizId)
        .query(`
          SELECT QuestionId, QuestionText, CodeSnippet, OptionA, OptionB, OptionC, OptionD, CorrectOption, Explanation, Difficulty
          FROM Questions
          WHERE QuizId = @quizId
          ORDER BY QuestionId ASC
        `);

      const questions = questionsRes.recordset.map(qn => ({
        id: qn.QuestionId,
        questionText: qn.QuestionText,
        codeSnippet: qn.CodeSnippet,
        options: [qn.OptionA, qn.OptionB, qn.OptionC, qn.OptionD],
        correctOption: qn.CorrectOption,
        explanation: qn.Explanation,
        difficulty: qn.Difficulty
      }));

      return {
        id: qRow.QuizId,
        slug: qRow.Slug,
        title: qRow.Title,
        description: qRow.Description,
        category: qRow.Category,
        icon: qRow.Icon,
        difficulty: qRow.Difficulty,
        questions
      };
    } catch (e) {
      console.error('MS SQL getQuizBySlugOrId error, falling back to memory store:', e);
    }
  }

  return memoryStore.getQuiz(idOrSlug);
}

export async function createNewQuiz(data: {
  title: string;
  description: string;
  category: string;
  icon?: string;
  questions: Array<{
    questionText: string;
    codeSnippet?: string | null;
    options: string[];
    correctOption: number;
    explanation: string;
  }>;
}) {
  const pool = await getPool();
  if (pool && pool.connected) {
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

      const insertQuizReq = new sql.Request(transaction);
      insertQuizReq.input('slug', sql.NVarChar, slug);
      insertQuizReq.input('title', sql.NVarChar, data.title);
      insertQuizReq.input('desc', sql.NVarChar, data.description || 'Custom retro quiz');
      insertQuizReq.input('cat', sql.NVarChar, data.category || 'custom');
      insertQuizReq.input('icon', sql.NVarChar, data.icon || '🕹️');

      const quizInsertRes = await insertQuizReq.query(`
        INSERT INTO Quizzes (Slug, Title, Description, Category, Icon, IsCustom)
        OUTPUT INSERTED.QuizId
        VALUES (@slug, @title, @desc, @cat, @icon, 1)
      `);

      const newQuizId = quizInsertRes.recordset[0].QuizId;

      for (const q of data.questions) {
        const qReq = new sql.Request(transaction);
        qReq.input('quizId', sql.Int, newQuizId);
        qReq.input('text', sql.NVarChar, q.questionText);
        qReq.input('code', sql.NVarChar, q.codeSnippet || null);
        qReq.input('optA', sql.NVarChar, q.options[0] || '');
        qReq.input('optB', sql.NVarChar, q.options[1] || '');
        qReq.input('optC', sql.NVarChar, q.options[2] || '');
        qReq.input('optD', sql.NVarChar, q.options[3] || '');
        qReq.input('ans', sql.Int, q.correctOption);
        qReq.input('exp', sql.NVarChar, q.explanation || '');

        await qReq.query(`
          INSERT INTO Questions (QuizId, QuestionText, CodeSnippet, OptionA, OptionB, OptionC, OptionD, CorrectOption, Explanation)
          VALUES (@quizId, @text, @code, @optA, @optB, @optC, @optD, @ans, @exp)
        `);
      }

      await transaction.commit();
      return { id: newQuizId, slug, title: data.title, questionCount: data.questions.length };
    } catch (e) {
      await transaction.rollback();
      console.error('Failed to create quiz in MS SQL, falling back to memory store:', e);
    }
  }

  return memoryStore.createQuiz(data);
}

export async function getTopScores(limit = 20) {
  const pool = await getPool();
  if (pool && pool.connected) {
    try {
      const result = await pool.request()
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP (@limit)
            s.ScoreId AS id,
            s.QuizId AS quizId,
            q.Title AS quizTitle,
            s.GamerTag AS gamerTag,
            s.Score AS score,
            s.Accuracy AS accuracy,
            s.MaxStreak AS maxStreak,
            s.GameMode AS gameMode,
            s.TimeSpentSeconds AS timeSpentSeconds,
            s.PlayedAt AS playedAt
          FROM Scores s
          INNER JOIN Quizzes q ON s.QuizId = q.QuizId
          ORDER BY s.Score DESC, s.PlayedAt DESC
        `);
      return result.recordset;
    } catch (e) {
      console.error('MS SQL getTopScores error, falling back to memory store:', e);
    }
  }

  return memoryStore.getScores(limit);
}

export async function recordScore(data: {
  quizId: number;
  quizTitle?: string;
  gamerTag: string;
  score: number;
  accuracy: number;
  maxStreak: number;
  gameMode?: string;
  timeSpentSeconds: number;
}) {
  const pool = await getPool();
  if (pool && pool.connected) {
    try {
      const req = pool.request();
      req.input('quizId', sql.Int, data.quizId);
      req.input('gamerTag', sql.NVarChar, data.gamerTag.toUpperCase().slice(0, 16));
      req.input('score', sql.Int, data.score);
      req.input('accuracy', sql.Int, data.accuracy);
      req.input('streak', sql.Int, data.maxStreak);
      req.input('mode', sql.NVarChar, data.gameMode || 'standard');
      req.input('timeSpent', sql.Int, data.timeSpentSeconds);

      const result = await req.query(`
        INSERT INTO Scores (QuizId, GamerTag, Score, Accuracy, MaxStreak, GameMode, TimeSpentSeconds)
        OUTPUT INSERTED.ScoreId, INSERTED.PlayedAt
        VALUES (@quizId, @gamerTag, @score, @accuracy, @streak, @mode, @timeSpent)
      `);

      return {
        id: result.recordset[0].ScoreId,
        ...data,
        playedAt: result.recordset[0].PlayedAt
      };
    } catch (e) {
      console.error('MS SQL recordScore error, falling back to memory store:', e);
    }
  }

  return memoryStore.saveScore({
    quizId: data.quizId,
    quizTitle: data.quizTitle || 'Retro Quiz',
    gamerTag: data.gamerTag.toUpperCase().slice(0, 16),
    score: data.score,
    accuracy: data.accuracy,
    maxStreak: data.maxStreak,
    gameMode: data.gameMode || 'standard',
    timeSpentSeconds: data.timeSpentSeconds
  });
}
