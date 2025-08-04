import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken, hashPassword } from '@/lib/auth';
import { z } from 'zod';

const setQuestionsSchema = z.object({
  questions: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1)
  })).min(1)
});

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = setQuestionsSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { questions } = validatedData.data;

    await db.$transaction(async (db) => {
      await db.securityQuestion.deleteMany({
        where: { userId: payload.id }
      });

      await db.securityQuestion.createMany({
        data: questions.map(q => ({
          question: q.question,
          answerHash: hashPassword(q.answer),
          userId: payload.id
        }))
      });
    });

    return NextResponse.json({ message: 'Security questions set successfully' });

  } catch (error) {
    console.error('Set security questions error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}