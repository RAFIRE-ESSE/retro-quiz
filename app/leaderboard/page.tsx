'use client';

import React, { useState, useEffect } from 'react';
import { ScoreRecord } from '@/lib/seedData';
import { retroSound } from '@/lib/sound';
import { RetroTrophyIcon } from '@/components/RetroIcons';

export default function LeaderboardPage() {
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = () => {
    setLoading(true);
    fetch('/api/scores?limit=30')
      .then(res => res.json())
      .then(data => {
        if (data?.scores) {
          setScores(data.scores);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load scores:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchScores();
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Marquee Header */}
      <div className="retro-card" style={{ padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '2rem', backgroundColor: 'var(--color-cream)' }}>
        <div style={{ display: 'inline-block', transform: 'rotate(-2deg)', marginBottom: '0.75rem' }}>
          <span className="retro-sticker sticker-plum">★ MS SQL HALL OF FAME ★</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-plum)', marginBottom: '0.5rem' }}>
          GLOBAL ARCADE LEADERBOARD
        </h1>

        <p style={{ color: 'var(--color-secondary)', fontSize: '1.05rem', fontWeight: 600 }}>
          Top player rankings permanently stored in Microsoft SQL Server Database.
        </p>
      </div>

      {/* Top 3 Podium Highlights */}
      {scores.length >= 3 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {/* #2 Silver */}
          <div className="retro-card" style={{ padding: '1.5rem 1.25rem', textAlign: 'center', backgroundColor: '#e2e8f0', order: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <RetroTrophyIcon size={40} />
            </div>
            <div className="retro-sticker sticker-cream" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              2ND PLACE
            </div>
            <div className="font-arcade" style={{ fontSize: '1.8rem', color: 'var(--color-plum)', fontWeight: 'bold' }}>
              {scores[1].gamerTag}
            </div>
            <div className="font-arcade" style={{ fontSize: '1.4rem', color: 'var(--color-rose)' }}>
              {scores[1].score} PTS
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{scores[1].quizTitle}</div>
          </div>

          {/* #1 Gold */}
          <div className="retro-card" style={{ padding: '1.75rem 1.25rem', textAlign: 'center', backgroundColor: '#fef08a', borderColor: '#b45309', order: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <RetroTrophyIcon size={52} />
            </div>
            <div className="retro-sticker sticker-plum" style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
              ★ GRAND CHAMPION ★
            </div>
            <div className="font-arcade" style={{ fontSize: '2.3rem', color: 'var(--color-plum)', fontWeight: 'bold' }}>
              {scores[0].gamerTag}
            </div>
            <div className="font-arcade" style={{ fontSize: '1.7rem', color: '#b45309' }}>
              {scores[0].score} PTS
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-plum)' }}>{scores[0].quizTitle}</div>
          </div>

          {/* #3 Bronze */}
          <div className="retro-card" style={{ padding: '1.5rem 1.25rem', textAlign: 'center', backgroundColor: '#fed7aa', order: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <RetroTrophyIcon size={40} />
            </div>
            <div className="retro-sticker sticker-rose" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              3RD PLACE
            </div>
            <div className="font-arcade" style={{ fontSize: '1.8rem', color: 'var(--color-plum)', fontWeight: 'bold' }}>
              {scores[2].gamerTag}
            </div>
            <div className="font-arcade" style={{ fontSize: '1.4rem', color: 'var(--color-plum)' }}>
              {scores[2].score} PTS
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{scores[2].quizTitle}</div>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="retro-card" style={{ padding: '1.75rem', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-plum)' }}>
            RECENT TOP RECORDS
          </h2>
          <button
            type="button"
            className="retro-btn retro-btn-cream"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
            onClick={() => {
              retroSound.playClick();
              fetchScores();
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-plum)' }}>
            <span className="font-arcade" style={{ fontSize: '1.8rem' }}>QUERYING MICROSOFT SQL SERVER...</span>
          </div>
        ) : scores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No scores registered yet. Be the first player to enter the arcade hall of fame!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ borderBottom: '2.5px solid var(--border-main)' }}>
                <th style={{ padding: '0.75rem', color: 'var(--color-plum)', fontWeight: 800 }}>RANK</th>
                <th style={{ padding: '0.75rem', color: 'var(--color-plum)', fontWeight: 800 }}>GAMER TAG</th>
                <th style={{ padding: '0.75rem', color: 'var(--color-plum)', fontWeight: 800 }}>SCORE</th>
                <th style={{ padding: '0.75rem', color: 'var(--color-plum)', fontWeight: 800 }}>CARTRIDGE</th>
                <th style={{ padding: '0.75rem', color: 'var(--color-plum)', fontWeight: 800 }}>ACCURACY</th>
                <th style={{ padding: '0.75rem', color: 'var(--color-plum)', fontWeight: 800 }}>MODE</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((sc, idx) => (
                <tr
                  key={sc.id || idx}
                  style={{
                    borderBottom: '1px solid #ebd7be',
                    backgroundColor: idx === 0 ? 'rgba(254, 240, 138, 0.2)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <span className="font-arcade" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <span className="font-arcade" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-plum)' }}>
                      {sc.gamerTag}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <span className="font-arcade" style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--color-rose)' }}>
                      {sc.score}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-secondary)' }}>
                    {sc.quizTitle}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <span className="retro-sticker sticker-teal" style={{ fontSize: '0.85rem' }}>
                      {sc.accuracy}%
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--color-plum)', fontWeight: 600 }}>
                    {sc.gameMode}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <a href="/" className="retro-btn retro-btn-plum">
          ◀ Back to Arcade
        </a>
      </div>
    </div>
  );
}
