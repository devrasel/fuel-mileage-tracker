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
      orderBy: { date: 'desc' }
    });

    const stats = calculateFuelStats(entries);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error calculating fuel stats:', error);
    return NextResponse.json({ error: 'Failed to calculate fuel stats' }, { status: 500 });
  }
}

function calculateFuelStats(entries: any[]) {
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      totalLiters: 0,
      totalCost: 0,
      averageCostPerLiter: 0,
      averageFuelEfficiency: 0,
      totalDistance: 0
    };
  }

  const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let totalLiters = 0;
  let totalCost = 0;
  let totalDistance = 0;
  let fuelEfficiencySum = 0;
  let efficiencyCount = 0;

  // Calculate totals
  entries.forEach(entry => {
    totalLiters += entry.liters;
    totalCost += entry.totalCost;
  });

  // Calculate total distance (from first to last entry)
  if (sortedEntries.length > 1) {
    totalDistance = sortedEntries[sortedEntries.length - 1].odometer - sortedEntries[0].odometer;
  }

  // Calculate fuel efficiency between consecutive entries
  for (let i = 1; i < sortedEntries.length; i++) {
    const prev = sortedEntries[i - 1];
    const curr = sortedEntries[i];
    const distance = curr.odometer - prev.odometer;
    const efficiency = distance / curr.liters; // km/L
    
    if (efficiency > 0 && efficiency < 100) { // Filter out unrealistic values
      fuelEfficiencySum += efficiency;
      efficiencyCount++;
    }
  }

  return {
    totalEntries: entries.length,
    totalLiters: Math.round(totalLiters * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    averageCostPerLiter: totalCost > 0 ? Math.round((totalCost / totalLiters) * 100) / 100 : 0,
    averageFuelEfficiency: efficiencyCount > 0 ? Math.round((fuelEfficiencySum / efficiencyCount) * 100) / 100 : 0,
    totalDistance: Math.round(totalDistance * 100) / 100
  };
}