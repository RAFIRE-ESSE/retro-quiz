'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';
import { retroSound } from '@/lib/sound';
import {
  RetroArcadeLogo,
  RetroTrophyIcon,
  RetroPencilIcon,
  RetroSpeakerIcon,
  RetroMuteIcon,
  RetroCrtTvIcon
} from '@/components/RetroIcons';
import { RetroTransitionProvider } from '@/components/RetroTransition';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const [crtActive, setCrtActive] = useState(false);

  useEffect(() => {
    setIsMuted(retroSound.getMuted());
    const savedCrt = localStorage.getItem('retro_crt') === 'true';
    setCrtActive(savedCrt);
    if (savedCrt) {
      document.body.classList.add('crt-active');
    }
  }, []);

  const handleToggleSound = () => {
    const muted = retroSound.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleCrt = () => {
    const next = !crtActive;
    setCrtActive(next);
    localStorage.setItem('retro_crt', String(next));
    if (next) {
      document.body.classList.add('crt-active');
      retroSound.playClick();
    } else {
      document.body.classList.remove('crt-active');
      retroSound.playClick();
    }
  };

  return (
    <html lang="en">
      <head>
        <title>RETRO QUIZ ARCADE — 80s/90s Vintage Edition</title>
        <meta name="description" content="A nostalgic 80s & 90s retro-vintage quiz website powered by Next.js and Microsoft SQL Server." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <RetroTransitionProvider>
          <div className="arcade-container">
            {/* Header Bar */}
            <header className="retro-card" style={{ padding: '0.9rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'inherit' }} onClick={() => retroSound.playCoin()}>
                <RetroArcadeLogo size={52} />
                <div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-plum)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    RETRO QUIZ
                  </div>
                  <div className="font-arcade" style={{ fontSize: '1.15rem', color: 'var(--color-rose)' }}>
                    ★ VINTAGE ARCADE EDITION ★
                  </div>
                </div>
              </a>

              {/* Navigation & Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <a href="/leaderboard" className="retro-btn retro-btn-cream" style={{ padding: '0.45rem 0.85rem', fontSize: '0.9rem' }} onClick={() => retroSound.playClick()}>
                  <RetroTrophyIcon size={18} />
                  <span>Scores</span>
                </a>

                <a href="/builder" className="retro-btn retro-btn-rose" style={{ padding: '0.45rem 0.85rem', fontSize: '0.9rem' }} onClick={() => retroSound.playClick()}>
                  <RetroPencilIcon size={18} />
                  <span>Creator</span>
                </a>

                {/* Sound Toggle */}
                <button
                  type="button"
                  className="retro-btn retro-btn-cream"
                  style={{ padding: '0.45rem 0.65rem' }}
                  onClick={handleToggleSound}
                  title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                  aria-label="Toggle sound"
                >
                  {isMuted ? <RetroMuteIcon size={20} /> : <RetroSpeakerIcon size={20} />}
                </button>

                {/* CRT Scanline Toggle */}
                <button
                  type="button"
                  className={`retro-btn ${crtActive ? 'retro-btn-plum' : 'retro-btn-cream'}`}
                  style={{ padding: '0.45rem 0.65rem' }}
                  onClick={handleToggleCrt}
                  title="Toggle CRT Scanlines"
                  aria-label="Toggle CRT mode"
                >
                  <RetroCrtTvIcon size={20} />
                </button>
              </div>
            </header>

            {/* Main View Outlet */}
            <main>{children}</main>

            {/* Redesigned Retro Arcade Footer Card */}
            <footer style={{ marginTop: '4rem' }}>
              <div
                className="retro-card"
                style={{
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  backgroundColor: 'var(--color-cream)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <RetroArcadeLogo size={36} />
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--color-plum)', fontSize: '1.05rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                      RETRO QUIZ ARCADE
                    </div>
                    <div className="font-arcade" style={{ color: 'var(--color-rose)', fontSize: '0.95rem' }}>
                      1985-1995 VINTAGE NOSTALGIA ARCHIVE
                    </div>
                  </div>
                </div>

                <div className="font-arcade" style={{ color: 'var(--color-plum)', fontSize: '1.25rem', textAlign: 'center' }}>
                  ★ INSERT COIN • POWERED BY NEXT.JS &amp; MICROSOFT SQL SERVER ★
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <a href="/" className="retro-btn retro-btn-plum" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                    Arcade
                  </a>
                  <a href="/leaderboard" className="retro-btn retro-btn-teal" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                    Scores
                  </a>
                  <a href="/builder" className="retro-btn retro-btn-rose" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                    Creator
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </RetroTransitionProvider>
      </body>
    </html>
  );
}
