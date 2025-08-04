import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const securityQuestions = await db.securityQuestion.findMany({
      where: { userId: payload.id },
      select: {
        question: true
      }
    });

    return NextResponse.json({ securityQuestions });

  } catch (error) {
    console.error('Get user security questions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}