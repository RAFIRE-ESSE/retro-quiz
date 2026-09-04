'use client';

import React from 'react';
import { RetroTrophyIcon } from '@/components/RetroIcons';

export default function LeaderboardLoading() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}
    >
      <div
        className="retro-card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '2.5rem 2rem',
          backgroundColor: 'var(--color-cream)',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }} className="animate-pulse-retro">
          <RetroTrophyIcon size={64} />
        </div>

        <div style={{ display: 'inline-block', transform: 'rotate(-2deg)', marginBottom: '0.75rem' }}>
          <span className="retro-sticker sticker-plum" style={{ fontSize: '0.95rem' }}>
            ★ MS SQL DATABASE QUERY ★
          </span>
        </div>

        <h2
          className="font-arcade"
          style={{
            fontSize: '2.2rem',
            color: 'var(--color-plum)',
            letterSpacing: '0.04em',
            marginBottom: '1rem'
          }}
        >
          LOADING HALL OF FAME...
        </h2>

        <div
          style={{
            backgroundColor: '#210d15',
            border: '2.5px solid var(--border-main)',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          <div
            className="font-arcade"
            style={{
              color: 'var(--color-teal)',
              fontSize: '1.4rem',
              letterSpacing: '0.12em'
            }}
          >
            SELECT TOP SCORES ■■■■■■■■■■□□
          </div>
        </div>

        <p
          className="font-arcade"
          style={{
            color: 'var(--color-rose)',
            fontSize: '1.15rem'
          }}
        >
          CONNECTING TO MS SQL • FETCHING HIGH SCORES
        </p>
      </div>
    </div>
  );
}
