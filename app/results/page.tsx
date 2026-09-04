'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { retroSound } from '@/lib/sound';
import { RetroTrophyIcon, RetroFloppyIcon } from '@/components/RetroIcons';

interface ResultsData {
  quizId: number;
  quizTitle: string;
  gamerTag: string;
  gameMode: string;
  score: number;
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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem('last_quiz_results');
    if (raw) {
      try {
        const parsed: ResultsData = JSON.parse(raw);
        setResults(parsed);

        const correctCount = parsed.answersLog.filter(a => a.isCorrect).length;
        const total = parsed.answersLog.length;
        const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

        if (accuracy >= 60) {
          retroSound.playFanfare();
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#934761', '#AD5C71', '#72BAA9', '#D5E7B5']
          });
        }

        fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quizId: parsed.quizId,
            quizTitle: parsed.quizTitle,
            gamerTag: parsed.gamerTag,
            score: parsed.score,
            accuracy,
            maxStreak: parsed.maxStreak,
            gameMode: parsed.gameMode,
            timeSpentSeconds: parsed.totalTimeSpent
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data?.success) setSavedToDb(true);
            else setSavedToDb(false);
          })
          .catch(() => setSavedToDb(false));

      } catch (e) {
        console.error('Error parsing results:', e);
      }
    }
  }, []);

  if (!results) {
    return (
      <div className="retro-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-plum)', marginBottom: '1rem' }}>No Active Results</h2>
        <p style={{ marginBottom: '1.5rem' }}>Play a quiz cartridge to view your score certificate.</p>
        <a href="/" className="retro-btn retro-btn-plum">Return to Arcade</a>
      </div>
    );
  }

  const correctCount = results.answersLog.filter(a => a.isCorrect).length;
  const incorrectCount = results.answersLog.length - correctCount;
  const accuracy = results.answersLog.length > 0 ? Math.round((correctCount / results.answersLog.length) * 100) : 0;

  const filteredLog = results.answersLog.filter(item => {
    if (filter === 'correct') return item.isCorrect;
    if (filter === 'incorrect') return !item.isCorrect;
    return true;
  });

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Certificate Header Card */}
      <div className="retro-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', marginBottom: '2rem', backgroundColor: 'var(--color-cream)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <RetroTrophyIcon size={64} />
        </div>

        <div style={{ display: 'inline-block', transform: 'rotate(-2deg)', marginBottom: '1rem' }}>
          <span className="retro-sticker sticker-teal">★ OFFICIAL ARCADE RECORD ★</span>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-plum)', marginBottom: '0.4rem' }}>
          {accuracy >= 80 ? 'HIGH SCORE MASTER!' : accuracy >= 50 ? 'GOOD RUN, PLAYER!' : 'GAME OVER • TRY AGAIN'}
        </h1>

        <p className="font-arcade" style={{ fontSize: '1.4rem', color: 'var(--color-rose)', marginBottom: '1.75rem' }}>
          CARTRIDGE: {results.quizTitle.toUpperCase()} • MODE: {results.gameMode.toUpperCase()}
        </p>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
          <div className="retro-card" style={{ padding: '1rem', backgroundColor: 'var(--card-bg)' }}>
            <div className="font-arcade" style={{ fontSize: '2.2rem', color: 'var(--color-plum)', fontWeight: 'bold' }}>
              {results.score}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-rose)' }}>FINAL SCORE</div>
          </div>

          <div className="retro-card" style={{ padding: '1rem', backgroundColor: 'var(--card-bg)' }}>
            <div className="font-arcade" style={{ fontSize: '2.2rem', color: 'var(--color-plum)', fontWeight: 'bold' }}>
              {accuracy}%
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-rose)' }}>ACCURACY</div>
          </div>

          <div className="retro-card" style={{ padding: '1rem', backgroundColor: 'var(--card-bg)' }}>
            <div className="font-arcade" style={{ fontSize: '2.2rem', color: 'var(--color-plum)', fontWeight: 'bold' }}>
              {results.maxStreak}x
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-rose)' }}>MAX STREAK</div>
          </div>

          <div className="retro-card" style={{ padding: '1rem', backgroundColor: 'var(--card-bg)' }}>
            <div className="font-arcade" style={{ fontSize: '2.2rem', color: 'var(--color-plum)', fontWeight: 'bold' }}>
              {results.totalTimeSpent}s
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-rose)' }}>TIME SPENT</div>
          </div>
        </div>

        {/* MS SQL Save Status Badge */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <span
            className="retro-sticker sticker-plum"
            style={{ fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RetroFloppyIcon size={20} />
            <span>{savedToDb ? 'RECORD COMMITTED TO MS SQL SERVER' : 'RECORD CACHED IN LOCAL LEADERBOARD'}</span>
          </span>
        </div>

        {/* Navigation Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href={`/quiz/${results.quizId}?mode=${results.gameMode}&tag=${encodeURIComponent(results.gamerTag)}`} className="retro-btn retro-btn-plum">
            ↺ Play Again
          </a>
          <a href="/leaderboard" className="retro-btn retro-btn-teal">
            🏆 Global Leaderboard
          </a>
          <a href="/" className="retro-btn retro-btn-cream">
            🏠 Main Arcade
          </a>
        </div>
      </div>

      {/* Question Review Section */}
      <div className="retro-card" style={{ padding: '2rem 1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-plum)' }}>
            CARTRIDGE REVIEW &amp; LOG
          </h2>

          {/* Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className={`retro-btn ${filter === 'all' ? 'retro-btn-plum' : 'retro-btn-cream'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
              onClick={() => setFilter('all')}
            >
              All ({results.answersLog.length})
            </button>
            <button
              type="button"
              className={`retro-btn ${filter === 'correct' ? 'retro-btn-teal' : 'retro-btn-cream'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
              onClick={() => setFilter('correct')}
            >
              Correct ({correctCount})
            </button>
            <button
              type="button"
              className={`retro-btn ${filter === 'incorrect' ? 'retro-btn-rose' : 'retro-btn-cream'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
              onClick={() => setFilter('incorrect')}
            >
              Missed ({incorrectCount})
            </button>
          </div>
        </div>

        {filteredLog.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            No questions in this filter.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredLog.map((item, idx) => (
              <div
                key={idx}
                style={{
                  border: '2.5px solid var(--border-main)',
                  borderRadius: '6px',
                  padding: '1.25rem',
                  backgroundColor: item.isCorrect ? '#f2fcf9' : '#fff5f7',
                  borderLeft: `6px solid ${item.isCorrect ? 'var(--color-teal)' : 'var(--color-rose)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-plum)' }}>
                    {idx + 1}. {item.questionText}
                  </div>
                  <span
                    className="retro-sticker"
                    style={{
                      fontSize: '0.85rem',
                      padding: '0.15rem 0.45rem',
                      backgroundColor: item.isCorrect ? 'var(--color-teal)' : 'var(--color-rose)',
                      color: item.isCorrect ? '#0d382f' : '#fff'
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
                  <span style={{ color: item.isCorrect ? '#0d5c48' : '#991b1b', fontWeight: 600 }}>
                    {item.selectedIndex >= 0 ? item.options[item.selectedIndex] : '(Timed out / Skipped)'}
                  </span>
                </div>

                {!item.isCorrect && (
                  <div style={{ fontSize: '0.92rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700 }}>Correct Answer: </span>
                    <span style={{ color: '#0d5c48', fontWeight: 600 }}>
                      {item.options[item.correctIndex]}
                    </span>
                  </div>
                )}

                <div style={{ marginTop: '0.65rem', padding: '0.65rem', backgroundColor: 'var(--color-cream)', borderRadius: '4px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
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
