import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(6, 'Password must be at least 6 characters')
});

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { email, newPassword } = validatedData.data;

    const passwordHash = hashPassword(newPassword);

    await db.user.update({
      where: { email },
      data: { passwordHash }
    });

    return NextResponse.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}