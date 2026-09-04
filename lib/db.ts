/**
 * Unified Cloud Database Manager for Retro Arcade Quiz
 * Automatically detects and connects to:
 * 1. Neon Serverless PostgreSQL (DATABASE_URL or POSTGRES_URL) - Native for Vercel
 * 2. Microsoft SQL Server (MSSQL_SERVER) - Alternative RDBMS
 * Auto-creates schema (quizzes, questions, scores) and auto-seeds initial cartridges.
 */
import { neon } from '@neondatabase/serverless';
import sql from 'mssql';
import { INITIAL_QUIZZES, INITIAL_LEADERBOARD, Quiz, Question, ScoreRecord } from './seedData';

export interface DbStatus {
  connected: boolean;
  mode: 'neon_postgres' | 'mssql' | 'none';
  databaseName: string;
  server?: string;
  message: string;
  totalQuizzes: number;
  totalScores: number;
}

// Check database mode
const postgresUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const isPostgresConfigured = Boolean(postgresUrl);
const isMssqlConfigured = Boolean(process.env.MSSQL_SERVER);

let isPostgresInitialized = false;

// Neon client getter
function getNeonClient() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
  if (!url) {
    throw new Error('PostgreSQL / Neon database is not configured. DATABASE_URL or POSTGRES_URL is missing.');
  }
  return neon(url);
}

/**
 * Initializes tables and seed data in Neon PostgreSQL
 */
async function initNeonDatabase(): Promise<void> {
  if (isPostgresInitialized) return;

  const client = getNeonClient();
  try {
    // 1. Quizzes table
    await client`
      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        icon VARCHAR(10) DEFAULT '🕹️',
        difficulty VARCHAR(20) DEFAULT 'medium',
        is_custom BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await client`CREATE INDEX IF NOT EXISTS ix_quizzes_slug ON quizzes(slug);`;

    // 2. Questions table
    await client`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        quiz_id INT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        code_snippet TEXT,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_option INT NOT NULL,
        explanation TEXT NOT NULL,
        difficulty VARCHAR(20) DEFAULT 'medium'
      );
    `;
    await client`CREATE INDEX IF NOT EXISTS ix_questions_quiz_id ON questions(quiz_id);`;

    // 3. Scores table
    await client`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        quiz_id INT,
        quiz_title VARCHAR(200),
        gamer_tag VARCHAR(50) NOT NULL,
        score INT NOT NULL,
        accuracy INT NOT NULL,
        max_streak INT DEFAULT 0,
        game_mode VARCHAR(30) DEFAULT 'standard',
        time_spent_seconds INT DEFAULT 0,
        played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await client`CREATE INDEX IF NOT EXISTS ix_scores_score ON scores(score DESC);`;
    await client`CREATE INDEX IF NOT EXISTS ix_scores_played_at ON scores(played_at DESC);`;

    // 4. Auto-seed Quizzes if empty
    const quizCountRes = await client`SELECT COUNT(*)::int AS count FROM quizzes;`;
    if (Number(quizCountRes[0]?.count) === 0) {
      console.log('[Neon PostgreSQL] Seeding default retro cartridges...');
      for (const q of INITIAL_QUIZZES) {
        const quizInsert = await client`
          INSERT INTO quizzes (slug, title, description, category, icon, difficulty, is_custom)
          VALUES (${q.slug}, ${q.title}, ${q.description}, ${q.category}, ${q.icon}, ${q.difficulty || 'medium'}, false)
          RETURNING id;
        `;
        const insertedId = quizInsert[0]?.id;

        for (const qn of q.questions) {
          await client`
            INSERT INTO questions (quiz_id, question_text, code_snippet, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty)
            VALUES (${insertedId}, ${qn.questionText}, ${qn.codeSnippet || null}, ${qn.options[0] || ''}, ${qn.options[1] || ''}, ${qn.options[2] || ''}, ${qn.options[3] || ''}, ${qn.correctOption}, ${qn.explanation || ''}, ${qn.difficulty || 'medium'});
          `;
        }
      }
      console.log('[Neon PostgreSQL] Cartridges successfully seeded.');
    }

    // 5. Auto-seed Scores if empty
    const scoreCountRes = await client`SELECT COUNT(*)::int AS count FROM scores;`;
    if (Number(scoreCountRes[0]?.count) === 0) {
      console.log('[Neon PostgreSQL] Seeding Hall of Fame leaderboard...');
      const firstQuiz = await client`SELECT id, title FROM quizzes ORDER BY id ASC LIMIT 1;`;
      const firstQuizId = firstQuiz[0]?.id || null;
      const firstQuizTitle = firstQuiz[0]?.title || '80s & 90s Retro Computing';

      for (const s of INITIAL_LEADERBOARD) {
        await client`
          INSERT INTO scores (quiz_id, quiz_title, gamer_tag, score, accuracy, max_streak, game_mode, time_spent_seconds)
          VALUES (${firstQuizId}, ${s.quizTitle || firstQuizTitle}, ${s.gamerTag}, ${s.score}, ${s.accuracy}, ${s.maxStreak}, ${s.gameMode}, ${s.timeSpentSeconds});
        `;
      }
      console.log('[Neon PostgreSQL] Leaderboard successfully seeded.');
    }

    isPostgresInitialized = true;
  } catch (err) {
    console.error('[Neon PostgreSQL Init Error]', err);
    throw err;
  }
}

