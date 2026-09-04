'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { retroSound } from '@/lib/sound';
import { Question, Quiz } from '@/lib/seedData';
import { RetroClockIcon, RetroFlameIcon } from '@/components/RetroIcons';

interface AnswerLogItem {
  questionText: string;
  codeSnippet?: string | null;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export default function QuizPlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const quizId = params?.id as string;
  const gameMode = (searchParams?.get('mode') || 'standard') as 'standard' | 'blitz' | 'practice' | 'survival';
  const gamerTag = searchParams?.get('tag') || 'PLAYER_1';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answersLog, setAnswersLog] = useState<AnswerLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Quiz Data
  useEffect(() => {
    if (!quizId) return;

    fetch(`/api/quizzes/${quizId}`)
      .then(res => res.json())
      .then(data => {
        if (data?.quiz) {
          setQuiz(data.quiz);
          const shuffled = [...data.quiz.questions].sort(() => Math.random() - 0.5).map(q => {
            const correctText = q.options[q.correctOption];
            const shuffledOpts = [...q.options].sort(() => Math.random() - 0.5);
            const newCorrectIdx = shuffledOpts.indexOf(correctText);
            return {
              ...q,
              options: shuffledOpts,
              correctOption: newCorrectIdx
            };
          });
          setQuestions(shuffled);

          if (gameMode === 'blitz') {
            setTimeRemaining(60);
          } else if (gameMode === 'standard' || gameMode === 'survival') {
            setTimeRemaining(15);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load quiz:', err);
        setLoading(false);
      });
  }, [quizId, gameMode]);

  // Finish Quiz and Redirect to Results
  const finishQuiz = useCallback((reason = 'completed') => {
    if (timerRef.current) clearInterval(timerRef.current);

    const resultPayload = {
      quizId: quiz?.id || 1,
      quizTitle: quiz?.title || 'Retro Quiz',
      gamerTag,
      gameMode,
      score,
      maxStreak,
      totalQuestions: questions.length,
      totalTimeSpent,
      answersLog,
      reason
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('last_quiz_results', JSON.stringify(resultPayload));
      window.location.href = '/results';
    }
  }, [quiz, gamerTag, gameMode, score, maxStreak, questions.length, totalTimeSpent, answersLog]);

  // Timer Tick Handling
  useEffect(() => {
    if (loading || questions.length === 0 || gameMode === 'practice' || isAnswerSubmitted) {
      return;
    }

    timerRef.current = setInterval(() => {
      setTotalTimeSpent(prev => prev + 1);
      setTimeRemaining(prev => {
        if (prev <= 4 && prev > 1) {
          retroSound.playTick();
        }

        if (prev <= 1) {
          clearInterval(timerRef.current!);
          if (gameMode === 'blitz') {
            finishQuiz('time_up');
            return 0;
          } else {
            handleAnswerSelect(-1, true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, questions.length, gameMode, isAnswerSubmitted, currentIndex]);

  const handleAnswerSelect = (optionIndex: number, isTimeout = false) => {
    if (isAnswerSubmitted) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setIsAnswerSubmitted(true);
    setSelectedOption(optionIndex);

    const currentQ = questions[currentIndex];
    const isCorrect = !isTimeout && optionIndex === currentQ.correctOption;

    let pointsAwarded = 0;
    if (isCorrect) {
      retroSound.playCorrect();
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > maxStreak) setMaxStreak(nextStreak);

      let multiplier = 1.0;
      if (nextStreak >= 6) multiplier = 2.0;
      else if (nextStreak >= 4) multiplier = 1.5;
      else if (nextStreak >= 2) multiplier = 1.2;

      const timeBonus = (gameMode === 'standard' || gameMode === 'survival') ? timeRemaining * 10 : 20;
      pointsAwarded = Math.round((100 + timeBonus) * multiplier);
      setScore(prev => prev + pointsAwarded);

      if (gameMode === 'blitz') {
        setTimeRemaining(prev => Math.min(99, prev + 3));
      }
    } else {
      retroSound.playIncorrect();
      setStreak(0);
      if (gameMode === 'blitz') {
        setTimeRemaining(prev => Math.max(0, prev - 2));
      }
    }

    const logEntry: AnswerLogItem = {
      questionText: currentQ.questionText,
      codeSnippet: currentQ.codeSnippet,
      options: currentQ.options,
      selectedIndex: optionIndex,
      correctIndex: currentQ.correctOption,
      isCorrect,
      explanation: currentQ.explanation
    };

    setAnswersLog(prev => [...prev, logEntry]);

    if (gameMode === 'survival' && !isCorrect) {
      setTimeout(() => {
        finishQuiz('survival_failed');
      }, 1400);
      return;
    }

    if (gameMode !== 'practice') {
      setTimeout(() => {
        advanceQuestion();
      }, 1300);
    }
  };

  const advanceQuestion = () => {
    if (currentIndex + 1 >= questions.length) {
      finishQuiz('completed');
    } else {
      setCurrentIndex(prev => prev + 1);
      setIsAnswerSubmitted(false);
      setSelectedOption(null);
      if (gameMode === 'standard' || gameMode === 'survival') {
        setTimeRemaining(15);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading || questions.length === 0) return;

      if (isAnswerSubmitted && gameMode === 'practice') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          advanceQuestion();
        }
        return;
      }

      if (isAnswerSubmitted) return;

      const key = e.key.toUpperCase();
      let optIdx = -1;
      if (key === '1' || key === 'A') optIdx = 0;
      else if (key === '2' || key === 'B') optIdx = 1;
      else if (key === '3' || key === 'C') optIdx = 2;
      else if (key === '4' || key === 'D') optIdx = 3;

      if (optIdx >= 0 && optIdx < 4) {
        handleAnswerSelect(optIdx);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerSubmitted, gameMode, currentIndex, questions, loading]);

  if (loading) {
    return (
      <div className="retro-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div className="font-arcade" style={{ fontSize: '2.5rem', color: 'var(--color-plum)' }}>
          INSERTING CARTRIDGE...
        </div>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="retro-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--color-plum)', marginBottom: '1rem' }}>Cartridge Error</h2>
        <p style={{ marginBottom: '1.5rem' }}>Could not load questions for this quiz.</p>
        <a href="/" className="retro-btn retro-btn-plum">Return to Arcade</a>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Top Arcade Status Bar */}
      <div className="retro-card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: 'var(--card-bg)' }}>
        <div>
          <span className="retro-sticker sticker-plum" style={{ fontSize: '0.9rem' }}>
            {quiz.title}
          </span>
          <span className="font-arcade" style={{ marginLeft: '0.75rem', fontSize: '1.15rem', color: 'var(--color-rose)' }}>
            TAG: {gamerTag}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Streak Counter */}
          <div className="font-arcade" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '1.35rem', color: streak >= 2 ? 'var(--color-plum)' : 'var(--text-muted)' }}>
            <RetroFlameIcon size={20} />
            <span>{streak}x STREAK</span>
          </div>

          {/* Score Counter */}
          <div className="font-arcade" style={{ fontSize: '1.6rem', color: 'var(--color-plum)', fontWeight: 'bold' }}>
            SCORE: {score}
          </div>

          {/* Timer Clock */}
          {gameMode !== 'practice' && (
            <div
              className={`retro-sticker ${timeRemaining <= 4 ? 'sticker-rose animate-pulse-retro' : 'sticker-teal'}`}
              style={{ fontSize: '1.25rem', minWidth: '85px', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
            >
              <RetroClockIcon size={18} />
              <span>{timeRemaining}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-plum)' }}>
          <span>QUESTION {currentIndex + 1} OF {questions.length}</span>
          <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}% COMPLETE</span>
        </div>
        <div className="retro-progress-track">
          <div
            className="retro-progress-fill"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="retro-card" style={{ padding: '2rem 1.75rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-plum)', lineHeight: 1.35, marginBottom: '1rem' }}>
          {currentQ.questionText}
        </h2>

        {currentQ.codeSnippet && (
          <pre className="retro-code-box">
            <code>{currentQ.codeSnippet}</code>
          </pre>
        )}

        {/* Options Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.5rem' }}>
          {currentQ.options.map((opt, idx) => {
            let btnStyle = {
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-primary)'
            };

            if (isAnswerSubmitted) {
              if (idx === currentQ.correctOption) {
                btnStyle = {
                  backgroundColor: 'var(--color-teal)',
                  borderColor: 'var(--border-main)',
                  color: '#0d2820'
                };
              } else if (idx === selectedOption) {
                btnStyle = {
                  backgroundColor: 'var(--color-rose)',
                  borderColor: 'var(--border-main)',
                  color: '#fff'
                };
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isAnswerSubmitted}
                onClick={() => handleAnswerSelect(idx)}
                className={`retro-btn ${isAnswerSubmitted && idx === selectedOption && idx !== currentQ.correctOption ? 'animate-shake' : ''}`}
                style={{
                  ...btnStyle,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  padding: '1rem 1.25rem',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  width: '100%'
                }}
              >
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'var(--color-plum)',
                    color: '#fff',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    marginRight: '0.85rem',
                    flexShrink: 0
                  }}
                >
                  {letters[idx]}
                </span>
                <span style={{ flexGrow: 1 }}>{opt}</span>
              </button>
            );
          })}
        </div>

        {isAnswerSubmitted && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              backgroundColor: 'var(--color-cream)',
              border: '2.5px solid var(--border-main)',
              borderRadius: '6px'
            }}
          >
            <div style={{ fontWeight: 800, color: 'var(--color-plum)', marginBottom: '0.4rem', fontSize: '1rem' }}>
              💡 HISTORICAL RATIONALE:
            </div>
            <div style={{ color: 'var(--color-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {currentQ.explanation}
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          className="retro-btn retro-btn-cream"
          style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
          onClick={() => {
            if (confirm('Exit quiz? Current score will be lost.')) {
              window.location.href = '/';
            }
          }}
        >
          ✕ Abandon Cartridge
        </button>

        {isAnswerSubmitted && gameMode === 'practice' && (
          <button
            type="button"
            className="retro-btn retro-btn-plum"
            onClick={advanceQuestion}
            style={{ fontSize: '1rem', padding: '0.6rem 1.5rem' }}
          >
            NEXT QUESTION ▶ (ENTER)
          </button>
        )}
      </div>
    </div>
  );
}
