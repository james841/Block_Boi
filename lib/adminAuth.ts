import { cookies } from 'next/headers';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'your-admin-secret-key-change-this'
);

export async function createAdminSession(adminId: string) {
  const token = await new SignJWT({ adminId, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set('admin-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return token;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function deleteAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-session');
}

export async function verifyAdmin(username: string, password: string) {
  const admin = await prisma.admin.findUnique({
    where: { username },
  });

  if (!admin) return null;

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) return null;

  return admin;
}