// -------------------------------------------------------------
// MICROSOFT SQL SERVER CONFIGURATION (FALLBACK/ALTERNATIVE)
// -------------------------------------------------------------
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
    connectTimeout: parseInt(process.env.MSSQL_TIMEOUT || '15000', 10),
    requestTimeout: parseInt(process.env.MSSQL_TIMEOUT || '15000', 10),
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
};

let mssqlPoolPromise: Promise<sql.ConnectionPool> | null = null;
let isMssqlInitialized = false;

async function getMssqlPool(): Promise<sql.ConnectionPool> {
  if (!process.env.MSSQL_SERVER) {
    throw new Error('MSSQL_SERVER is not configured.');
  }
  if (!mssqlPoolPromise) {
    mssqlPoolPromise = sql.connect(mssqlConfig);
  }
  return mssqlPoolPromise;
}

// -------------------------------------------------------------
// PUBLIC DATABASE METHODS (AUTO-SELECTS NEON POSTGRES OR MSSQL)
// -------------------------------------------------------------

/**
 * Check active database status
 */
export async function getDbStatus(): Promise<DbStatus> {
  if (isPostgresConfigured) {
    try {
      await initNeonDatabase();
      const client = getNeonClient();
      const quizRes = await client`SELECT COUNT(*)::int AS count FROM quizzes;`;
      const scoreRes = await client`SELECT COUNT(*)::int AS count FROM scores;`;

      return {
        connected: true,
        mode: 'neon_postgres',
        databaseName: 'neondb (PostgreSQL)',
        server: 'Neon Serverless Cloud',
        message: 'Connected to Neon Serverless PostgreSQL',
        totalQuizzes: Number(quizRes[0]?.count || 0),
        totalScores: Number(scoreRes[0]?.count || 0)
      };
    } catch (err: any) {
      return {
        connected: false,
        mode: 'neon_postgres',
        databaseName: 'neondb (PostgreSQL)',
        server: 'Neon Serverless Cloud',
        message: `Neon connection error: ${err.message}`,
        totalQuizzes: 0,
        totalScores: 0
      };
    }
  }

  if (isMssqlConfigured) {
    try {
      const pool = await getMssqlPool();
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
    } catch (err: any) {
      return {
        connected: false,
        mode: 'mssql',
        server: process.env.MSSQL_SERVER,
        databaseName: String(mssqlConfig.database),
        message: `MS SQL error: ${err.message}`,
        totalQuizzes: 0,
        totalScores: 0
      };
    }
  }

  return {
    connected: false,
    mode: 'none',
    databaseName: 'None',
    server: 'Not configured',
    message: 'No database configured. Please configure DATABASE_URL (Neon PostgreSQL) or MSSQL_SERVER in Vercel.',
    totalQuizzes: 0,
    totalScores: 0
  };
}

/**
 * Fetch all quizzes
 */
export async function getAllQuizzes() {
  if (isPostgresConfigured) {
    await initNeonDatabase();
    const client = getNeonClient();
    const rows = await client`
      SELECT 
        q.id,
        q.slug,
        q.title,
        q.description,
        q.category,
        q.icon,
        q.difficulty,
        COUNT(qn.id)::int AS "questionCount"
      FROM quizzes q
      LEFT JOIN questions qn ON q.id = qn.quiz_id
      GROUP BY q.id, q.slug, q.title, q.description, q.category, q.icon, q.difficulty
      ORDER BY q.id ASC;
    `;
    return rows;
  }

  if (isMssqlConfigured) {
    const pool = await getMssqlPool();
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
  }

  throw new Error('No database configured. Please add DATABASE_URL (Neon Postgres) to Vercel Environment Variables.');
}

/**
 * Fetch a single quiz by ID or slug
 */
