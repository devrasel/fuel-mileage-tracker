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

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { date, odometer, totalCost, costPerLiter, liters, fuelType, parentEntry, location, notes, vehicleId } = body;

    // Validate required fields
    if (!date || !odometer || !totalCost || !costPerLiter || !liters || !fuelType || !vehicleId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate numeric values
    if (odometer <= 0 || totalCost <= 0 || costPerLiter <= 0 || liters <= 0) {
      return NextResponse.json({ error: 'All numeric values must be positive' }, { status: 400 });
    }

    // Validate partial entry requirements
    if (fuelType === 'PARTIAL' && !parentEntry) {
      return NextResponse.json({ error: 'Partial entries require a parent entry' }, { status: 400 });
    }

    // Check if vehicle exists and belongs to user
    const vehicle = await db.vehicle.findFirst({
      where: { id: vehicleId, userId: user.id }
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Check if the fuel entry exists and belongs to the user
    const existingEntry = await db.fuelEntry.findFirst({
      where: { id, userId: user.id }
    });

    if (!existingEntry) {
      return NextResponse.json({ error: 'Fuel entry not found' }, { status: 404 });
    }

    const fuelEntry = await db.fuelEntry.update({
      where: { id },
      data: {
        date: new Date(date),
        odometer: parseFloat(odometer),
        totalCost: parseFloat(totalCost),
        costPerLiter: parseFloat(costPerLiter),
        liters: parseFloat(liters),
        fuelType: fuelType,
        parentEntry: parentEntry || null,
        location: location || null,
        notes: notes || null,
        vehicleId: vehicleId
      },
      include: {
        partials: true,
        parent: true,
        vehicle: true
      }
    });

    return NextResponse.json(fuelEntry);
  } catch (error) {
    console.error('Error updating fuel entry:', error);
    return NextResponse.json({ error: 'Failed to update fuel entry' }, { status: 500 });
  }
}