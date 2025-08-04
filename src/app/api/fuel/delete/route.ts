import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

// Helper function to get user from request
async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  
  const payload = verifyToken(token);
  if (!payload) return null;
  
  return payload;
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing entry ID' }, { status: 400 });
    }

    // Check if the fuel entry exists and belongs to the user
    const existingEntry = await db.fuelEntry.findFirst({
      where: { id, userId: user.id }
    });

    if (!existingEntry) {
      return NextResponse.json({ error: 'Fuel entry not found' }, { status: 404 });
    }

    await db.fuelEntry.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting fuel entry:', error);
    return NextResponse.json({ error: 'Failed to delete fuel entry' }, { status: 500 });
  }
}