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

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    
    const whereClause = vehicleId ? { fuelType: 'FULL', vehicleId, userId: user.id } : { fuelType: 'FULL', userId: user.id };
    
    const entries = await db.fuelEntry.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching full entries:', error);
    return NextResponse.json({ error: 'Failed to fetch full entries' }, { status: 500 });
  }
}