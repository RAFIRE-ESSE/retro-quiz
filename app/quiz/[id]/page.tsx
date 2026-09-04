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
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const setupQuestions = useCallback((rawQuiz: any) => {
    setQuiz(rawQuiz);
    const rawQuestions = Array.isArray(rawQuiz.questions) ? rawQuiz.questions : [];
    if (rawQuestions.length === 0) {
      setQuestions([]);
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

    setQuestions(prepared);
    if (gameMode === 'blitz') {
      setTimeRemaining(60);
    } else if (gameMode === 'standard' || gameMode === 'survival') {
      setTimeRemaining(15);
    }
  }, [gameMode]);

  const tryLocalFallback = useCallback(() => {
    try {
      const localStr = localStorage.getItem('arcade_custom_quizzes');
      if (localStr) {
        const localQuizzes: any[] = JSON.parse(localStr);
        const cleanTarget = decodeURIComponent(quizId).toLowerCase();
        const found = localQuizzes.find((q: any) => 
          String(q.id).toLowerCase() === cleanTarget ||
          (q.slug && q.slug.toLowerCase() === cleanTarget) ||
          (q.slug && q.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanTarget.replace(/[^a-z0-9]+/g, '-')) ||
          (q.title && q.title.toLowerCase() === cleanTarget)
        );
        if (found) {
          setupQuestions(found);
          setLoading(false);
          return true;
        }
      }
    } catch (e) {
      console.error('Failed to load quiz from localStorage:', e);
    }
    return false;
  }, [quizId, setupQuestions]);

  // Fetch Quiz Data
  useEffect(() => {
    if (!quizId) return;

    fetch(`/api/quizzes/${quizId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data?.quiz) {
          setupQuestions(data.quiz);
          setLoading(false);
        } else {
          const ok = tryLocalFallback();
          if (!ok) setLoading(false);
        }
      })
      .catch(err => {
        console.warn('Backend fetch failed, attempting local fallback:', err);
        const ok = tryLocalFallback();
        if (!ok) setLoading(false);
      });
  }, [quizId, gameMode, setupQuestions, tryLocalFallback]);

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
      <div
        className="retro-card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          backgroundColor: '#360185',
          borderColor: '#8F0177',
          boxShadow: '6px 6px 0px #DE1A58',
          maxWidth: '520px',
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
            ★ CARTRIDGE NOT DETECTED ★
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
          CARTRIDGE ERROR
        </h2>

        <p style={{ color: '#F4B342', opacity: 0.9, fontSize: '1.05rem', marginBottom: '2rem' }}>
          Could not load trivia questions for this cartridge. It may have been unetched or removed.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/" className="retro-btn retro-btn-gold">
            Return to Arcade
          </a>
          <a href="/builder" className="retro-btn retro-btn-crimson">
            Create Cartridge
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
