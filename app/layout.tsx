'use client';

import React, { useState, useEffect } from 'react';
import './globals.css';
import { retroSound } from '@/lib/sound';
import {
  RetroArcadeLogo,
  RetroTrophyIcon,
  RetroPencilIcon,
  RetroSpeakerIcon,
  RetroMuteIcon
} from '@/components/RetroIcons';
import { RetroTransitionProvider } from '@/components/RetroTransition';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(retroSound.getMuted());
    // Clear any previous CRT scanlines overlay to prevent color darkening
    localStorage.removeItem('retro_crt');
    document.body.classList.remove('crt-active');

    // Force runtime anti-dimming and anti-inversion on document elements
    try {
      document.documentElement.style.setProperty('color-scheme', 'only light', 'important');
      document.documentElement.style.setProperty('forced-color-adjust', 'none', 'important');
      document.documentElement.style.setProperty('filter', 'none', 'important');
      document.body.style.setProperty('color-scheme', 'only light', 'important');
      document.body.style.setProperty('forced-color-adjust', 'none', 'important');
      document.body.style.setProperty('filter', 'none', 'important');
    } catch {
      // Ignore
    }
  }, []);

  const handleToggleSound = () => {
    const muted = retroSound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <html lang="en" style={{ colorScheme: 'only light' }}>
      <head>
        <title>RETRO QUIZ ARCADE — 80s/90s Vintage Edition</title>
        <meta name="description" content="A nostalgic 80s & 90s retro-vintage quiz website powered by Next.js and Microsoft SQL Server." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Strict Light-Only Enforcement across all browsers & OS engines */}
        <meta name="color-scheme" content="only light" />
        <meta name="supported-color-schemes" content="light" />
        <meta name="theme-color" content="#F4B342" />
        {/* Opt out of third-party Dark Reader extension auto-dimming */}
        <meta name="darkreader-lock" content="true" />
        {/* Disable mobile browser night mode alterations */}
        <meta name="nightmode" content="disable" />
      </head>
      <body style={{ colorScheme: 'only light' }}>
        <RetroTransitionProvider>
          <div className="arcade-container">
            {/* Header Bar - Strict 4-color styling: #360185 bg, #8F0177 border, #F4B342 text, #DE1A58 accent */}
            <header
              className="retro-card"
              style={{
                backgroundColor: '#360185',
                borderColor: '#8F0177',
                boxShadow: '4px 4px 0px #DE1A58',
                padding: '0.9rem 1.25rem',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'inherit' }} onClick={() => retroSound.playCoin()}>
                <RetroArcadeLogo size={52} />
                <div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#F4B342', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    RETRO QUIZ
                  </div>
                  <div className="font-arcade" style={{ fontSize: '1.15rem', color: '#DE1A58' }}>
                    ★ VINTAGE ARCADE EDITION ★
                  </div>
                </div>
              </a>

              {/* Navigation & Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <a href="/leaderboard" className="retro-btn retro-btn-gold" style={{ padding: '0.45rem 0.85rem', fontSize: '0.9rem' }} onClick={() => retroSound.playClick()}>
                  <RetroTrophyIcon size={18} />
                  <span>Scores</span>
                </a>

                <a href="/builder" className="retro-btn retro-btn-magenta" style={{ padding: '0.45rem 0.85rem', fontSize: '0.9rem' }} onClick={() => retroSound.playClick()}>
                  <RetroPencilIcon size={18} />
                  <span>Creator</span>
                </a>

                {/* Sound Toggle */}
                <button
                  type="button"
                  className="retro-btn retro-btn-crimson"
                  style={{ padding: '0.45rem 0.65rem' }}
                  onClick={handleToggleSound}
                  title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                  aria-label="Toggle sound"
                >
                  {isMuted ? <RetroMuteIcon size={20} /> : <RetroSpeakerIcon size={20} />}
                </button>
              </div>
            </header>

            {/* Main View Outlet */}
            <main>{children}</main>

            {/* Redesigned Retro Arcade Footer Card - Strict 4-color styling */}
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
                  backgroundColor: '#360185',
                  borderColor: '#8F0177',
                  boxShadow: '4px 4px 0px #DE1A58',
                  color: '#F4B342'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <RetroArcadeLogo size={36} />
                  <div>
                    <div style={{ fontWeight: 800, color: '#F4B342', fontSize: '1.05rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
                      RETRO QUIZ ARCADE
                    </div>
                    <div className="font-arcade" style={{ color: '#DE1A58', fontSize: '0.95rem' }}>
                      1985-1995 VINTAGE NOSTALGIA ARCHIVE
                    </div>
                  </div>
                </div>

                <div className="font-arcade" style={{ color: '#F4B342', fontSize: '1.25rem', textAlign: 'center' }}>
                  ★ INSERT COIN • POWERED BY NEXT.JS &amp; MICROSOFT SQL SERVER ★
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <a href="/" className="retro-btn retro-btn-gold" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                    Arcade
                  </a>
                  <a href="/leaderboard" className="retro-btn retro-btn-crimson" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
                    Scores
                  </a>
                  <a href="/builder" className="retro-btn retro-btn-magenta" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}>
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