export async function getQuizBySlugOrId(idOrSlug: string | number) {
  const raw = String(idOrSlug).trim();
  const asNum = Number(raw);
  const isSafeNum = !isNaN(asNum) && Number.isInteger(asNum) && asNum > 0 && asNum <= 2147483647;

  if (isPostgresConfigured) {
    await initNeonDatabase();
    const client = getNeonClient();

    let quizRows;
    if (isSafeNum) {
      quizRows = await client`
        SELECT id, slug, title, description, category, icon, difficulty
        FROM quizzes
        WHERE id = ${asNum} OR slug = ${raw}
        LIMIT 1;
      `;
    } else {
      quizRows = await client`
        SELECT id, slug, title, description, category, icon, difficulty
        FROM quizzes
        WHERE slug = ${raw}
        LIMIT 1;
      `;
    }

    if (!quizRows || quizRows.length === 0) return null;
    const qRow = quizRows[0];

    const questionRows = await client`
      SELECT id, question_text, code_snippet, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty
      FROM questions
      WHERE quiz_id = ${qRow.id}
      ORDER BY id ASC;
    `;

    const questions = questionRows.map(qn => ({
      id: qn.id,
      questionText: qn.question_text,
      codeSnippet: qn.code_snippet,
      options: [qn.option_a, qn.option_b, qn.option_c, qn.option_d],
      correctOption: qn.correct_option,
      explanation: qn.explanation,
      difficulty: qn.difficulty
    }));

    return {
      id: qRow.id,
      slug: qRow.slug,
      title: qRow.title,
      description: qRow.description,
      category: qRow.category,
      icon: qRow.icon,
      difficulty: qRow.difficulty,
      questions
    };
  }

  if (isMssqlConfigured) {
    const pool = await getMssqlPool();
    const req = pool.request();
    let query = `SELECT QuizId, Slug, Title, Description, Category, Icon, Difficulty FROM Quizzes WHERE `;
    if (isSafeNum) {
      req.input('id', sql.Int, asNum);
      req.input('slug', sql.NVarChar, raw);
      query += `QuizId = @id OR Slug = @slug`;
    } else {
      req.input('slug', sql.NVarChar, raw);
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
  }

  throw new Error('No database configured.');
}

/**
 * Create a new custom quiz
 */
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
  const cleanBase = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'custom-cartridge';
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const slug = `${cleanBase}-${randomSuffix}`;

  if (isPostgresConfigured) {
    await initNeonDatabase();
    const client = getNeonClient();

    const quizInsert = await client`
      INSERT INTO quizzes (slug, title, description, category, icon, is_custom)
      VALUES (${slug}, ${data.title}, ${data.description || 'Custom retro quiz cartridge'}, ${data.category || 'custom'}, ${data.icon || '🕹️'}, true)
      RETURNING id;
    `;
    const newQuizId = quizInsert[0]?.id;

    for (const q of data.questions) {
      await client`
        INSERT INTO questions (quiz_id, question_text, code_snippet, option_a, option_b, option_c, option_d, correct_option, explanation)
        VALUES (${newQuizId}, ${q.questionText}, ${q.codeSnippet || null}, ${q.options[0] || ''}, ${q.options[1] || ''}, ${q.options[2] || ''}, ${q.options[3] || ''}, ${typeof q.correctOption === 'number' ? q.correctOption : 0}, ${q.explanation || 'Great job!'});
      `;
    }

    return {
      id: newQuizId,
      slug,
      title: data.title,
      questionCount: data.questions.length
    };
  }

  if (isMssqlConfigured) {
    const pool = await getMssqlPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const insertQuizReq = new sql.Request(transaction);
      insertQuizReq.input('slug', sql.NVarChar, slug);
      insertQuizReq.input('title', sql.NVarChar, data.title);
      insertQuizReq.input('desc', sql.NVarChar, data.description || 'Custom retro quiz cartridge');
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
        qReq.input('ans', sql.Int, typeof q.correctOption === 'number' ? q.correctOption : 0);
        qReq.input('exp', sql.NVarChar, q.explanation || 'Great job!');

        await qReq.query(`
          INSERT INTO Questions (QuizId, QuestionText, CodeSnippet, OptionA, OptionB, OptionC, OptionD, CorrectOption, Explanation)
          VALUES (@quizId, @text, @code, @optA, @optB, @optC, @optD, @ans, @exp)
        `);
      }

      await transaction.commit();
      return { id: newQuizId, slug, title: data.title, questionCount: data.questions.length };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  throw new Error('No database configured.');
}

/**
 * Fetch top leaderboard scores
 */
