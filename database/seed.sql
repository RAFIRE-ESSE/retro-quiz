-- =====================================================================
-- Retro Vintage Quiz - Microsoft SQL Server Seed Data Script
-- =====================================================================

-- Insert Default Quizzes
IF NOT EXISTS (SELECT 1 FROM Quizzes WHERE Slug = 'retro-tech')
BEGIN
    INSERT INTO Quizzes (Slug, Title, Description, Category, Icon, Difficulty)
    VALUES (
        'retro-tech',
        '80s & 90s Retro Computing',
        'Floppy disks, dial-up modems, CRT monitors, and iconic classic computers.',
        'retro-tech',
        '💾',
        'medium'
    );
END;

IF NOT EXISTS (SELECT 1 FROM Quizzes WHERE Slug = 'web-dev')
BEGIN
    INSERT INTO Quizzes (Slug, Title, Description, Category, Icon, Difficulty)
    VALUES (
        'web-dev',
        'Web Dev & Modern Code',
        'Test your mastery of JavaScript, CSS, React, SQL, and Algorithms.',
        'web-dev',
        '💻',
        'medium'
    );
END;

IF NOT EXISTS (SELECT 1 FROM Quizzes WHERE Slug = 'science-discovery')
BEGIN
    INSERT INTO Quizzes (Slug, Title, Description, Category, Icon, Difficulty)
    VALUES (
        'science-discovery',
        'Science & The Cosmos',
        'Relativity, quantum physics, space exploration, and natural wonders.',
        'science',
        '🔬',
        'medium'
    );
END;

IF NOT EXISTS (SELECT 1 FROM Quizzes WHERE Slug = 'world-trivia')
BEGIN
    INSERT INTO Quizzes (Slug, Title, Description, Category, Icon, Difficulty)
    VALUES (
        'world-trivia',
        'World History & Wonders',
        'Historic milestones, architecture, geography, and cultural trivia.',
        'history',
        '🏛️',
        'easy'
    );
END;

-- Seed Questions for 'retro-tech'
DECLARE @RetroQuizId INT = (SELECT QuizId FROM Quizzes WHERE Slug = 'retro-tech');

IF @RetroQuizId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Questions WHERE QuizId = @RetroQuizId)
BEGIN
    INSERT INTO Questions (QuizId, QuestionText, CodeSnippet, OptionA, OptionB, OptionC, OptionD, CorrectOption, Explanation, Difficulty)
    VALUES 
    (@RetroQuizId, 'What was the standard storage capacity of a typical 3.5-inch High-Density (HD) floppy disk in the 1990s?', NULL, '720 KB', '1.44 MB', '2.88 MB', '10 MB', 1, 'The standard 3.5-inch MF2HD floppy disk held 1.44 Megabytes of formatted data.', 'easy'),
    (@RetroQuizId, 'In what year was the revolutionary Commodore 64 home computer released?', NULL, '1979', '1982', '1985', '1989', 1, 'The Commodore 64 was introduced in January 1982 and became the highest-selling single computer model of all time.', 'medium'),
    (@RetroQuizId, 'What popular dial-up Internet service was famous for mailing millions of trial CDs in the 1990s and saying "You have got mail!"?', NULL, 'Prodigy', 'America Online (AOL)', 'CompuServe', 'EarthLink', 1, 'AOL saturated mailboxes worldwide with promotional 3.5-inch floppies and CD-ROMs offering free trial hours.', 'easy'),
    (@RetroQuizId, 'Which sound card from Creative Technology dominated PC gaming audio throughout the late 1980s and 1990s?', NULL, 'AdLib', 'Sound Blaster', 'Roland MT-32', 'Gravis UltraSound', 1, 'Creative Labs released the Sound Blaster 1.0 in 1989, setting the standard for PC sound emulation.', 'medium'),
    (@RetroQuizId, 'What does the abbreviation "CRT" stand for in vintage computer monitors and television sets?', NULL, 'Cathode Ray Tube', 'Color Raster Terminal', 'Computer Rendering Tube', 'Crystalline Ray Transistor', 0, 'CRT stands for Cathode Ray Tube, which directed electron beams onto a phosphorescent screen.', 'easy'),
    (@RetroQuizId, 'Which legendary operating system was released on August 24, 1995, introducing the "Start" button and Taskbar?', NULL, 'Windows 3.1', 'Windows 95', 'OS/2 Warp', 'Macintosh System 7', 1, 'Windows 95 introduced the Start menu, 32-bit architecture, preemptive multitasking, and long filenames.', 'easy');
