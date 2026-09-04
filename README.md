# 🕹️ Retro Vintage Quiz Arcade

An authentic early 1980s & 1990s retro-vintage quiz arcade website built with **Next.js 14 (App Router)**, **TypeScript**, and **Neon Serverless PostgreSQL** (with Microsoft SQL Server compatibility), deployed to **Vercel** via GitHub.

🌐 **Live URL**: [https://retro-quiz-ivory.vercel.app/](https://retro-quiz-ivory.vercel.app/)

---

## 🎨 Strict 4-Color Retro Palette

The UI strictly adheres to a four-color arcade palette:
- **`#360185`** (Deep Indigo / Midnight Violet) — Primary background, headers, cards, and deep shadows.
- **`#8F0177`** (Bordeaux Plum / Magenta) — Secondary backgrounds, rationale boxes, option buttons.
- **`#DE1A58`** (Crimson Rose) — Badges, warning cards, high score stickers, incorrect highlights.
- **`#F4B342`** (Warm Amber / Vintage Gold) — Primary readable text, correct answers, trophies, buttons.

### Visual & Sound Design
- **Web Audio API Sound Synthesizer**: Procedural 8-bit coin drop, chimes, buzzers, and victory fanfare (0 external audio files).
- **CRT Scanlines Mode**: Toggleable 1980s cathode-ray tube screen lines.
- **Pixel Offset Shadows**: Hard `4px 4px 0px` drop shadows.

---

## 🚀 Game Engine & Modes

1. 🕹️ **Standard Arcade**: 15s timer per question, streak multipliers (1.2x – 2.0x), and speed bonuses.
2. ⚡ **Time Attack Blitz**: 60s global clock. +3s for correct answers, -2s penalty for mistakes!
3. ☕ **Relaxed Practice**: Untimed with instant historical rationales after every choice.
4. 💀 **Sudden Death**: 1 wrong answer triggers instant game over!

---

## 🗄️ Backend & Cloud Database Architecture

- **Backend Runtime**: Next.js 14 Route Handlers (`app/api/*`) running serverless on Vercel.
- **Primary Database**: **Neon Serverless PostgreSQL** connected over `@neondatabase/serverless` HTTP transport.
- **Auto-Initialization**: Tables (`quizzes`, `questions`, `scores`) and default cartridges are auto-created on first connect.
- **Full Documentation**: See [**ARCHITECTURE.md**](./ARCHITECTURE.md) for detailed diagrams, scoring formulas, and API specs.

---

## 💻 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/RAFIRE-ESSE/retro-quiz.git
   cd retro-quiz
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local` and add your database URL:
   ```env
   DATABASE_URL=postgresql://user:password@your-neon-host.neon.tech/neondb?sslmode=require
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## 🕹️ Keyboard Controls
- **1, 2, 3, 4** or **A, B, C, D**: Select option
- **Enter / Space**: Advance question (Practice Mode)
