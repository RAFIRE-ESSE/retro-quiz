'use client';

import React from 'react';
import { RetroFloppyIcon } from '@/components/RetroIcons';

export default function Loading() {
  return (
    <div
      style={{
        minHeight: '55vh',
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
          maxWidth: '480px',
          width: '100%',
          padding: '2.5rem 2rem',
          backgroundColor: '#360185',
          borderColor: '#8F0177',
          boxShadow: '6px 6px 0px #DE1A58',
          textAlign: 'center'
        }}
      >
        {/* Animated Floppy Disk */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }} className="animate-pulse-retro">
          <RetroFloppyIcon size={64} />
        </div>

        <div style={{ display: 'inline-block', transform: 'rotate(-2deg)', marginBottom: '0.75rem' }}>
          <span
            className="retro-sticker"
            style={{
              fontSize: '0.95rem',
              backgroundColor: '#DE1A58',
              color: '#F4B342',
              borderColor: '#F4B342'
            }}
          >
            ★ DRIVE A: READING CARTRIDGE ★
          </span>
        </div>

        <h2
          className="font-arcade"
          style={{
            fontSize: '2rem',
            color: '#F4B342',
            letterSpacing: '0.05em',
            marginBottom: '1rem'
          }}
        >
          LOADING ARCADE...
        </h2>

        {/* Retro Segmented Loading Blocks */}
        <div
          style={{
            backgroundColor: '#8F0177',
            border: '2.5px solid #DE1A58',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            boxShadow: 'inset 2px 2px 0px #360185'
          }}
        >
          <div
            className="font-arcade"
            style={{
              color: '#F4B342',
              fontSize: '1.4rem',
              letterSpacing: '0.15em'
            }}
          >
            ■■■■■■■■■■□□□□
          </div>
        </div>

        <p
          className="font-arcade"
          style={{
            color: '#DE1A58',
            fontSize: '1.15rem'
          }}
        >
          SEEKING SECTOR 1985 • PLEASE WAIT
        </p>
      </div>
    </div>
  );
}