END;

-- Seed Questions for 'web-dev'
DECLARE @WebDevQuizId INT = (SELECT QuizId FROM Quizzes WHERE Slug = 'web-dev');

IF @WebDevQuizId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Questions WHERE QuizId = @WebDevQuizId)
BEGIN
    INSERT INTO Questions (QuizId, QuestionText, CodeSnippet, OptionA, OptionB, OptionC, OptionD, CorrectOption, Explanation, Difficulty)
    VALUES 
    (@WebDevQuizId, 'Which keyword in modern JavaScript creates a block-scoped variable that can be reassigned?', NULL, 'var', 'let', 'const', 'global', 1, 'let provides block-scoped mutable variable declaration in ES6+.', 'easy'),
    (@WebDevQuizId, 'What will the following JavaScript expression evaluate to?', 'console.log(typeof NaN);', '"undefined"', '"number"', '"NaN"', '"object"', 1, 'In JavaScript, NaN (Not a Number) is classified under the numeric type per IEEE-754 specifications.', 'medium'),
    (@WebDevQuizId, 'Which React hook is designed for executing synchronous side effects immediately before browser paint?', NULL, 'useEffect', 'useLayoutEffect', 'useMemo', 'useImperativeHandle', 1, 'useLayoutEffect runs synchronously immediately after DOM mutations before the browser paints.', 'hard'),
    (@WebDevQuizId, 'In Microsoft SQL Server, which function returns the current system UTC date and time with high fractional precision?', NULL, 'GETDATE()', 'NOW()', 'SYSUTCDATETIME()', 'CURRENT_TIME()', 2, 'SYSUTCDATETIME() returns a DATETIME2 value in UTC containing the current date and time with higher precision than GETDATE().', 'medium'),
    (@WebDevQuizId, 'What is the average time complexity of finding an element in a balanced Binary Search Tree (BST)?', NULL, 'O(1)', 'O(n)', 'O(log n)', 'O(n log n)', 2, 'Each step eliminates half the remaining search space, giving logarithmic time complexity O(log n).', 'hard');
END;

-- Seed Sample High Scores for Leaderboard
IF NOT EXISTS (SELECT 1 FROM Scores)
BEGIN
    DECLARE @Q1 INT = (SELECT TOP 1 QuizId FROM Quizzes WHERE Slug = 'retro-tech');
    DECLARE @Q2 INT = (SELECT TOP 1 QuizId FROM Quizzes WHERE Slug = 'web-dev');

    IF @Q1 IS NOT NULL
    BEGIN
        INSERT INTO Scores (QuizId, GamerTag, Score, Accuracy, MaxStreak, GameMode, TimeSpentSeconds)
        VALUES 
        (@Q1, 'RETRO_KING', 1450, 100, 6, 'standard', 42),
        (@Q1, 'PIXEL_CHAMP', 1280, 83, 5, 'standard', 55),
        (@Q1, 'SYNTH_WAVE', 1100, 83, 4, 'blitz', 60);
    END;

    IF @Q2 IS NOT NULL
    BEGIN
        INSERT INTO Scores (QuizId, GamerTag, Score, Accuracy, MaxStreak, GameMode, TimeSpentSeconds)
        VALUES 
        (@Q2, 'BYTE_RUNNER', 1520, 100, 5, 'standard', 38),
        (@Q2, 'CODE_NINJA', 1310, 80, 4, 'standard', 49);
    END;
END;
GO
