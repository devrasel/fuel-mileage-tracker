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

    // Get the user's settings record or create one if it doesn't exist
    let settings = await db.settings.findFirst({
      where: { userId: user.id }
    });
    
    if (!settings) {
      settings = await db.settings.create({
        data: {
          currency: 'BDT',
          dateFormat: 'DD/MM/YYYY',
          distanceUnit: 'km',
          volumeUnit: 'L',
          timezone: 'Asia/Dhaka',
          userId: user.id
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currency, dateFormat, distanceUnit, volumeUnit, entriesPerPage, timezone } = body;

    // Get the user's settings record or create one if it doesn't exist
    let settings = await db.settings.findFirst({
      where: { userId: user.id }
    });
    
    if (!settings) {
      settings = await db.settings.create({
        data: {
          currency: currency || 'BDT',
          dateFormat: dateFormat || 'DD/MM/YYYY',
          distanceUnit: distanceUnit || 'km',
          volumeUnit: volumeUnit || 'L',
          entriesPerPage: entriesPerPage || 10,
          timezone: timezone || 'Asia/Dhaka',
          userId: user.id
        }
      });
    } else {
      settings = await db.settings.update({
        where: { id: settings.id },
        data: {
          currency: currency || settings.currency,
          dateFormat: dateFormat || settings.dateFormat,
          distanceUnit: distanceUnit || settings.distanceUnit,
          volumeUnit: volumeUnit || settings.volumeUnit,
          entriesPerPage: entriesPerPage || settings.entriesPerPage,
          timezone: timezone || settings.timezone
        }
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}