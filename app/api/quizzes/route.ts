import { NextResponse } from 'next/server';
import { getAllQuizzes, createNewQuiz } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const quizzes = await getAllQuizzes();
    return NextResponse.json({ quizzes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch quizzes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !Array.isArray(body.questions) || body.questions.length === 0) {
      return NextResponse.json({ error: 'Quiz must have a title and at least one question' }, { status: 400 });
    }

    const created = await createNewQuiz(body);
    return NextResponse.json({ success: true, quiz: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create quiz' }, { status: 500 });
  }
}
