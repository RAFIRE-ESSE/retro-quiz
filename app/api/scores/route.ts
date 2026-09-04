import { NextResponse } from 'next/server';
import { getTopScores, recordScore } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '25', 10);
    const scores = await getTopScores(limit);
    return NextResponse.json({ scores });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.quizId || !body.gamerTag || typeof body.score !== 'number') {
      return NextResponse.json({ error: 'Missing required score fields: quizId, gamerTag, score' }, { status: 400 });
    }

    const saved = await recordScore({
      quizId: Number(body.quizId),
      quizTitle: body.quizTitle,
      gamerTag: String(body.gamerTag),
      score: Number(body.score),
      accuracy: Number(body.accuracy || 0),
      maxStreak: Number(body.maxStreak || 0),
      gameMode: body.gameMode || 'standard',
      timeSpentSeconds: Number(body.timeSpentSeconds || 0)
    });

    return NextResponse.json({ success: true, score: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to record score' }, { status: 500 });
  }
}