export async function getTopScores(limit = 30) {
  const safeLimit = Math.min(Math.max(1, limit), 100);

  if (isPostgresConfigured) {
    await initNeonDatabase();
    const client = getNeonClient();
    const rows = await client`
      SELECT 
        s.id,
        s.quiz_id AS "quizId",
        COALESCE(q.title, s.quiz_title, 'Retro Cartridge') AS "quizTitle",
        s.gamer_tag AS "gamerTag",
        s.score,
        s.accuracy,
        s.max_streak AS "maxStreak",
        s.game_mode AS "gameMode",
        s.time_spent_seconds AS "timeSpentSeconds",
        s.played_at AS "playedAt"
      FROM scores s
      LEFT JOIN quizzes q ON s.quiz_id = q.id
      ORDER BY s.score DESC, s.played_at DESC
      LIMIT ${safeLimit};
    `;
    return rows;
  }

  if (isMssqlConfigured) {
    const pool = await getMssqlPool();
    const result = await pool.request()
      .input('limit', sql.Int, safeLimit)
      .query(`
        SELECT TOP (@limit)
          s.ScoreId AS id,
          s.QuizId AS quizId,
          COALESCE(q.Title, s.QuizTitle, 'Retro Cartridge') AS quizTitle,
          s.GamerTag AS gamerTag,
          s.Score AS score,
          s.Accuracy AS accuracy,
          s.MaxStreak AS maxStreak,
          s.GameMode AS gameMode,
          s.TimeSpentSeconds AS timeSpentSeconds,
          s.PlayedAt AS playedAt
        FROM Scores s
        LEFT JOIN Quizzes q ON s.QuizId = q.QuizId
        ORDER BY s.Score DESC, s.PlayedAt DESC
      `);
    return result.recordset;
  }

  throw new Error('No database configured.');
}

/**
 * Record a player score
 */
export async function recordScore(data: {
  quizId: number | string;
  quizTitle?: string;
  gamerTag: string;
  score: number;
  accuracy: number;
  maxStreak: number;
  gameMode?: string;
  timeSpentSeconds: number;
}) {
  const rawQuizId = Number(data.quizId);
  const safeQuizId = (!isNaN(rawQuizId) && Number.isInteger(rawQuizId) && rawQuizId > 0 && rawQuizId <= 2147483647)
    ? rawQuizId
    : null;

  const cleanGamerTag = (data.gamerTag || 'PLAYER_1')
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '')
    .slice(0, 16) || 'PLAYER_1';

  const cleanQuizTitle = (data.quizTitle || 'Retro Quiz').slice(0, 200);
  const scoreVal = Math.max(0, Math.round(data.score));
  const accuracyVal = Math.min(100, Math.max(0, Math.round(data.accuracy)));
  const streakVal = Math.max(0, Math.round(data.maxStreak));
  const modeVal = (data.gameMode || 'standard').slice(0, 30);
  const timeVal = Math.max(0, Math.round(data.timeSpentSeconds));

  if (isPostgresConfigured) {
    await initNeonDatabase();
    const client = getNeonClient();
    const result = await client`
      INSERT INTO scores (quiz_id, quiz_title, gamer_tag, score, accuracy, max_streak, game_mode, time_spent_seconds)
      VALUES (${safeQuizId}, ${cleanQuizTitle}, ${cleanGamerTag}, ${scoreVal}, ${accuracyVal}, ${streakVal}, ${modeVal}, ${timeVal})
      RETURNING id, played_at;
    `;

    return {
      id: result[0]?.id,
      quizId: safeQuizId || data.quizId,
      quizTitle: cleanQuizTitle,
      gamerTag: cleanGamerTag,
      score: scoreVal,
      accuracy: accuracyVal,
      maxStreak: streakVal,
      gameMode: modeVal,
      timeSpentSeconds: timeVal,
      playedAt: result[0]?.played_at
    };
  }

  if (isMssqlConfigured) {
    const pool = await getMssqlPool();
    const req = pool.request();
    req.input('quizId', sql.Int, safeQuizId);
    req.input('quizTitle', sql.NVarChar, cleanQuizTitle);
    req.input('gamerTag', sql.NVarChar, cleanGamerTag);
    req.input('score', sql.Int, scoreVal);
    req.input('accuracy', sql.Int, accuracyVal);
    req.input('streak', sql.Int, streakVal);
    req.input('mode', sql.NVarChar, modeVal);
    req.input('timeSpent', sql.Int, timeVal);

    const result = await req.query(`
      INSERT INTO Scores (QuizId, QuizTitle, GamerTag, Score, Accuracy, MaxStreak, GameMode, TimeSpentSeconds)
      OUTPUT INSERTED.ScoreId, INSERTED.PlayedAt
      VALUES (@quizId, @quizTitle, @gamerTag, @score, @accuracy, @streak, @mode, @timeSpent)
    `);

    return {
      id: result.recordset[0].ScoreId,
      quizId: safeQuizId || data.quizId,
      quizTitle: cleanQuizTitle,
      gamerTag: cleanGamerTag,
      score: scoreVal,
      accuracy: accuracyVal,
      maxStreak: streakVal,
      gameMode: modeVal,
      timeSpentSeconds: timeVal,
      playedAt: result.recordset[0].PlayedAt
    };
  }

  throw new Error('No database configured.');
}
