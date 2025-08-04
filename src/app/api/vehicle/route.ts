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
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    const vehicles = await db.vehicle.findMany({
      where: {
        userId: user.id,
        ...(includeInactive ? {} : { isActive: true })
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let requestBody: any = {};
  
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    requestBody = await request.json();
    const { name, make, model, year, licensePlate, color, isActive } = requestBody;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Vehicle name is required' },
        { status: 400 }
      );
    }

    // Get the highest displayOrder value
    const highestOrder = await db.vehicle.findFirst({
      where: { userId: user.id },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true }
    }) as { displayOrder: number } | null;
    
    const nextOrder = highestOrder ? highestOrder.displayOrder + 1 : 0;
    
    // Log the data being sent to the database
    console.log('Creating vehicle with data:', {
      name: name?.trim(),
      make: make?.trim() || null,
      model: model?.trim() || null,
      year: year ? (typeof year === 'string' ? parseInt(year) : year) : null,
      licensePlate: licensePlate?.trim() || null,
      color: color?.trim() || null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      displayOrder: nextOrder,
      userId: user.id
    });

    // Ensure all fields are properly formatted
    const vehicle = await db.vehicle.create({
      data: {
        name: name.trim(),
        make: make?.trim() || null,
        model: model?.trim() || null,
        year: year ? (typeof year === 'string' ? parseInt(year) : year) : null,
        licensePlate: licensePlate?.trim() || null,
        color: color?.trim() || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        displayOrder: nextOrder,
        userId: user.id
      }
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error: any) {
    console.error('Error creating vehicle:', error);
    console.error('Error details:', JSON.stringify({
      message: error.message || 'No message',
      name: error.name || 'No name',
      stack: error.stack || 'No stack',
      meta: error.meta || 'No meta',
      code: error.code || 'No code'
    }, null, 2));
    
    // Log the request body for debugging
    console.error('Request body:', JSON.stringify(requestBody, null, 2));
    
    return NextResponse.json(
      { error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}