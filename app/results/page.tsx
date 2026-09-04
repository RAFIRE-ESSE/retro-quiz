'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { retroSound } from '@/lib/sound';
import { RetroTrophyIcon, RetroFloppyIcon } from '@/components/RetroIcons';

interface ResultsData {
  quizId: number | string;
  quizTitle: string;
  gamerTag: string;
  gameMode: string;
  score: number;
  accuracy?: number;
  maxStreak: number;
  totalQuestions: number;
  totalTimeSpent: number;
  answersLog: Array<{
    questionText: string;
    codeSnippet?: string | null;
    options: string[];
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    explanation: string;
  }>;
  reason: string;
}

export default function ResultsPage() {
  const [results, setResults] = useState<ResultsData | null>(null);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [savedToDb, setSavedToDb] = useState<boolean | null>(null);
  const [dbScoreId, setDbScoreId] = useState<number | null>(null);
  const [dbErrorMessage, setDbErrorMessage] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const saveScoreToDatabase = useCallback(async (data: ResultsData, accuracyVal: number) => {
    setIsRetrying(true);
    setDbErrorMessage(null);

    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: data.quizId,
          quizTitle: data.quizTitle,
          gamerTag: data.gamerTag,
          score: data.score,
          accuracy: accuracyVal,
          maxStreak: data.maxStreak,
          gameMode: data.gameMode,
          timeSpentSeconds: data.totalTimeSpent
        })
      });

      const responseData = await res.json();
      if (res.ok && responseData?.success) {
        setSavedToDb(true);
        if (responseData.score?.id) {
          setDbScoreId(responseData.score.id);
        }
      } else {
        setSavedToDb(false);
        setDbErrorMessage(responseData?.error || 'Microsoft SQL Server rejected the score entry.');
      }
    } catch (err: any) {
      setSavedToDb(false);
      setDbErrorMessage(err.message || 'Could not communicate with Microsoft SQL Server backend.');
    } finally {
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem('last_quiz_results');
    if (raw) {
      try {
        const parsed: ResultsData = JSON.parse(raw);
        setResults(parsed);

        const correctCount = parsed.answersLog.filter(a => a.isCorrect).length;
        const total = parsed.answersLog.length;
        const computedAccuracy = typeof parsed.accuracy === 'number'
          ? parsed.accuracy
          : (total > 0 ? Math.round((correctCount / total) * 100) : 0);

        if (computedAccuracy >= 50) {
          retroSound.playFanfare();
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#360185', '#8F0177', '#DE1A58', '#F4B342']
          });
        }

        saveScoreToDatabase(parsed, computedAccuracy);
      } catch (e) {
        console.error('Error parsing quiz results:', e);
      }
    }
  }, [saveScoreToDatabase]);

  if (!results) {
    return (
      <div className="retro-card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#360185', borderColor: '#8F0177', color: '#F4B342' }}>
        <h2 style={{ color: '#F4B342', marginBottom: '1rem', fontSize: '2rem' }}>No Active Results Found</h2>
        <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>Play a retro quiz cartridge to generate an arcade score certificate.</p>
        <a href="/" className="retro-btn retro-btn-gold">Return to Arcade</a>
      </div>
    );
  }

  const correctCount = results.answersLog.filter(a => a.isCorrect).length;
  const incorrectCount = results.answersLog.length - correctCount;
  const accuracy = typeof results.accuracy === 'number'
    ? results.accuracy
    : (results.answersLog.length > 0 ? Math.round((correctCount / results.answersLog.length) * 100) : 0);

  const filteredLog = results.answersLog.filter(item => {
    if (filter === 'correct') return item.isCorrect;
    if (filter === 'incorrect') return !item.isCorrect;
    return true;
  });

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Certificate Header Card - Strict 4 Colors */}
      <div
        className="retro-card"
        style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          marginBottom: '2rem',
          backgroundColor: '#360185',
          borderColor: '#8F0177',
          boxShadow: '6px 6px 0px #DE1A58',
          color: '#F4B342'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <RetroTrophyIcon size={64} />
        </div>

        <div style={{ display: 'inline-block', transform: 'rotate(-2deg)', marginBottom: '1rem' }}>
          <span
            className="retro-sticker"
            style={{
              backgroundColor: '#DE1A58',
              color: '#F4B342',
              borderColor: '#F4B342'
            }}
          >
            ★ OFFICIAL ARCADE RECORD ★
          </span>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#F4B342', marginBottom: '0.4rem' }}>
          {accuracy >= 80 ? 'HIGH SCORE MASTER!' : accuracy >= 50 ? 'GOOD RUN, PLAYER!' : 'GAME OVER • TRY AGAIN'}
        </h1>

        <p className="font-arcade" style={{ fontSize: '1.4rem', color: '#DE1A58', marginBottom: '1.75rem' }}>
          CARTRIDGE: {results.quizTitle.toUpperCase()} • MODE: {results.gameMode.toUpperCase()}
        </p>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          <div className="retro-card" style={{ padding: '1rem', backgroundColor: '#8F0177', borderColor: '#F4B342', boxShadow: '3px 3px 0px #360185' }}>
            <div className="font-arcade" style={{ fontSize: '2.2rem', color: '#F4B342', fontWeight: 'bold' }}>
              {results.score}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F4B342' }}>TOTAL SCORE</div>
          </div>

          <div className="retro-card" style={{ padding: '1rem', backgroundColor: '#8F0177', borderColor: '#F4B342', boxShadow: '3px 3px 0px #360185' }}>
            <div className="font-arcade" style={{ fontSize: '2.2rem', color: '#F4B342', fontWeight: 'bold' }}>
              {accuracy}%
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F4B342' }}>ACCURACY</div>
          </div>

          <div className="retro-card" style={{ padding: '1rem', backgroundColor: '#8F0177', borderColor: '#F4B342', boxShadow: '3px 3px 0px #360185' }}>
            <div className="font-arcade" style={{ fontSize: '2.2rem', color: '#F4B342', fontWeight: 'bold' }}>
              {results.maxStreak}x
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F4B342' }}>MAX STREAK</div>
          </div>

          <div className="retro-card" style={{ padding: '1rem', backgroundColor: '#8F0177', borderColor: '#F4B342', boxShadow: '3px 3px 0px #360185' }}>
            <div className="font-arcade" style={{ fontSize: '2.2rem', color: '#F4B342', fontWeight: 'bold' }}>
              {results.totalTimeSpent}s
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F4B342' }}>TIME SPENT</div>
          </div>
        </div>

        {/* MS SQL Save Status Badge */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <span
            className="retro-sticker"
            style={{
              fontSize: '1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: savedToDb ? '#8F0177' : (savedToDb === false ? '#DE1A58' : '#360185'),
              color: '#F4B342',
              borderColor: '#F4B342',
              padding: '0.5rem 1rem'
            }}
          >
            <RetroFloppyIcon size={20} />
            <span>
              {savedToDb === null && 'COMMITTING RECORD TO MICROSOFT SQL SERVER...'}
              {savedToDb === true && `✓ COMMITTED TO MS SQL SERVER${dbScoreId ? ` (ID #${dbScoreId})` : ''}`}
              {savedToDb === false && '⚠ COULD NOT PERSIST SCORE TO MS SQL SERVER'}
            </span>
          </span>

          {savedToDb === false && (
            <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
              {dbErrorMessage && (
                <div style={{ color: '#F4B342', fontSize: '0.88rem', marginBottom: '0.5rem', maxWidth: '500px' }}>
                  {dbErrorMessage}
                </div>
              )}
              <button
                type="button"
                className="retro-btn retro-btn-gold"
                style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}
                disabled={isRetrying}
                onClick={() => saveScoreToDatabase(results, accuracy)}
              >
                {isRetrying ? 'Retrying...' : '↺ Retry MS SQL Connection'}
              </button>
            </div>
          )}
        </div>

        {/* Navigation Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href={`/quiz/${results.quizId}?mode=${results.gameMode}&tag=${encodeURIComponent(results.gamerTag)}`} className="retro-btn retro-btn-gold">
            ↺ Play Again
          </a>
          <a href="/leaderboard" className="retro-btn retro-btn-crimson">
            🏆 Global Leaderboard
          </a>
          <a href="/" className="retro-btn retro-btn-magenta">
            🏠 Main Arcade
          </a>
        </div>
      </div>

      {/* Question Review Section */}
      <div
        className="retro-card"
        style={{
          padding: '2rem 1.75rem',
          backgroundColor: '#360185',
          borderColor: '#8F0177',
          boxShadow: '6px 6px 0px #DE1A58',
          color: '#F4B342'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F4B342' }}>
            CARTRIDGE REVIEW &amp; LOG
          </h2>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="retro-btn"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.85rem',
                backgroundColor: filter === 'all' ? '#F4B342' : '#8F0177',
                color: filter === 'all' ? '#360185' : '#F4B342',
                borderColor: '#F4B342'
              }}
              onClick={() => setFilter('all')}
            >
              All ({results.answersLog.length})
            </button>
            <button
              type="button"
              className="retro-btn"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.85rem',
                backgroundColor: filter === 'correct' ? '#F4B342' : '#8F0177',
                color: filter === 'correct' ? '#360185' : '#F4B342',
                borderColor: '#F4B342'
              }}
              onClick={() => setFilter('correct')}
            >
              Correct ({correctCount})
            </button>
            <button
              type="button"
              className="retro-btn"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.85rem',
                backgroundColor: filter === 'incorrect' ? '#DE1A58' : '#8F0177',
                color: '#F4B342',
                borderColor: '#F4B342'
              }}
              onClick={() => setFilter('incorrect')}
            >
              Missed ({incorrectCount})
            </button>
          </div>
        </div>

        {filteredLog.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#F4B342', opacity: 0.8, padding: '2rem' }}>
            No questions in this filter.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredLog.map((item, idx) => (
              <div
                key={idx}
                style={{
                  border: '2.5px solid #F4B342',
                  borderRadius: '6px',
                  padding: '1.25rem',
                  backgroundColor: '#8F0177',
                  borderLeft: `6px solid ${item.isCorrect ? '#F4B342' : '#DE1A58'}`,
                  color: '#F4B342'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#F4B342' }}>
                    {idx + 1}. {item.questionText}
                  </div>
                  <span
                    className="retro-sticker"
                    style={{
                      fontSize: '0.85rem',
                      padding: '0.15rem 0.45rem',
                      backgroundColor: item.isCorrect ? '#F4B342' : '#DE1A58',
                      color: item.isCorrect ? '#360185' : '#F4B342',
                      borderColor: '#F4B342'
                    }}
                  >
                    {item.isCorrect ? 'PASS' : 'MISS'}
                  </span>
                </div>

                {item.codeSnippet && (
                  <pre className="retro-code-box" style={{ margin: '0.75rem 0' }}>
                    <code>{item.codeSnippet}</code>
                  </pre>
                )}

                <div style={{ fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700 }}>Your Answer: </span>
                  <span style={{ color: '#F4B342', fontWeight: 600 }}>
                    {item.selectedIndex >= 0 ? item.options[item.selectedIndex] : '(Timed out / Skipped)'}
                  </span>
                </div>

                {!item.isCorrect && (
                  <div style={{ fontSize: '0.92rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700 }}>Correct Answer: </span>
                    <span style={{ color: '#F4B342', fontWeight: 600 }}>
                      {item.options[item.correctIndex]}
                    </span>
                  </div>
                )}

                <div style={{ marginTop: '0.65rem', padding: '0.65rem', backgroundColor: '#360185', border: '1.5px solid #F4B342', borderRadius: '4px', fontSize: '0.88rem', color: '#F4B342' }}>
                  <strong>Rationale: </strong>{item.explanation}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
