-- =====================================================================
-- Retro Vintage Quiz - Microsoft SQL Server / Azure SQL Schema
-- Compatible with SQL Server 2017+, 2019, 2022, and Azure SQL Database
-- =====================================================================

-- 1. Create Quizzes Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Quizzes')
BEGIN
    CREATE TABLE Quizzes (
        QuizId INT IDENTITY(1,1) PRIMARY KEY,
        Slug NVARCHAR(100) NOT NULL UNIQUE,
        Title NVARCHAR(200) NOT NULL,
        Description NVARCHAR(500) NOT NULL,
        Category NVARCHAR(50) NOT NULL,
        Icon NVARCHAR(10) NOT NULL DEFAULT '🕹️',
        Difficulty NVARCHAR(20) NOT NULL DEFAULT 'all',
        IsCustom BIT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 DEFAULT SYSUTCDATETIME()
    );
    CREATE INDEX IX_Quizzes_Category ON Quizzes(Category);
    CREATE INDEX IX_Quizzes_Slug ON Quizzes(Slug);
END;
GO

-- 2. Create Questions Table
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
        CorrectOption INT NOT NULL CHECK (CorrectOption BETWEEN 0 AND 3), -- 0=A, 1=B, 2=C, 3=D
        Explanation NVARCHAR(MAX) NOT NULL,
        Difficulty NVARCHAR(20) NOT NULL DEFAULT 'medium',
        CONSTRAINT FK_Questions_Quizzes FOREIGN KEY (QuizId) REFERENCES Quizzes(QuizId) ON DELETE CASCADE
    );
    CREATE INDEX IX_Questions_QuizId ON Questions(QuizId);
END;
GO

-- 3. Create Scores / Leaderboard Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Scores')
BEGIN
    CREATE TABLE Scores (
        ScoreId INT IDENTITY(1,1) PRIMARY KEY,
        QuizId INT NOT NULL,
        GamerTag NVARCHAR(30) NOT NULL,
        Score INT NOT NULL,
        Accuracy INT NOT NULL,
        MaxStreak INT NOT NULL DEFAULT 0,
        GameMode NVARCHAR(30) NOT NULL DEFAULT 'standard',
        TimeSpentSeconds INT NOT NULL DEFAULT 0,
        PlayedAt DATETIME2 DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Scores_Quizzes FOREIGN KEY (QuizId) REFERENCES Quizzes(QuizId) ON DELETE CASCADE
    );
    CREATE INDEX IX_Scores_QuizId_Score ON Scores(QuizId, Score DESC);
    CREATE INDEX IX_Scores_Score ON Scores(Score DESC);
    CREATE INDEX IX_Scores_PlayedAt ON Scores(PlayedAt DESC);
END;
GO

-- Helper View for High Scores Leaderboard
IF OBJECT_ID('vw_ArcadeLeaderboard', 'V') IS NOT NULL
    DROP VIEW vw_ArcadeLeaderboard;
GO

CREATE VIEW vw_ArcadeLeaderboard AS
SELECT 
    s.ScoreId,
    s.GamerTag,
    s.Score,
    s.Accuracy,
    s.MaxStreak,
    s.GameMode,
    s.TimeSpentSeconds,
    s.PlayedAt,
    q.QuizId,
    q.Title AS QuizTitle,
    q.Category,
    q.Icon
FROM Scores s
INNER JOIN Quizzes q ON s.QuizId = q.QuizId;
GO
