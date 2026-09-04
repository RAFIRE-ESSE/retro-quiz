/**
 * Pure Microsoft SQL Server Database Layer
 * Exclusively uses Microsoft SQL Server / Azure SQL Database via 'mssql'.
 * Auto-creates schema (Quizzes, Questions, Scores) and auto-seeds default cartridges on first connect.
 * Absolutely NO in-memory or disk file backup stores.
 */
import sql from 'mssql';
import { INITIAL_QUIZZES, INITIAL_LEADERBOARD, Quiz, Question, ScoreRecord } from './seedData';

export interface DbStatus {
  connected: boolean;
  mode: 'mssql';
  databaseName: string;
  server?: string;
  message: string;
  totalQuizzes: number;
  totalScores: number;
}

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
    connectTimeout: parseInt(process.env.MSSQL_TIMEOUT || '15000', 10),
    requestTimeout: parseInt(process.env.MSSQL_TIMEOUT || '15000', 10),
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise: Promise<sql.ConnectionPool> | null = null;
let isInitialized = false;

/**
 * Initializes database tables and default seed data in Microsoft SQL Server
 */
async function initDatabase(pool: sql.ConnectionPool): Promise<void> {
  if (isInitialized) return;

  try {
    // 1. Create Quizzes table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Quizzes')
      BEGIN
        CREATE TABLE Quizzes (
          QuizId INT IDENTITY(1,1) PRIMARY KEY,
          Slug NVARCHAR(100) NOT NULL UNIQUE,
          Title NVARCHAR(200) NOT NULL,
          Description NVARCHAR(500) NOT NULL,
          Category NVARCHAR(50) NOT NULL,
          Icon NVARCHAR(10) NOT NULL DEFAULT '🕹️',
          Difficulty NVARCHAR(20) NOT NULL DEFAULT 'medium',
          IsCustom BIT NOT NULL DEFAULT 0,
          CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
        );
        CREATE INDEX IX_Quizzes_Slug ON Quizzes(Slug);
        CREATE INDEX IX_Quizzes_Category ON Quizzes(Category);
      END;
    `);

    // 2. Create Questions table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Questions')
      BEGIN
        CREATE TABLE Questions (
          QuestionId INT IDENTITY(1,1) PRIMARY KEY,
          QuizId INT NOT NULL,
          QuestionText NVARCHAR(MAX) NOT NULL,
          CodeSnippet NVARCHAR(MAX) NULL,
          OptionA NVARCHAR(500) NOT NULL,
          OptionB NVARCHAR(500) NOT NULL,
          OptionC NVARCHAR(500) NOT NULL,
          OptionD NVARCHAR(500) NOT NULL,
          CorrectOption INT NOT NULL,
          Explanation NVARCHAR(MAX) NOT NULL,
          Difficulty NVARCHAR(20) NOT NULL DEFAULT 'medium',
          CONSTRAINT FK_Questions_Quizzes FOREIGN KEY (QuizId) REFERENCES Quizzes(QuizId) ON DELETE CASCADE
        );
        CREATE INDEX IX_Questions_QuizId ON Questions(QuizId);
      END;
    `);

    // 3. Create Scores table (with flexible QuizId & direct QuizTitle to prevent FK locks and overflow)
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Scores')
      BEGIN
        CREATE TABLE Scores (
          ScoreId INT IDENTITY(1,1) PRIMARY KEY,
          QuizId INT NULL,
          QuizTitle NVARCHAR(200) NULL,
          GamerTag NVARCHAR(50) NOT NULL,
          Score INT NOT NULL,
          Accuracy INT NOT NULL,
          MaxStreak INT NOT NULL DEFAULT 0,
          GameMode NVARCHAR(30) NOT NULL DEFAULT 'standard',
          TimeSpentSeconds INT NOT NULL DEFAULT 0,
          PlayedAt DATETIME2 DEFAULT SYSUTCDATETIME()
        );
        CREATE INDEX IX_Scores_Score ON Scores(Score DESC);
        CREATE INDEX IX_Scores_PlayedAt ON Scores(PlayedAt DESC);
      END;
    `);

    // 4. Ensure migration: add QuizTitle column if missing in an older Scores table
    await pool.request().query(`
      IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Scores')
      BEGIN
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Scores') AND name = 'QuizTitle')
        BEGIN
          ALTER TABLE Scores ADD QuizTitle NVARCHAR(200) NULL;
        END;
      END;
    `);

    // 5. Ensure migration: drop restrictive FK on Scores so custom scores or unlinked QuizIds never crash
    await pool.request().query(`
      IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Scores_Quizzes')
      BEGIN
        ALTER TABLE Scores DROP CONSTRAINT FK_Scores_Quizzes;
      END;
    `);

    // 6. Seed initial Quizzes and Questions if Quizzes table is empty
    const quizCountRes = await pool.request().query('SELECT COUNT(*) AS count FROM Quizzes');
    if (quizCountRes.recordset[0]?.count === 0) {
      console.log('[MS SQL] Quizzes table is empty. Auto-seeding default retro cartridges into SQL Server...');
      for (const q of INITIAL_QUIZZES) {
        const insertQuizReq = pool.request();
        insertQuizReq.input('slug', sql.NVarChar, q.slug);
        insertQuizReq.input('title', sql.NVarChar, q.title);
        insertQuizReq.input('desc', sql.NVarChar, q.description);
        insertQuizReq.input('cat', sql.NVarChar, q.category);
        insertQuizReq.input('icon', sql.NVarChar, q.icon);
        insertQuizReq.input('diff', sql.NVarChar, q.difficulty || 'medium');

        const quizRes = await insertQuizReq.query(`
          INSERT INTO Quizzes (Slug, Title, Description, Category, Icon, Difficulty, IsCustom)
          OUTPUT INSERTED.QuizId
          VALUES (@slug, @title, @desc, @cat, @icon, @diff, 0)
        `);

        const insertedQuizId = quizRes.recordset[0]?.QuizId;

        for (const qn of q.questions) {
          const qnReq = pool.request();
          qnReq.input('quizId', sql.Int, insertedQuizId);
          qnReq.input('text', sql.NVarChar, qn.questionText);
          qnReq.input('code', sql.NVarChar, qn.codeSnippet || null);
          qnReq.input('optA', sql.NVarChar, qn.options[0] || '');
          qnReq.input('optB', sql.NVarChar, qn.options[1] || '');
          qnReq.input('optC', sql.NVarChar, qn.options[2] || '');
          qnReq.input('optD', sql.NVarChar, qn.options[3] || '');
          qnReq.input('ans', sql.Int, qn.correctOption);
          qnReq.input('exp', sql.NVarChar, qn.explanation || '');

          await qnReq.query(`
            INSERT INTO Questions (QuizId, QuestionText, CodeSnippet, OptionA, OptionB, OptionC, OptionD, CorrectOption, Explanation)
            VALUES (@quizId, @text, @code, @optA, @optB, @optC, @optD, @ans, @exp)
          `);
        }
      }
      console.log('[MS SQL] Default cartridges successfully seeded into SQL Server.');
    }

    // 7. Seed initial Leaderboard if Scores table is empty
    const scoreCountRes = await pool.request().query('SELECT COUNT(*) AS count FROM Scores');
    if (scoreCountRes.recordset[0]?.count === 0) {
      console.log('[MS SQL] Scores table is empty. Auto-seeding initial Hall of Fame records...');
      const firstQuizRes = await pool.request().query('SELECT TOP 1 QuizId, Title FROM Quizzes ORDER BY QuizId ASC');
      const firstQuizId = firstQuizRes.recordset[0]?.QuizId || null;
      const firstQuizTitle = firstQuizRes.recordset[0]?.Title || '80s & 90s Retro Computing';

      for (const s of INITIAL_LEADERBOARD) {
        const sReq = pool.request();
        sReq.input('quizId', sql.Int, firstQuizId);
        sReq.input('quizTitle', sql.NVarChar, s.quizTitle || firstQuizTitle);
        sReq.input('tag', sql.NVarChar, s.gamerTag);
        sReq.input('score', sql.Int, s.score);
        sReq.input('accuracy', sql.Int, s.accuracy);
        sReq.input('streak', sql.Int, s.maxStreak);
        sReq.input('mode', sql.NVarChar, s.gameMode);
        sReq.input('time', sql.Int, s.timeSpentSeconds);

        await sReq.query(`
          INSERT INTO Scores (QuizId, QuizTitle, GamerTag, Score, Accuracy, MaxStreak, GameMode, TimeSpentSeconds)
          VALUES (@quizId, @quizTitle, @tag, @score, @accuracy, @streak, @mode, @time)
        `);
      }
      console.log('[MS SQL] Hall of Fame records successfully seeded into SQL Server.');
    }

    isInitialized = true;
  } catch (initErr) {
    console.error('[MS SQL Schema Init Error]', initErr);
    throw initErr;
  }
}

/**
 * Returns the active MS SQL connection pool.
 * Throws explicit error if environment variables are missing or connection fails.
 */
export async function getPool(): Promise<sql.ConnectionPool> {
  if (!process.env.MSSQL_SERVER) {
    throw new Error(
      'Microsoft SQL Server is not configured: MSSQL_SERVER environment variable is missing. ' +
      'Please configure MSSQL_SERVER, MSSQL_DATABASE, MSSQL_USER, and MSSQL_PASSWORD in your environment variables.'
    );
  }

  if (!poolPromise) {
    poolPromise = sql.connect(mssqlConfig)
      .then(async (pool) => {
        console.log(`[MS SQL] Connected to Microsoft SQL Server: ${mssqlConfig.server} (Database: ${mssqlConfig.database})`);
        await initDatabase(pool);
        return pool;
      })
      .catch((err) => {
        poolPromise = null;
        console.error('[MS SQL Connection Error]', err.message);
        throw new Error(`Microsoft SQL Server connection failed: ${err.message}`);
      });
  }

  return poolPromise;
}

/**
 * Get real database status and counts from Microsoft SQL Server
 */
export async function getDbStatus(): Promise<DbStatus> {
  try {
    const pool = await getPool();
    const quizCountResult = await pool.request().query('SELECT COUNT(*) AS count FROM Quizzes');
    const scoreCountResult = await pool.request().query('SELECT COUNT(*) AS count FROM Scores');

    return {
      connected: true,
      mode: 'mssql',
      server: mssqlConfig.server,
      databaseName: String(mssqlConfig.database),
      message: 'Active and connected to Microsoft SQL Server',
      totalQuizzes: quizCountResult.recordset[0]?.count || 0,
      totalScores: scoreCountResult.recordset[0]?.count || 0
    };
  } catch (err: any) {
    return {
      connected: false,
      mode: 'mssql',
      server: process.env.MSSQL_SERVER || 'Not configured',
      databaseName: String(process.env.MSSQL_DATABASE || 'QuizArcadeDB'),
      message: err?.message || 'Failed to connect to Microsoft SQL Server',
      totalQuizzes: 0,
      totalScores: 0
    };
  }
}

/**
 * Fetch all quizzes from Microsoft SQL Server
 */
export async function getAllQuizzes() {
  const pool = await getPool();
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

/**
 * Fetch a single quiz with all questions by numeric ID or slug from Microsoft SQL Server
 */
export async function getQuizBySlugOrId(idOrSlug: string | number) {
  const pool = await getPool();
  const raw = String(idOrSlug).trim();
  const asNum = Number(raw);
  // Valid 32-bit signed int range check: -2147483648 to 2147483647
  const isSafeInt = !isNaN(asNum) && Number.isInteger(asNum) && asNum > 0 && asNum <= 2147483647;

  const req = pool.request();
  let query = `SELECT QuizId, Slug, Title, Description, Category, Icon, Difficulty FROM Quizzes WHERE `;
  if (isSafeInt) {
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

/**
 * Insert a brand new quiz and its questions directly into Microsoft SQL Server
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
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const cleanBase = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'custom-cartridge';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${cleanBase}-${randomSuffix}`;

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
    return {
      id: newQuizId,
      slug,
      title: data.title,
      questionCount: data.questions.length
    };
  } catch (err) {
    try {
      await transaction.rollback();
    } catch {
      // Ignore rollback errors
    }
    console.error('[MS SQL createNewQuiz Error]', err);
    throw err;
  }
}

