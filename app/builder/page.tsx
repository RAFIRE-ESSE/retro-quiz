'use client';

import React, { useState, useRef } from 'react';
import { retroSound } from '@/lib/sound';

interface QuestionDraft {
  questionText: string;
  codeSnippet: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

export default function QuizBuilderPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('retro-custom');
  const [icon, setIcon] = useState('🕹️');
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      questionText: '',
      codeSnippet: '',
      options: ['', '', '', ''],
      correctOption: 0,
      explanation: ''
    }
  ]);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddQuestion = () => {
    retroSound.playClick();
    setQuestions(prev => [
      ...prev,
      {
        questionText: '',
        codeSnippet: '',
        options: ['', '', '', ''],
        correctOption: 0,
        explanation: ''
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('A cartridge must contain at least 1 question!');
      return;
    }
    retroSound.playClick();
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuestionFieldChange = (index: number, field: keyof QuestionDraft, val: any) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, val: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      const opts = [...copy[qIndex].options];
      opts[optIndex] = val;
      copy[qIndex] = { ...copy[qIndex], options: opts };
      return copy;
    });
  };

  const validate = (): string | null => {
    if (!title.trim()) return 'Please enter a Cartridge Title.';
    if (questions.length === 0) return 'Add at least one question.';

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) return `Question #${i + 1} text is empty.`;
      for (let o = 0; o < 4; o++) {
        if (!q.options[o].trim()) return `Question #${i + 1}, Option ${String.fromCharCode(65 + o)} is empty.`;
      }
    }
    return null;
  };

  const handleSaveToDatabase = async () => {
    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    setSaving(true);
    setStatusMsg(null);
    retroSound.playClick();

    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || 'User created custom cartridge',
          category,
          icon,
          questions
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        retroSound.playFanfare();
        setStatusMsg({ text: '★ Cartridge successfully etched into MS SQL Server Database! ★', type: 'success' });
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setStatusMsg({ text: data.error || 'Failed to save cartridge.', type: 'error' });
      }
    } catch (e: any) {
      setStatusMsg({ text: e.message || 'Network error saving cartridge.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleExportJSON = () => {
    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    retroSound.playClick();
    const payload = {
      title,
      description,
      category,
      icon,
      questions
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    const safeTitle = (title || 'cartridge').replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${safeTitle}_quiz.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.title || !Array.isArray(parsed.questions)) {
          alert('Invalid cartridge format: Must contain title and questions array.');
          return;
        }

        setTitle(parsed.title || '');
        setDescription(parsed.description || '');
        setCategory(parsed.category || 'retro-custom');
        setIcon(parsed.icon || '🕹️');
        setQuestions(parsed.questions.map((q: any) => ({
          questionText: q.questionText || '',
          codeSnippet: q.codeSnippet || '',
          options: q.options || ['', '', '', ''],
          correctOption: typeof q.correctOption === 'number' ? q.correctOption : 0,
          explanation: q.explanation || ''
        })));

        retroSound.playCoin();
        alert(`Successfully imported "${parsed.title}"!`);
      } catch (err: any) {
        alert('Error parsing JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Marquee Header - Strict 4 Colors */}
      <div
        className="retro-card"
        style={{
          padding: '2rem 1.5rem',
          textAlign: 'center',
          marginBottom: '2rem',
          backgroundColor: '#360185',
          borderColor: '#8F0177',
          boxShadow: '6px 6px 0px #DE1A58',
          color: '#F4B342'
        }}
      >
        <div style={{ display: 'inline-block', transform: 'rotate(-2deg)', marginBottom: '0.75rem' }}>
          <span
            className="retro-sticker"
            style={{
              backgroundColor: '#DE1A58',
              color: '#F4B342',
              borderColor: '#F4B342'
            }}
          >
            ★ CARTRIDGE LABORATORY ★
          </span>
        </div>

        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#F4B342', marginBottom: '0.5rem' }}>
          CUSTOM QUIZ CREATOR
        </h1>

        <p style={{ color: '#F4B342', fontSize: '1.05rem', fontWeight: 600, opacity: 0.95 }}>
          Craft your own trivia cartridge. Commit to MS SQL Server or export to JSON to share with friends.
        </p>
      </div>

      {statusMsg && (
        <div
          className="retro-card"
          style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            backgroundColor: statusMsg.type === 'success' ? '#8F0177' : '#DE1A58',
            borderColor: '#F4B342',
            color: '#F4B342',
            fontWeight: 'bold',
            textAlign: 'center'
          }}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Cartridge Info Card */}
      <div
        className="retro-card"
        style={{
          padding: '1.75rem',
          marginBottom: '2rem',
          backgroundColor: '#360185',
          borderColor: '#8F0177',
          boxShadow: '6px 6px 0px #DE1A58',
          color: '#F4B342'
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F4B342', marginBottom: '1.25rem' }}>
          1. CARTRIDGE DETAILS
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#F4B342', marginBottom: '0.35rem' }}>
              Cartridge Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 1990s Super Nintendo Classics"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2.5px solid #F4B342',
                borderRadius: '6px',
                fontSize: '1rem',
                backgroundColor: '#8F0177',
                color: '#F4B342',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#F4B342', marginBottom: '0.35rem' }}>
              Icon
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2.5px solid #F4B342',
                borderRadius: '6px',
                fontSize: '1.2rem',
                textAlign: 'center',
                backgroundColor: '#8F0177',
                color: '#F4B342',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#F4B342', marginBottom: '0.35rem' }}>
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description of this quiz topic..."
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2.5px solid #F4B342',
              borderRadius: '6px',
              fontSize: '0.95rem',
              backgroundColor: '#8F0177',
              color: '#F4B342',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Questions List */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#360185' }}>
            2. QUESTIONS ({questions.length})
          </h2>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {/* Hidden JSON File Input */}
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImportJSON}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="retro-btn retro-btn-gold"
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
              onClick={() => fileInputRef.current?.click()}
            >
              📥 Import JSON
            </button>
            <button
              type="button"
              className="retro-btn retro-btn-gold"
              style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
              onClick={handleExportJSON}
            >
              📤 Export JSON
            </button>
          </div>
        </div>

        {questions.map((q, qIdx) => (
          <div
            key={qIdx}
            className="retro-card"
            style={{
              padding: '1.75rem',
              marginBottom: '1.5rem',
              backgroundColor: '#360185',
              borderColor: '#8F0177',
              boxShadow: '4px 4px 0px #DE1A58',
              color: '#F4B342'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span
                className="retro-sticker"
                style={{
                  fontSize: '0.85rem',
                  backgroundColor: '#8F0177',
                  color: '#F4B342',
                  borderColor: '#F4B342'
                }}
              >
                QUESTION #{qIdx + 1}
              </span>
              <button
                type="button"
                className="retro-btn"
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.8rem',
                  backgroundColor: '#DE1A58',
                  color: '#F4B342',
                  borderColor: '#F4B342'
                }}
                onClick={() => handleRemoveQuestion(qIdx)}
              >
                ✕ Remove
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#F4B342', marginBottom: '0.35rem' }}>
                Question Text
              </label>
              <input
                type="text"
                value={q.questionText}
                onChange={(e) => handleQuestionFieldChange(qIdx, 'questionText', e.target.value)}
                placeholder="Type your trivia question here..."
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  border: '2px solid #F4B342',
                  borderRadius: '6px',
                  backgroundColor: '#8F0177',
                  color: '#F4B342',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#F4B342', marginBottom: '0.35rem' }}>
                Optional Code Snippet or ASCII Art
              </label>
              <textarea
                value={q.codeSnippet}
                onChange={(e) => handleQuestionFieldChange(qIdx, 'codeSnippet', e.target.value)}
                placeholder="SELECT * FROM Table..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  border: '2px solid #DE1A58',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  backgroundColor: '#360185',
                  color: '#F4B342',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#F4B342', marginBottom: '0.35rem' }}>
                Options (Select Radio Button for Correct Answer)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
                {[0, 1, 2, 3].map((optIdx) => (
                  <div
                    key={optIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: q.correctOption === optIdx ? '#DE1A58' : '#8F0177',
                      border: '2px solid #F4B342',
                      borderRadius: '6px',
                      padding: '0.4rem 0.65rem',
                      color: '#F4B342'
                    }}
                  >
                    <input
                      type="radio"
                      name={`correct_${qIdx}`}
                      checked={q.correctOption === optIdx}
                      onChange={() => handleQuestionFieldChange(qIdx, 'correctOption', optIdx)}
                      style={{ accentColor: '#F4B342', width: '18px', height: '18px' }}
                    />
                    <span style={{ fontWeight: 800, color: '#F4B342' }}>
                      {String.fromCharCode(65 + optIdx)}:
                    </span>
                    <input
                      type="text"
                      value={q.options[optIdx]}
                      onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                      style={{
                        flexGrow: 1,
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: '0.95rem',
                        color: '#F4B342'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: '#F4B342', marginBottom: '0.35rem' }}>
                Historical Rationale / Explanation
              </label>
              <input
                type="text"
                value={q.explanation}
                onChange={(e) => handleQuestionFieldChange(qIdx, 'explanation', e.target.value)}
                placeholder="Explain why this answer is historically or technically correct..."
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  border: '2px solid #F4B342',
                  borderRadius: '6px',
                  backgroundColor: '#8F0177',
                  color: '#F4B342',
                  outline: 'none',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          className="retro-btn retro-btn-gold"
          style={{ width: '100%', padding: '0.85rem' }}
          onClick={handleAddQuestion}
        >
          + ADD ANOTHER QUESTION
        </button>
      </div>

      {/* Save & Submit */}
      <div
        className="retro-card"
        style={{
          padding: '1.75rem',
          textAlign: 'center',
          backgroundColor: '#360185',
          borderColor: '#8F0177',
          boxShadow: '6px 6px 0px #DE1A58'
        }}
      >
        <button
          type="button"
          disabled={saving}
          className="retro-btn retro-btn-gold"
          style={{ padding: '0.85rem 2rem', fontSize: '1.15rem' }}
          onClick={handleSaveToDatabase}
        >
          {saving ? 'ETCHING INTO MS SQL...' : '💾 SAVE CARTRIDGE TO MS SQL DATABASE'}
        </button>
      </div>
    </div>
  );
}
