import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface UserPayload {
  id: string;
  email: string;
  name?: string | null;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<UserPayload | null> {
  try {
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function createUser(
  email: string,
  password: string,
  name: string | undefined,
  securityQuestions: { question: string; answer: string }[]
): Promise<{ user: UserPayload | null; error: string | null }> {
  try {
    return await db.$transaction(async (prisma) => {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return { user: null, error: 'Email already exists' };
      }

      const passwordHash = hashPassword(password);
      
      const userData: any = {
        email: email,
        passwordHash: passwordHash
      };
      
      if (name) {
        userData.name = name;
      }
      
      const user = await prisma.user.create({
        data: userData
      });

      await prisma.securityQuestion.createMany({
        data: securityQuestions.map(q => ({
          question: q.question,
          answerHash: hashPassword(q.answer),
          userId: user.id
        }))
      });

      await prisma.settings.create({
        data: {
          userId: user.id,
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          distanceUnit: 'miles',
          volumeUnit: 'gallons',
          entriesPerPage: 10,
          timezone: 'UTC'
        }
      });

      const userPayload = {
        id: user.id,
        email: user.email,
        name: user.name
      };

      return { user: userPayload, error: null };
    });
  } catch (error) {
    console.error('User creation error:', error);
    return { user: null, error: 'Failed to create user. Please try again.' };
  }
}