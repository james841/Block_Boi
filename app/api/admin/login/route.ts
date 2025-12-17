import { NextResponse } from 'next/server';
import { verifyAdmin, createAdminSession } from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const admin = await verifyAdmin(username, password);
    
    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    await createAdminSession(admin.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Login successful',
      admin: {
        id: admin.id,
        username: admin.username,
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}