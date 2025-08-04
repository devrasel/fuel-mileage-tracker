import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient({
  log: ['query'],
});

// Helper function to get user from request
async function getUserFromRequest(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) return null;
  
  const payload = verifyToken(token);
  if (!payload) return null;
  
  return payload;
}

// Maintenance Cost API - Fixed version with authentication

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');

    const whereClause = vehicleId ? { vehicleId, userId: user.id } : { userId: user.id };

    const entries = await prisma.maintenanceCost.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });

    // Calculate statistics
    const stats = {
      totalEntries: entries.length,
      totalCost: entries.reduce((sum, entry) => sum + entry.cost, 0),
      averageCost: entries.length > 0 ? entries.reduce((sum, entry) => sum + entry.cost, 0) / entries.length : 0,
      categories: {} as { [key: string]: number },
      monthlyCosts: {} as { [key: string]: number }
    };

    // Calculate category totals
    entries.forEach(entry => {
      stats.categories[entry.category] = (stats.categories[entry.category] || 0) + entry.cost;
    });

    // Calculate monthly costs
    entries.forEach(entry => {
      const monthKey = entry.date.toISOString().substring(0, 7); // YYYY-MM format
      stats.monthlyCosts[monthKey] = (stats.monthlyCosts[monthKey] || 0) + entry.cost;
    });

    return NextResponse.json({
      entries: entries.map(entry => ({
        ...entry,
        date: entry.date.toISOString(),
        createdAt: entry.createdAt.toISOString(),
        odometer: entry.odometer || undefined,
        location: entry.location || undefined,
        notes: entry.notes || undefined
      })),
      stats
    });
  } catch (error) {
    console.error('Error fetching maintenance costs:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance costs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, description, cost, category, odometer, location, notes, vehicleId } = body;

    if (!description || !cost || !category || !vehicleId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if vehicle exists and belongs to user
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, userId: user.id }
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    const maintenanceCost = await prisma.maintenanceCost.create({
      data: {
        date: new Date(date),
        description,
        cost: parseFloat(cost),
        category,
        odometer: odometer ? parseInt(odometer) : null,
        location: location || null,
        notes: notes || null,
        vehicleId,
        userId: user.id
      }
    });

    return NextResponse.json({
      ...maintenanceCost,
      date: maintenanceCost.date.toISOString(),
      createdAt: maintenanceCost.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error creating maintenance cost:', error);
    return NextResponse.json({ error: 'Failed to create maintenance cost' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, date, description, cost, category, odometer, location, notes, vehicleId } = body;

    if (!id || !description || !cost || !category || !vehicleId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const maintenanceCost = await prisma.maintenanceCost.update({
      where: { id },
      data: {
        date: new Date(date),
        description,
        cost: parseFloat(cost),
        category,
        odometer: odometer ? parseInt(odometer) : null,
        location: location || null,
        notes: notes || null,
        vehicleId
      }
    });

    return NextResponse.json({
      ...maintenanceCost,
      date: maintenanceCost.date.toISOString(),
      createdAt: maintenanceCost.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error updating maintenance cost:', error);
    return NextResponse.json({ error: 'Failed to update maintenance cost' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    await prisma.maintenanceCost.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting maintenance cost:', error);
    return NextResponse.json({ error: 'Failed to delete maintenance cost' }, { status: 500 });
  }
}