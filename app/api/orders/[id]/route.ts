// app/api/orders/[id]/route.ts
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Get single order
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adminSession = await getAdminSession();
    const userSession = await getServerSession(authOptions);

    if (!adminSession && !userSession) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        shippingAddress: true, // ← ADD THIS
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // If user (not admin), check ownership
    if (!adminSession && userSession) {
      if (order.userId !== userSession.user.id) {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching order' },
      { status: 500 }
    );
  }
}

// UPDATE ORDER (status OR isNew)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, isNew } = body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (isNew !== undefined) updateData.isNew = isNew; // ← THIS IS NEW

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        items: true,
        shippingAddress: true,
        user: { select: { name: true, email: true, image: true } }
      }
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Error updating order:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Error updating order' },
      { status: 500 }
    );
  }
}

// Delete order (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 401 }
      );
    }

    await prisma.order.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Order deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Error deleting order' },
      { status: 500 }
    );
  }
}