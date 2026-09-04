'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { retroSound } from '@/lib/sound';
import { Question, Quiz } from '@/lib/seedData';
import { RetroClockIcon, RetroFlameIcon } from '@/components/RetroIcons';
import QuizLoading from './loading';

interface AnswerLogItem {
  questionText: string;
  codeSnippet?: string | null;
  options: string[];
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

function QuizPlayContent() {
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastAwarded, setLastAwarded] = useState<{ points: number; text: string; isCorrect: boolean } | null>(null);

  // Synchronous reference trackers to guarantee 0 dropped points on closure boundaries
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const maxStreakRef = useRef(0);
  const answersLogRef = useRef<AnswerLogItem[]>([]);
  const totalTimeSpentRef = useRef(0);
  const currentIndexRef = useRef(0);
  const timeRemainingRef = useRef(15);
  const quizRef = useRef<Quiz | null>(null);
  const questionsRef = useRef<Question[]>([]);
  const isFinishingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep timeRemainingRef synced with state
  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  const setupQuestions = useCallback((rawQuiz: Quiz) => {
    quizRef.current = rawQuiz;
    setQuiz(rawQuiz);

    const rawQuestions = Array.isArray(rawQuiz.questions) ? rawQuiz.questions : [];
    if (rawQuestions.length === 0) {
      setQuestions([]);
      questionsRef.current = [];
      return;
    }

    const prepared = [...rawQuestions].sort(() => Math.random() - 0.5).map((q, qIndex) => {
      const safeOpts = Array.isArray(q.options) && q.options.length >= 2
        ? q.options
        : ['Option A', 'Option B', 'Option C', 'Option D'];
      const rawCorrect = typeof q.correctOption === 'number' ? q.correctOption : 0;
      const validCorrect = (rawCorrect >= 0 && rawCorrect < safeOpts.length) ? rawCorrect : 0;
      const correctText = safeOpts[validCorrect];
      const shuffledOpts = [...safeOpts].sort(() => Math.random() - 0.5);
      const newCorrectIdx = Math.max(0, shuffledOpts.indexOf(correctText));

      return {
        id: q.id || qIndex + 1,
        questionText: q.questionText || `Question #${qIndex + 1}`,
        codeSnippet: q.codeSnippet || null,
        options: shuffledOpts,
        correctOption: newCorrectIdx,
        explanation: q.explanation || 'Good job!'
      };
    });

    questionsRef.current = prepared;
    setQuestions(prepared);

    const initialTime = gameMode === 'blitz' ? 60 : 15;
    setTimeRemaining(initialTime);
    timeRemainingRef.current = initialTime;
  }, [gameMode]);

