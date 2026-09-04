'use client';

import React from 'react';
import { RetroJoystickIcon } from '@/components/RetroIcons';

export default function QuizLoading() {
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
          <RetroJoystickIcon size={64} />
        </div>

        <div style={{ display: 'inline-block', transform: 'rotate(-2deg)', marginBottom: '0.75rem' }}>
          <span className="retro-sticker sticker-teal" style={{ fontSize: '0.95rem' }}>
            ★ CARTRIDGE ENGAGED ★
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
          INSERTING CARTRIDGE...
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
            SHUFFLING QUESTIONS ■■■■■■■■□□
          </div>
        </div>

        <p
          className="font-arcade"
          style={{
            color: 'var(--color-rose)',
            fontSize: '1.15rem'
          }}
        >
          GET READY • PLAYER 1 READY
        </p>
      </div>
    </div>
  );
}
