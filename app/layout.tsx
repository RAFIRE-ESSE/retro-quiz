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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);
  const [crtActive, setCrtActive] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; mode: string } | null>(null);

  useEffect(() => {
    setIsMuted(retroSound.getMuted());
    const savedCrt = localStorage.getItem('retro_crt') === 'true';
    setCrtActive(savedCrt);
    if (savedCrt) {
      document.body.classList.add('crt-active');
    }

    // Check MS SQL Health
    fetch('/api/health')
      .then(r => r.json())
      .then(data => {
        if (data?.database) {
          setDbStatus({
            connected: data.database.connected,
            mode: data.database.mode
          });
        }
      })
      .catch(() => {
        setDbStatus({ connected: false, mode: 'offline_fallback' });
      });
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
              {/* MS SQL Database Status Pill */}
              <div
                className="retro-sticker"
                style={{
                  fontSize: '0.95rem',
                  backgroundColor: dbStatus?.connected ? 'var(--color-teal)' : '#f3e8ff',
                  borderColor: 'var(--color-plum)',
                  color: 'var(--color-plum)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  cursor: 'help'
                }}
                title={dbStatus?.connected ? 'Live Microsoft SQL Server Connected' : 'Running on Resilient Offline Hybrid Fallback'}
              >
                <span>{dbStatus?.connected ? '🟢 MS SQL: LIVE' : '🟡 MS SQL: HYBRID'}</span>
              </div>

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

          {/* Retro Vintage Footer with Palette Badges */}
          <footer style={{ marginTop: '4rem', textAlign: 'center', borderTop: '2px dashed var(--color-plum)', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ width: '28px', height: '28px', backgroundColor: '#934761', border: '2px solid #3b1422', borderRadius: '4px' }} title="#934761 (Deep Plum)" />
              <div style={{ width: '28px', height: '28px', backgroundColor: '#AD5C71', border: '2px solid #3b1422', borderRadius: '4px' }} title="#AD5C71 (Muted Rose)" />
              <div style={{ width: '28px', height: '28px', backgroundColor: '#72BAA9', border: '2px solid #3b1422', borderRadius: '4px' }} title="#72BAA9 (Retro Teal)" />
              <div style={{ width: '28px', height: '28px', backgroundColor: '#D5E7B5', border: '2px solid #3b1422', borderRadius: '4px' }} title="#D5E7B5 (Pistachio)" />
            </div>

            <p style={{ fontWeight: 700, color: 'var(--color-plum)', fontSize: '0.95rem' }}>
              RETRO ARCADE QUIZ SYSTEM • POWERED BY NEXT.JS &amp; MICROSOFT SQL SERVER
            </p>
            <p className="font-arcade" style={{ color: 'var(--color-rose)', fontSize: '1.15rem', marginTop: '0.35rem' }}>
              INSERT COIN • 1985-1995 NOSTALGIA ARCHIVE
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