/**
 * Fetch top high scores from Microsoft SQL Server.
 * Uses LEFT JOIN so that custom scores and unlinked scores are never omitted.
 */
export async function getTopScores(limit = 30) {
  const pool = await getPool();
  const safeLimit = Math.min(Math.max(1, limit), 100);

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

/**
 * Save an official player score into Microsoft SQL Server.
 * Safely handles 32-bit integer boundaries to prevent arithmetic overflow errors.
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
  const pool = await getPool();

  const rawQuizId = Number(data.quizId);
  // Only pass to sql.Int if it fits in 32-bit signed int (max 2,147,483,647). Otherwise set null.
  const safeQuizId = (!isNaN(rawQuizId) && Number.isInteger(rawQuizId) && rawQuizId > 0 && rawQuizId <= 2147483647)
    ? rawQuizId
    : null;

  const cleanGamerTag = (data.gamerTag || 'PLAYER_1')
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '')
    .slice(0, 16) || 'PLAYER_1';

  const cleanQuizTitle = (data.quizTitle || 'Retro Quiz').slice(0, 200);

  const req = pool.request();
  req.input('quizId', sql.Int, safeQuizId);
  req.input('quizTitle', sql.NVarChar, cleanQuizTitle);
  req.input('gamerTag', sql.NVarChar, cleanGamerTag);
  req.input('score', sql.Int, Math.max(0, Math.round(data.score)));
  req.input('accuracy', sql.Int, Math.min(100, Math.max(0, Math.round(data.accuracy))));
  req.input('streak', sql.Int, Math.max(0, Math.round(data.maxStreak)));
  req.input('mode', sql.NVarChar, (data.gameMode || 'standard').slice(0, 30));
  req.input('timeSpent', sql.Int, Math.max(0, Math.round(data.timeSpentSeconds)));

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
    score: Math.max(0, Math.round(data.score)),
    accuracy: Math.min(100, Math.max(0, Math.round(data.accuracy))),
    maxStreak: Math.max(0, Math.round(data.maxStreak)),
    gameMode: data.gameMode || 'standard',
    timeSpentSeconds: Math.max(0, Math.round(data.timeSpentSeconds)),
    playedAt: result.recordset[0].PlayedAt
  };
}
