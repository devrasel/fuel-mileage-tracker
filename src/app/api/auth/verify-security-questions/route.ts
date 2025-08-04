import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { z } from 'zod';

const verifyQuestionsSchema = z.object({
  email: z.string().email(),
  answers: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1)
  })).min(1)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verifyQuestionsSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email, answers } = validatedData.data;

    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const securityQuestions = await db.securityQuestion.findMany({
      where: { userId: user.id }
    });

    if (securityQuestions.length === 0) {
      return NextResponse.json({ error: 'No security questions set for this user' }, { status: 400 });
    }

    if (securityQuestions.length !== answers.length) {
      return NextResponse.json({ error: 'Incorrect number of answers' }, { status: 400 });
    }

    const isVerified = securityQuestions.every(sq => {
      const answer = answers.find(a => a.question === sq.question);
      return answer && verifyPassword(answer.answer, sq.answerHash);
    });

    if (!isVerified) {
      return NextResponse.json({ error: 'Incorrect answers' }, { status: 401 });
    }

    // If verified, we can generate a temporary token for password reset
    // For now, we'll just return a success message
    return NextResponse.json({ message: 'Security questions verified successfully' });

  } catch (error) {
    console.error('Verify security questions error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}