  // Fetch Quiz directly from MS SQL Server backend
  useEffect(() => {
    if (!quizId) return;

    setLoading(true);
    setErrorMessage(null);

    fetch(`/api/quizzes/${quizId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || `Failed to fetch quiz from MS SQL Server (HTTP ${res.status})`);
        }
        return data;
      })
      .then(data => {
        if (data?.quiz) {
          setupQuestions(data.quiz);
          setLoading(false);
        } else {
          setErrorMessage('Cartridge data was not returned by Microsoft SQL Server.');
          setLoading(false);
        }
      })
      .catch(err => {
        setErrorMessage(err.message || 'Cartridge not found in Microsoft SQL Server.');
        setLoading(false);
      });
  }, [quizId, setupQuestions]);

  // Guaranteed Atomic Finish Quiz Handler
  const finishQuiz = useCallback((reason = 'completed') => {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);

    const finalAnswers = answersLogRef.current;
    const correctCount = finalAnswers.filter(a => a.isCorrect).length;
    const totalCount = finalAnswers.length;
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    const resultPayload = {
      quizId: quizRef.current?.id || 1,
      quizTitle: quizRef.current?.title || 'Retro Quiz',
      gamerTag,
      gameMode,
      score: scoreRef.current,
      accuracy,
      maxStreak: maxStreakRef.current,
      totalQuestions: questionsRef.current.length || totalCount,
      totalTimeSpent: totalTimeSpentRef.current,
      answersLog: finalAnswers,
      reason
    };

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('last_quiz_results', JSON.stringify(resultPayload));
      window.location.href = '/results';
    }
  }, [gamerTag, gameMode]);

  // Timer Tick Handler
  useEffect(() => {
    if (loading || questions.length === 0 || gameMode === 'practice' || isAnswerSubmitted) {
      return;
    }

    timerRef.current = setInterval(() => {
      totalTimeSpentRef.current += 1;
      setTimeRemaining(prev => {
        const nextVal = prev - 1;
        timeRemainingRef.current = nextVal;

        if (nextVal <= 4 && nextVal > 0) {
          retroSound.playTick();
        }

        if (nextVal <= 0) {
          clearInterval(timerRef.current!);
          if (gameMode === 'blitz') {
            finishQuiz('time_up');
            return 0;
          } else {
            handleAnswerSelect(-1, true);
            return 0;
          }
        }
        return nextVal;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, questions.length, gameMode, isAnswerSubmitted, currentIndex, finishQuiz]);

  // Answer Selection & Point Calculation
  const handleAnswerSelect = (optionIndex: number, isTimeout = false) => {
    if (isAnswerSubmitted || isFinishingRef.current) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setIsAnswerSubmitted(true);
    setSelectedOption(optionIndex);

    const currentQ = questionsRef.current[currentIndexRef.current];
    if (!currentQ) return;

    const isCorrect = !isTimeout && optionIndex === currentQ.correctOption;

    let pointsAwarded = 0;
    let feedbackText = '';

    if (isCorrect) {
      retroSound.playCorrect();
      const nextStreak = streakRef.current + 1;
      streakRef.current = nextStreak;
      if (nextStreak > maxStreakRef.current) {
        maxStreakRef.current = nextStreak;
      }

      // Transparent streak multiplier: 1x, 1.2x (2+), 1.5x (4+), 2.0x (6+)
      let multiplier = 1.0;
      if (nextStreak >= 6) multiplier = 2.0;
      else if (nextStreak >= 4) multiplier = 1.5;
      else if (nextStreak >= 2) multiplier = 1.2;

      // Speed bonus: Standard/Survival: remaining seconds * 10. Blitz: flat 30. Practice: 0
      const basePoints = 100;
      const speedBonus = (gameMode === 'standard' || gameMode === 'survival')
        ? Math.max(0, timeRemainingRef.current) * 10
        : (gameMode === 'blitz' ? 30 : 0);

      pointsAwarded = Math.round((basePoints + speedBonus) * multiplier);
      scoreRef.current += pointsAwarded;

      if (multiplier > 1) {
        feedbackText = `+${pointsAwarded} PTS! [Base ${basePoints} + Speed ${speedBonus}] × ${multiplier}x Multiplier!`;
      } else {
        feedbackText = `+${pointsAwarded} PTS! [Base ${basePoints} + Speed ${speedBonus}]`;
      }

      if (gameMode === 'blitz') {
        setTimeRemaining(prev => Math.min(99, prev + 3));
      }
    } else {
      retroSound.playIncorrect();
      streakRef.current = 0;
      feedbackText = isTimeout ? 'TIME EXPIRED! 0 PTS • STREAK RESET' : 'INCORRECT! 0 PTS • STREAK RESET';
      if (gameMode === 'blitz') {
        setTimeRemaining(prev => Math.max(0, prev - 2));
      }
    }

    // Update state for UI display
    setScore(scoreRef.current);
    setStreak(streakRef.current);
    setMaxStreak(maxStreakRef.current);
    setLastAwarded({ points: pointsAwarded, text: feedbackText, isCorrect });

    // Append to synchronized answer log
    const logEntry: AnswerLogItem = {
      questionText: currentQ.questionText,
      codeSnippet: currentQ.codeSnippet,
      options: currentQ.options,
      selectedIndex: optionIndex,
      correctIndex: currentQ.correctOption,
      isCorrect,
      explanation: currentQ.explanation
    };

    answersLogRef.current.push(logEntry);
    setAnswersLog([...answersLogRef.current]);

    // Handle Survival Mode fail condition
    if (gameMode === 'survival' && !isCorrect) {
      setTimeout(() => {
        finishQuiz('survival_failed');
      }, 1400);
      return;
    }

    // Auto-advance if not practice mode
    if (gameMode !== 'practice') {
      setTimeout(() => {
        advanceQuestion();
      }, 1400);
    }
  };

  const advanceQuestion = () => {
    if (isFinishingRef.current) return;

    if (currentIndexRef.current + 1 >= questionsRef.current.length) {
      finishQuiz('completed');
    } else {
      const nextIdx = currentIndexRef.current + 1;
      currentIndexRef.current = nextIdx;
      setCurrentIndex(nextIdx);
      setIsAnswerSubmitted(false);
      setSelectedOption(null);
      setLastAwarded(null);

      if (gameMode === 'standard' || gameMode === 'survival') {
        setTimeRemaining(15);
        timeRemainingRef.current = 15;
      }
    }
  };

  // Keyboard shortcut support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (loading || questions.length === 0 || isFinishingRef.current) return;

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
  }, [isAnswerSubmitted, gameMode, questions.length, loading]);

  if (loading) {
    return (
      <div className="retro-card" style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#360185', borderColor: '#8F0177', color: '#F4B342' }}>
        <div className="font-arcade" style={{ fontSize: '2.5rem', color: '#F4B342', marginBottom: '1rem' }}>
          QUERYING MICROSOFT SQL SERVER...
        </div>
        <p style={{ color: '#F4B342', opacity: 0.9 }}>Reading cartridge data from SQL Database...</p>
      </div>
    );
  }

  if (errorMessage || !quiz || questions.length === 0) {
    return (
      <div
        className="retro-card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          backgroundColor: '#360185',
          borderColor: '#8F0177',
          boxShadow: '6px 6px 0px #DE1A58',
          maxWidth: '560px',
          margin: '2rem auto'
        }}
      >
        <div style={{ display: 'inline-block', transform: 'rotate(-2deg)', marginBottom: '1rem' }}>
          <span
            className="retro-sticker"
            style={{
              backgroundColor: '#DE1A58',
              color: '#F4B342',
              borderColor: '#F4B342',
              fontSize: '0.95rem'
            }}
          >
            ★ MS SQL DATABASE NOTICE ★
          </span>
        </div>

        <h2
          className="font-arcade"
          style={{
            fontSize: '2.2rem',
            color: '#F4B342',
            letterSpacing: '0.04em',
            marginBottom: '1rem'
          }}
        >
          CARTRIDGE NOT FOUND
        </h2>

        <p style={{ color: '#F4B342', opacity: 0.95, fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.5 }}>
          {errorMessage || 'Could not locate this cartridge in Microsoft SQL Server. It may not exist in the database.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/" className="retro-btn retro-btn-gold">
            Return to Arcade
          </a>
          <a href="/builder" className="retro-btn retro-btn-crimson">
            Create in MS SQL
          </a>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      {/* Top Arcade Status Bar - Strict 4 Colors */}
      <div
        className="retro-card"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          backgroundColor: '#360185',
          borderColor: '#8F0177',
          boxShadow: '4px 4px 0px #DE1A58',
          color: '#F4B342'
        }}
      >
        <div>
          <span
            className="retro-sticker"
            style={{
              fontSize: '0.9rem',
              backgroundColor: '#8F0177',
              color: '#F4B342',
              borderColor: '#F4B342'
            }}
          >
            {quiz.title}
          </span>
          <span className="font-arcade" style={{ marginLeft: '0.75rem', fontSize: '1.15rem', color: '#DE1A58' }}>
            TAG: {gamerTag}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Streak Counter */}
          <div className="font-arcade" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '1.35rem', color: '#F4B342' }}>
            <RetroFlameIcon size={20} />
            <span>{streak}x STREAK</span>
          </div>

          {/* Score Counter */}
          <div className="font-arcade" style={{ fontSize: '1.6rem', color: '#F4B342', fontWeight: 'bold' }}>
            SCORE: {score}
          </div>

          {/* Timer Clock */}
          {gameMode !== 'practice' && (
            <div
              className={`retro-sticker ${timeRemaining <= 4 ? 'animate-pulse-retro' : ''}`}
              style={{
                fontSize: '1.25rem',
                minWidth: '85px',
                textAlign: 'center',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                backgroundColor: '#DE1A58',
                color: '#F4B342',
                borderColor: '#F4B342'
              }}
            >
              <RetroClockIcon size={18} />
              <span>{timeRemaining}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.88rem', fontWeight: 700, color: '#360185' }}>
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

      {/* Real-time Point Calculation Banner */}
      {lastAwarded && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            backgroundColor: lastAwarded.isCorrect ? '#8F0177' : '#DE1A58',
            border: '2px solid #F4B342',
            color: '#F4B342',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '1.05rem',
            letterSpacing: '0.03em'
          }}
          className="font-arcade"
        >
          {lastAwarded.text}
        </div>
      )}

      {/* Main Question Card - Strict 4 Colors */}
      <div
        className="retro-card"
        style={{
          padding: '2rem 1.75rem',
          marginBottom: '1.5rem',
          backgroundColor: '#360185',
          borderColor: '#8F0177',
          boxShadow: '6px 6px 0px #DE1A58',
          color: '#F4B342'
        }}
      >
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F4B342', lineHeight: 1.35, marginBottom: '1rem' }}>
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
              backgroundColor: '#8F0177',
              borderColor: '#F4B342',
              color: '#F4B342'
            };

            if (isAnswerSubmitted) {
              if (idx === currentQ.correctOption) {
                btnStyle = {
                  backgroundColor: '#F4B342',
                  borderColor: '#DE1A58',
                  color: '#360185'
                };
              } else if (idx === selectedOption) {
                btnStyle = {
                  backgroundColor: '#DE1A58',
                  borderColor: '#F4B342',
                  color: '#F4B342'
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
                    backgroundColor: '#360185',
                    color: '#F4B342',
                    border: '1.5px solid #F4B342',
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
              backgroundColor: '#8F0177',
              border: '2.5px solid #F4B342',
              borderRadius: '6px',
              color: '#F4B342'
            }}
          >
            <div style={{ fontWeight: 800, color: '#F4B342', marginBottom: '0.4rem', fontSize: '1rem' }}>
              💡 HISTORICAL RATIONALE:
            </div>
            <div style={{ color: '#F4B342', fontSize: '0.95rem', lineHeight: 1.5, opacity: 0.95 }}>
              {currentQ.explanation}
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          type="button"
          className="retro-btn retro-btn-gold"
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
            className="retro-btn retro-btn-gold"
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

export default function QuizPlayPage() {
  return (
    <Suspense fallback={<QuizLoading />}>
      <QuizPlayContent />
    </Suspense>
  );
}
