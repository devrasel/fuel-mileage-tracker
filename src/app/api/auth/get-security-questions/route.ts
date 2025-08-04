import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const getQuestionsSchema = z.object({
  email: z.string().email()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const validatedData = getQuestionsSchema.safeParse({ email });

    if (!validatedData.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email: validatedData.data.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const securityQuestions = await db.securityQuestion.findMany({
      where: { userId: user.id }
    });

    if (securityQuestions.length === 0) {
      return NextResponse.json({ error: 'No security questions found for this user' }, { status: 404 });
    }

    const questions = securityQuestions.map(sq => ({
      question: sq.question
    }));

    return NextResponse.json({ questions });

  } catch (error) {
    console.error('Get security questions error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}