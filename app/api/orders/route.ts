// app/api/orders/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { getAdminSession } from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    // Check user session (Google OAuth)
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'Please sign in with Google to place an order' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      userEmail,
      userName,
      total,
      shippingAddress,
      paymentStatus,
      paymentReference,
      items,
    } = body;

    // Validate required data
    if (!total || !shippingAddress || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required order details' },
        { status: 400 }
      );
    }

    if (
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zipCode ||
      !shippingAddress.country ||
      !shippingAddress.phone
    ) {
      return NextResponse.json(
        { success: false, message: 'Incomplete shipping address' },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        userEmail: session.user.email, // Use actual Google email
        userName: session.user.name || userName || 'Customer',
        total,
        paymentStatus,
        paymentReference,
        status: 'pending',
        // FIXED: Nested create for 1-to-1 ShippingAddress
        shippingAddress: {
          create: {
            address: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode,
            country: shippingAddress.country,
            phone: shippingAddress.phone,
          },
        },
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage || '',
            quantity: item.quantity,
            price: item.price,
            selectedColor: item.selectedColor,
            selectedSize: item.selectedSize,
          })),
        },
      },
      include: {
        items: true,
        shippingAddress: true, // Include to return full address
      },
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Check if admin
    const adminSession = await getAdminSession();
    
    if (adminSession) {
      // Admin can see ALL orders
      const orders = await prisma.order.findMany({
        include: {
          items: true,
          shippingAddress: true,
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return NextResponse.json({ success: true, orders });
    }

    // Check if regular user
    const userSession = await getServerSession(authOptions);
    
    if (!userSession?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // User can only see THEIR orders
    const orders = await prisma.order.findMany({
      where: { userId: userSession.user.id },
      include: {
        items: true,
        shippingAddress: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching orders' },
      { status: 500 }
    );
  }
}