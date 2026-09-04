'use client';

import React, { useEffect, useState, createContext, useContext, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { RetroFloppyIcon } from './RetroIcons';

interface TransitionContextType {
  isNavigating: boolean;
  startTransition: (message?: string) => void;
}

const TransitionContext = createContext<TransitionContextType>({
  isNavigating: false,
  startTransition: () => {}
});

export const useRetroTransition = () => useContext(TransitionContext);

function TransitionWatcher({
  onRouteComplete
}: {
  onRouteComplete: () => void;
}) {
  const pathname = usePathname();

  useEffect(() => {
    onRouteComplete();
  }, [pathname, onRouteComplete]);

  return null;
}

export function RetroTransitionProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [customMsg, setCustomMsg] = useState('INSERTING CARTRIDGE...');
  const [progress, setProgress] = useState(0);

  const handleRouteComplete = React.useCallback(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setIsNavigating(false);
      setProgress(0);
    }, 280);
    return () => clearTimeout(timer);
  }, []);

  // Intercept all internal <a> link clicks
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('/#')) {
        setCustomMsg(
          href.includes('quiz')
            ? 'INSERTING CARTRIDGE...'
            : href.includes('leaderboard')
            ? 'QUERYING MS SQL DATABASE...'
            : href.includes('builder')
            ? 'OPENING CARTRIDGE LAB...'
            : 'RETURNING TO ARCADE...'
        );
        setIsNavigating(true);
        setProgress(35);
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => document.removeEventListener('click', handleAnchorClick, { capture: true });
  }, []);

  // Progress simulation animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isNavigating && progress < 85) {
      interval = setInterval(() => {
        setProgress(p => Math.min(85, p + Math.floor(Math.random() * 15 + 10)));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isNavigating, progress]);

  return (
    <TransitionContext.Provider
      value={{
        isNavigating,
        startTransition: (msg) => {
          if (msg) setCustomMsg(msg);
          setIsNavigating(true);
          setProgress(40);
        }
      }}
    >
      <Suspense fallback={null}>
        <TransitionWatcher onRouteComplete={handleRouteComplete} />
      </Suspense>

      {/* Top Retro Progress Scan Bar */}
      {isNavigating && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: `${progress}%`,
            height: '5px',
            backgroundColor: '#DE1A58',
            boxShadow: '0 0 10px #DE1A58',
            zIndex: 99999,
            transition: 'width 0.2s ease-out'
          }}
        />
      )}

      {/* Retro Arcade Loading Overlay */}
      {isNavigating && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#360185e6',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99998,
            animation: 'fadeIn 0.15s ease forwards'
          }}
        >
          <div
            className="retro-card"
            style={{
              padding: '2rem 2.5rem',
              textAlign: 'center',
              backgroundColor: '#360185',
              borderColor: '#8F0177',
              maxWidth: '420px',
              width: '90%',
              boxShadow: '8px 8px 0px #DE1A58'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }} className="animate-pulse-retro">
              <RetroFloppyIcon size={52} />
            </div>

            <div style={{ display: 'inline-block', transform: 'rotate(-2deg)', marginBottom: '0.75rem' }}>
              <span
                className="retro-sticker"
                style={{
                  fontSize: '0.9rem',
                  backgroundColor: '#DE1A58',
                  color: '#F4B342',
                  borderColor: '#F4B342'
                }}
              >
                ★ SWITCHING CARTRIDGE ★
              </span>
            </div>

            <h3
              className="font-arcade"
              style={{
                fontSize: '1.8rem',
                color: '#F4B342',
                letterSpacing: '0.04em',
                marginBottom: '0.85rem'
              }}
            >
              {customMsg}
            </h3>

            {/* Block progress indicator */}
            <div
              style={{
                backgroundColor: '#8F0177',
                border: '2px solid #DE1A58',
                borderRadius: '4px',
                padding: '0.5rem',
                color: '#F4B342',
                fontSize: '1.2rem',
                fontFamily: 'var(--font-retro)',
                letterSpacing: '0.12em'
              }}
            >
              {progress < 40 ? '■■■□□□□□□□' : progress < 70 ? '■■■■■■□□□□' : '■■■■■■■■■■'} {progress}%
            </div>
          </div>
        </div>
      )}

      {children}
    </TransitionContext.Provider>
  );
}
