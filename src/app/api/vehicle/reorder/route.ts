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

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { vehicleIds } = body;

    if (!vehicleIds || !Array.isArray(vehicleIds)) {
      return NextResponse.json(
        { error: 'Vehicle IDs array is required' },
        { status: 400 }
      );
    }

    // Verify all vehicles belong to the user
    const vehicles = await db.vehicle.findMany({
      where: {
        id: { in: vehicleIds },
        userId: user.id
      }
    });

    if (vehicles.length !== vehicleIds.length) {
      return NextResponse.json(
        { error: 'One or more vehicles not found or do not belong to the user' },
        { status: 400 }
      );
    }

    // Update display order for each vehicle
    const updates = vehicleIds.map((id, index) => 
      db.vehicle.update({
        where: { id },
        data: { displayOrder: index }
      })
    );

    await db.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to reorder vehicles' },
      { status: 500 }
    );
  }
}