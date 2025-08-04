import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    const vehicle = await db.vehicle.findUnique({
      where: { id: params.id },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicle' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    const body = await request.json();
    const { name, make, model, year, licensePlate, color, isActive } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Vehicle name is required' },
        { status: 400 }
      );
    }

    const vehicle = await db.vehicle.update({
      where: { id: params.id },
      data: {
        name: name.trim(),
        make: make?.trim() || null,
        model: model?.trim() || null,
        year: year || null,
        licensePlate: licensePlate?.trim() || null,
        color: color?.trim() || null,
        isActive: isActive !== undefined ? isActive : true,
      }
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    // Check if vehicle has fuel entries
    const fuelEntriesCount = await db.fuelEntry.count({
      where: { vehicleId: params.id }
    });

    if (fuelEntriesCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete vehicle with existing fuel entries. Deactivate it instead.' },
        { status: 400 }
      );
    }

    await db.vehicle.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { error: 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}
