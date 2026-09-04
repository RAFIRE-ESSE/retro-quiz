'use client';

import React, { useState, useEffect } from 'react';
import { retroSound } from '@/lib/sound';
import {
  RetroJoystickIcon,
  RetroLightningIcon,
  RetroCoffeeIcon,
  RetroSkullIcon,
  RetroFloppyIcon,
  RetroTerminalIcon,
  RetroAtomIcon,
  RetroColumnIcon,
  RetroCoinIcon,
  RetroArcadeLogo
} from '@/components/RetroIcons';

interface QuizSummary {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  difficulty: string;
  questionCount: number;
}

export default function HomePage() {
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [gamerTag, setGamerTag] = useState('PLAYER_1');
  const [gameMode, setGameMode] = useState<'standard' | 'blitz' | 'practice' | 'survival'>('standard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTag = localStorage.getItem('arcade_gamertag');
    if (savedTag) setGamerTag(savedTag);

    fetch('/api/quizzes')
      .then(res => res.json())
      .then(data => {
        if (data?.quizzes) {
          setQuizzes(data.quizzes);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load quizzes:', err);
        setLoading(false);
      });
  }, []);

  const handleGamerTagChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 12);
    setGamerTag(clean);
    localStorage.setItem('arcade_gamertag', clean);
  };

  const handleSelectMode = (mode: 'standard' | 'blitz' | 'practice' | 'survival') => {
    setGameMode(mode);
    retroSound.playClick();
  };

  const handleStartQuiz = (slugOrId: string | number) => {
    retroSound.playCoin();
    const tag = gamerTag.trim() || 'PLAYER_1';
    window.location.href = `/quiz/${slugOrId}?mode=${gameMode}&tag=${encodeURIComponent(tag)}`;
  };

  // Helper to get matching retro SVG icon for each category
  const renderCartridgeIcon = (slug: string, category: string) => {
    const key = (slug || category).toLowerCase();
    if (key.includes('retro') || key.includes('tech') || key.includes('floppy')) {
      return <RetroFloppyIcon size={38} />;
    }
    if (key.includes('web') || key.includes('dev') || key.includes('code')) {
      return <RetroTerminalIcon size={38} />;
    }
    if (key.includes('science') || key.includes('cosmos')) {
      return <RetroAtomIcon size={38} />;
    }
    if (key.includes('world') || key.includes('history') || key.includes('trivia')) {
      return <RetroColumnIcon size={38} />;
    }
    return <RetroArcadeLogo size={38} />;
  };

  return (
    <div>
      {/* Hero Marquee Section - Strict 4-color styling */}
      <section
        className="retro-card"
        style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          marginBottom: '2.5rem',
          backgroundColor: '#360185',
          borderColor: '#8F0177',
          boxShadow: '6px 6px 0px #DE1A58'
        }}
      >
        <div style={{ display: 'inline-block', transform: 'rotate(-2deg)', marginBottom: '1rem' }}>
          <span
            className="retro-sticker"
            style={{
              backgroundColor: '#DE1A58',
              color: '#F4B342',
              borderColor: '#F4B342'
            }}
          >
            ★ 100% RETRO ARCADE TRIVIA ★
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: 800, color: '#F4B342', lineHeight: 1.1, marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          INSERT COIN &amp; PLAY
        </h1>

        <p style={{ fontSize: '1.2rem', color: '#F4B342', maxWidth: '650px', margin: '0 auto 1.75rem', fontWeight: 600, opacity: 0.95 }}>
          Step back into the 1980s &amp; 1990s! Test your knowledge across retro computing, modern tech, science, and history. High scores saved to Microsoft SQL Server.
        </p>

        {/* Gamer Tag Handle Input - Strict 4-color styling */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            backgroundColor: '#8F0177',
            border: '3px solid #F4B342',
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            boxShadow: '3px 3px 0px #360185'
          }}
        >
          <RetroCoinIcon size={26} />
          <span className="font-arcade" style={{ fontSize: '1.35rem', color: '#F4B342' }}>
            GAMER TAG:
          </span>
          <input
            type="text"
            value={gamerTag}
            onChange={(e) => handleGamerTagChange(e.target.value)}
            placeholder="PLAYER_1"
            className="font-arcade"
            style={{
              fontSize: '1.4rem',
              fontWeight: 'bold',
              border: 'none',
              background: 'transparent',
              color: '#F4B342',
              outline: 'none',
              width: '140px',
              textTransform: 'uppercase'
            }}
          />
        </div>
      </section>

      {/* Game Mode Selection - Strict 4-color styling */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#360185' }}>
            1. SELECT GAME MODE
          </h2>
          <span className="font-arcade" style={{ fontSize: '1.2rem', color: '#8F0177' }}>
            ACTIVE: {gameMode.toUpperCase()}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Standard Mode */}
          <div
            className={`retro-card retro-card-interactive ${gameMode === 'standard' ? 'animate-pulse-retro' : ''}`}
            onClick={() => handleSelectMode('standard')}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              backgroundColor: gameMode === 'standard' ? '#DE1A58' : '#360185',
              borderColor: gameMode === 'standard' ? '#F4B342' : '#8F0177',
              boxShadow: gameMode === 'standard' ? '6px 6px 0px #360185' : '4px 4px 0px #360185',
              color: '#F4B342'
            }}
          >
            <div style={{ marginBottom: '0.65rem' }}>
              <RetroJoystickIcon size={36} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F4B342', marginBottom: '0.35rem' }}>
              Standard Arcade
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#F4B342', opacity: 0.9 }}>
              15s timer per question. Combos, streak multipliers, and time bonuses.
            </p>
          </div>

          {/* Blitz Mode */}
          <div
            className={`retro-card retro-card-interactive ${gameMode === 'blitz' ? 'animate-pulse-retro' : ''}`}
            onClick={() => handleSelectMode('blitz')}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              backgroundColor: gameMode === 'blitz' ? '#8F0177' : '#360185',
              borderColor: gameMode === 'blitz' ? '#F4B342' : '#8F0177',
              boxShadow: gameMode === 'blitz' ? '6px 6px 0px #360185' : '4px 4px 0px #360185',
              color: '#F4B342'
            }}
          >
            <div style={{ marginBottom: '0.65rem' }}>
              <RetroLightningIcon size={36} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F4B342', marginBottom: '0.35rem' }}>
              Time Attack Blitz
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#F4B342', opacity: 0.9 }}>
              60s total clock. +3s for correct answers, -2s penalty for mistakes!
            </p>
          </div>

          {/* Practice Mode */}
          <div
            className={`retro-card retro-card-interactive ${gameMode === 'practice' ? 'animate-pulse-retro' : ''}`}
            onClick={() => handleSelectMode('practice')}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              backgroundColor: gameMode === 'practice' ? '#8F0177' : '#360185',
              borderColor: gameMode === 'practice' ? '#F4B342' : '#8F0177',
              boxShadow: gameMode === 'practice' ? '6px 6px 0px #360185' : '4px 4px 0px #360185',
              color: '#F4B342'
            }}
          >
            <div style={{ marginBottom: '0.65rem' }}>
              <RetroCoffeeIcon size={36} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F4B342', marginBottom: '0.35rem' }}>
              Relaxed Practice
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#F4B342', opacity: 0.9 }}>
              No clock pressure. Instant historical explanations after every choice.
            </p>
          </div>

          {/* Survival Mode */}
          <div
            className={`retro-card retro-card-interactive ${gameMode === 'survival' ? 'animate-pulse-retro' : ''}`}
            onClick={() => handleSelectMode('survival')}
            style={{
              padding: '1.25rem',
              cursor: 'pointer',
              backgroundColor: gameMode === 'survival' ? '#DE1A58' : '#360185',
              borderColor: gameMode === 'survival' ? '#F4B342' : '#8F0177',
              boxShadow: gameMode === 'survival' ? '6px 6px 0px #360185' : '4px 4px 0px #360185',
              color: '#F4B342'
            }}
          >
            <div style={{ marginBottom: '0.65rem' }}>
              <RetroSkullIcon size={36} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F4B342', marginBottom: '0.35rem' }}>
              Sudden Death
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#F4B342', opacity: 0.9 }}>
              1 wrong answer and game over immediately. How high can you score?
            </p>
          </div>
        </div>
      </section>

      {/* Cartridge Categories Grid - Strict 4-color styling */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#360185' }}>
            2. CHOOSE YOUR CARTRIDGE
          </h2>
          <span className="font-arcade" style={{ fontSize: '1.2rem', color: '#8F0177' }}>
            {quizzes.length} AVAILABLE
          </span>
        </div>

        {loading ? (
          <div className="retro-card" style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#360185', borderColor: '#8F0177' }}>
            <div className="font-arcade" style={{ fontSize: '2rem', color: '#F4B342' }}>
              INSERTING CARTRIDGES...
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="retro-card retro-card-interactive"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: '#360185',
                  borderColor: '#8F0177',
                  boxShadow: '4px 4px 0px #DE1A58',
                  color: '#F4B342'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        backgroundColor: '#8F0177',
                        border: '2.5px solid #F4B342',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '2px 2px 0px #360185'
                      }}
                    >
                      {renderCartridgeIcon(quiz.slug, quiz.category)}
                    </div>
                    <span
                      className="retro-sticker"
                      style={{
                        fontSize: '0.9rem',
                        backgroundColor: '#DE1A58',
                        color: '#F4B342',
                        borderColor: '#F4B342'
                      }}
                    >
                      {quiz.questionCount} QUESTIONS
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F4B342', marginBottom: '0.5rem' }}>
                    {quiz.title}
                  </h3>

                  <p style={{ fontSize: '0.92rem', color: '#F4B342', opacity: 0.9, marginBottom: '1.5rem' }}>
                    {quiz.description}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '2px dashed #8F0177', paddingTop: '1rem' }}>
                  <span className="font-arcade" style={{ fontSize: '1.15rem', color: '#DE1A58' }}>
                    DIFF: {quiz.difficulty?.toUpperCase() || 'MEDIUM'}
                  </span>

                  <button
                    type="button"
                    className="retro-btn retro-btn-gold"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.95rem' }}
                    onClick={() => handleStartQuiz(quiz.slug || quiz.id)}
                  >
                    PLAY NOW ▶
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
