import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getAdminSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      orders,
      totalCustomers, // Count unique users
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'completed' } }),
      prisma.order.findMany({ select: { total: true } }),
      prisma.user.count(), // Total customers
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    const stats = {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      totalCustomers,
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching stats' },
      { status: 500 }
    );
  }
}