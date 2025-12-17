import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getAdminSession();
  
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.adminId as string },
    select: { id: true, username: true, createdAt: true },
  });

  return NextResponse.json({ success: true, admin });
}