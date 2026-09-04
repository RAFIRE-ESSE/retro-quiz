# 🕹️ Retro Vintage Quiz Arcade (Next.js + Microsoft SQL Server)

An authentic early 1980s & 1990s retro-vintage quiz arcade website built with **Next.js (App Router)**, **TypeScript**, and **Microsoft SQL Server (MS SQL / Azure SQL)**, engineered for 1-click deployment to **Vercel** via GitHub.

---

## 🎨 Retro Vintage Design & Color Palette

Accurately styled with early 1980s/1990s graphic design elements:
- **`#934761`** (Deep Vintage Plum / Bordeaux) — Primary dark accent, borders, drop shadows, and high-contrast typography.
- **`#AD5C71`** (Muted Rose / Mauve) — Secondary accent, badge highlights, and incorrect states.
- **`#72BAA9`** (Retro Teal / Sage Mint) — Tertiary accent, correct answer highlights, timers, and podium badges.
- **`#D5E7B5`** (Pistachio / Vintage Cream) — Primary light background, cards, and warm nostalgic surfaces.

### Aesthetic Features
- **Chunky Retro Cards**: Bold 3.5px solid borders and hard offset drop shadows (`4px 4px 0px #934761`).
- **Grainy Texture**: Subtle analog grain pattern over vintage cream backgrounds.
- **Sticker Badges**: Angled vintage badges (`"★ 100% RETRO ARCADE TRIVIA ★"`, `"MS SQL: LIVE"`).
- **Procedural 8-Bit Audio**: Synthesized arcade coin insert, chimes, buzzers, and victory fanfare using the browser **Web Audio API** (0 external sound files needed).
- **CRT Scanlines Mode**: Optional toggle button to enable 1980s Cathode Ray Tube scanlines.

---

## 🚀 Key Features

1. **4 Arcade Game Modes**:
   - 🕹️ **Standard Arcade**: 15s per-question timer, streak combos, and speed multipliers.
   - ⚡ **Time Attack Blitz**: 60s total clock. +3s for correct answers, -2s penalty for mistakes!
   - ☕ **Relaxed Practice**: Untimed with instant historical rationales after each choice.
   - 💀 **Sudden Death Survival**: 1 wrong answer triggers instant game over!
2. **Microsoft SQL Server Integration**:
   - Direct connection via the official `mssql` (tedious) package.
   - Saves custom cartridges and global high scores.
   - **Resilient Hybrid Fallback**: If MS SQL credentials are not yet configured or temporarily offline, seamlessly runs on pre-seeded offline data so the site **never crashes** and builds cleanly on Vercel out of the box!
3. **Cartridge Creator (Custom Quizzes)**:
   - Build custom quizzes with options, code snippets, and explanations.
   - Save directly to Microsoft SQL Server.
   - Export and Import custom quizzes as `.json` files.
4. **Arcade Gamer Tag Leaderboard**:
   - Global Hall of Fame with Gold, Silver, and Bronze podiums.

---

## 🗄️ Microsoft SQL Server Setup

The database scripts are located in the `database/` directory:

1. **`database/schema.sql`**:
   Creates `Quizzes`, `Questions`, and `Scores` tables, indexes, and the `vw_ArcadeLeaderboard` view.
2. **`database/seed.sql`**:
   Populates default quizzes (Retro Tech, Web Dev, Science, History) and arcade high scores.

### Option A: Azure SQL Database (Cloud)
1. Create a free/serverless Azure SQL Database in the Azure Portal.
2. Set the firewall rule to allow Azure services and your IP.
3. Run `database/schema.sql` and `database/seed.sql` in Azure Query Editor.

### Option B: Local MS SQL Server via Docker
```bash
docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStrong@Passw0rd!" \
   -p 1433:1433 --name mssql-arcade -d \
   mcr.microsoft.com/mssql/server:2022-latest
```

---

## 🌐 Deploying to Vercel via GitHub

1. Push this repository to your **GitHub** account.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"** -> **"Import"** this repo.
3. In **Environment Variables**, add the following (optional if using cloud MS SQL / Azure SQL):
   - `MSSQL_SERVER` = `your-server.database.windows.net`
   - `MSSQL_PORT` = `1433`
   - `MSSQL_DATABASE` = `QuizArcadeDB`
   - `MSSQL_USER` = `your_user`
   - `MSSQL_PASSWORD` = `YourStrong@Passw0rd!`
   - `MSSQL_ENCRYPT` = `true`
   - `MSSQL_TRUST_SERVER_CERTIFICATE` = `true`
4. Click **Deploy**. Vercel will build and launch your retro quiz website in seconds!

---

## 💻 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Production build**:
   ```bash
   npm run build
   npm start
   ```

---

## 🕹️ Keyboard Shortcuts
- **1, 2, 3, 4** or **A, B, C, D**: Select option
- **Enter / Space**: Advance to next question (in Practice Mode)
