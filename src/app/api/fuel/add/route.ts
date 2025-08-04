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
    const { date, odometer, liters, costPerLiter, totalCost, location, notes, vehicleId, fuelType, parentEntry, odometerExtraKm } = body;

    // Validate required fields
    if (!date || !odometer || !liters || !costPerLiter || !totalCost || !vehicleId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate numeric values
    if (odometer <= 0 || liters <= 0 || costPerLiter <= 0 || totalCost <= 0) {
      return NextResponse.json({ error: 'All numeric values must be positive' }, { status: 400 });
    }

    // Check if vehicle exists and belongs to user
    const vehicle = await db.vehicle.findFirst({
      where: { id: vehicleId, userId: user.id }
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Handle odometer extra km for partial entries
    let updatedParentEntry: any = null;  // Changed: Added type annotation
    if (fuelType === 'PARTIAL' && odometerExtraKm && parseFloat(odometerExtraKm) > 0 && parentEntry) {
      // Find the parent entry
      const parentFuelEntry = await db.fuelEntry.findFirst({
        where: { 
          id: parentEntry,
          userId: user.id,
          vehicleId: vehicleId
        }
      });

      if (parentFuelEntry) {
        // Update the parent entry's odometer by adding the extra km
        const extraKm = parseFloat(odometerExtraKm);
        const newOdometer = parentFuelEntry.odometer + extraKm;
        
        updatedParentEntry = await db.fuelEntry.update({
          where: { id: parentEntry },
          data: { odometer: newOdometer }
        });
      }
    }

    const fuelEntry = await db.fuelEntry.create({
      data: {
        date: new Date(date),
        odometer: parseFloat(odometer),
        liters: parseFloat(liters),
        costPerLiter: parseFloat(costPerLiter),
        totalCost: parseFloat(totalCost),
        location: location || null,
        notes: notes || null,
        vehicleId: vehicleId,
        userId: user.id,
        fuelType: fuelType || 'FULL',
        parentEntry: parentEntry || null,
        odometerExtraKm: odometerExtraKm ? parseFloat(odometerExtraKm) : 0
      }
    });

    return NextResponse.json({
      fuelEntry,
      updatedParentEntry
    });
  } catch (error) {
    console.error('Error creating fuel entry:', error);
    return NextResponse.json({ error: 'Failed to create fuel entry' }, { status: 500 });
  }
}
