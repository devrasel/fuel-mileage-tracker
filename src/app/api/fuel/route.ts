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
    
    const whereClause = vehicleId ? { vehicleId, userId: user.id } : { userId: user.id };
    
    const entries = await db.fuelEntry.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      include: {
        partials: true,
        parent: true,
        vehicle: true
      }
    });

    // Calculate statistics
    const stats = {
      totalEntries: entries.length,
      totalCost: 0,
      totalLiters: 0,
      totalDistance: 0,
      averageCostPerLiter: 0,
      averageConsumption: 0,
      bestConsumption: 0,
      worstConsumption: 0,
      mileagePerLiter: 0,
      totalMileage: 0
    };

    if (entries.length > 0) {
      // Get all full entries sorted by date (oldest first for proper distance calculation)
      const fullEntries = entries
        .filter(entry => entry.fuelType === 'FULL')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculate totals including partial entries for their parent full tank entries
      let totalCost = 0;
      let totalLiters = 0;
      let totalDistance = 0;
      
      // Process each full entry and add its partial entries
      fullEntries.forEach((entry, index) => {
        // Add the full entry itself
        totalCost += entry.totalCost;
        totalLiters += entry.liters;
        
        // Add all partial entries for this full tank
        if (entry.partials && entry.partials.length > 0) {
          entry.partials.forEach(partial => {
            totalCost += partial.totalCost;
            totalLiters += partial.liters;
          });
        }
        
        // Calculate distance if this is not the first entry (distance = current odometer - previous odometer)
        if (index > 0) {
          const previousEntry = fullEntries[index - 1];
          const distance = entry.odometer - previousEntry.odometer;
          if (distance > 0) {
            totalDistance += distance;
          }
        }
      });
      
      stats.totalCost = totalCost;
      stats.totalLiters = totalLiters;
      stats.totalDistance = totalDistance;
      
      // Calculate consumption rates only between FULL entries (mileage = distance ÷ previous fuel amount)
      const consumptions: number[] = []; // Fixed: Added explicit type annotation
      for (let i = 1; i < fullEntries.length; i++) {
        const currentEntry = fullEntries[i];
        const previousEntry = fullEntries[i - 1];
        
        const distance = currentEntry.odometer - previousEntry.odometer;
        
        // Calculate total fuel for previous entry (including partials) - this is the fuel used for the distance
        let previousFuel = previousEntry.liters;
        if (previousEntry.partials && previousEntry.partials.length > 0) {
          previousEntry.partials.forEach(partial => {
            previousFuel += partial.liters;
          });
        }
        
        const consumption = (previousFuel / distance) * 100; // L/100km
        
        if (distance > 0 && consumption > 0) {
          consumptions.push(consumption);
        }
      }

      if (consumptions.length > 0) {
        stats.averageConsumption = consumptions.reduce((sum, c) => sum + c, 0) / consumptions.length;
        stats.bestConsumption = Math.min(...consumptions);
        stats.worstConsumption = Math.max(...consumptions);
      } else {
        // Not enough entries to calculate consumption
        stats.averageConsumption = 0;
        stats.bestConsumption = 0;
        stats.worstConsumption = 0;
      }

      // Calculate mileage per liter (total distance covered per total fuel)
      stats.totalMileage = totalDistance;
      stats.mileagePerLiter = totalLiters > 0 ? totalDistance / totalLiters : 0;
      stats.averageCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;
    }

    return NextResponse.json({
      entries,
      stats
    });
  } catch (error) {
    console.error('Error fetching fuel entries:', error);
    return NextResponse.json({ error: 'Failed to fetch fuel entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, odometer, totalCost, costPerLiter, liters, fuelType, parentEntry, location, notes, vehicleId, odometerExtraKm } = body;

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

    // Handle odometer extra km for partial entries
    let updatedParentEntry: any = null; // Fixed: Added explicit type annotation
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
        totalCost: parseFloat(totalCost),
        costPerLiter: parseFloat(costPerLiter),
        liters: parseFloat(liters),
        fuelType: fuelType,
        parentEntry: parentEntry || null,
        location: location || null,
        notes: notes || null,
        vehicleId: vehicleId,
        userId: user.id,
        odometerExtraKm: odometerExtraKm ? parseFloat(odometerExtraKm) : 0
      },
      include: {
        partials: true,
        parent: true,
        vehicle: true
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
