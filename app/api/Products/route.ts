// app/api/products/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { NextRequest } from 'next/server'; // ← added for typed request in GET

// === ADMIN AUTH MIDDLEWARE ===
async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized: Admin access required' },
      { status: 401 }
    );
  }
  return null;
}

// === GET: Fetch products with pagination, search (name), and category filter ===
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters
    const search = searchParams.get('search')?.trim() || '';
    const categoryParam = searchParams.get('category')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '12'))); // sane defaults

    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive', // case-insensitive search
      };
    }

    if (categoryParam) {
      const categories = categoryParam.split(',').map(c => c.trim()).filter(Boolean);
      if (categories.length > 0) {
        where.category = { in: categories };
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching products' },
      { status: 500 }
    );
  }
}

// === POST: Create product (Admin only) ===
export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const {
      name,
      description,
      oldPrice,
      price,
      imageUrl,
      images,
      colors,
      sizes,
      category,
      featuredOnHomepage,
      shipping,
      returns,
      details,
    } = body;

    if (!name || !price) {
      return NextResponse.json(
        { success: false, message: 'Name and price are required' },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || null,
        oldPrice: oldPrice ? parseFloat(String(oldPrice)) : null,
        price: parseFloat(String(price)),
        imageUrl: imageUrl || null,
        images: images || [],
        colors: colors || [],
        sizes: sizes || [],
        category: category || null,
        featuredOnHomepage: featuredOnHomepage || false,
        shipping: shipping || null,
        returns: returns || null,
        details: details || null,
      },
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error creating product' },
      { status: 500 }
    );
  }
}

// === PUT: Update product (Admin only) ===
export async function PUT(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      oldPrice,
      price,
      imageUrl,
      images,
      colors,
      sizes,
      category,
      featuredOnHomepage,
      shipping,
      returns,
      details,
    } = body;

    if (!id || !name || !price) {
      return NextResponse.json(
        { success: false, message: 'ID, name, and price are required' },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description: description || null,
        oldPrice: oldPrice ? parseFloat(String(oldPrice)) : null,
        price: parseFloat(String(price)),
        imageUrl: imageUrl || null,
        images: images || [],
        colors: colors || [],
        sizes: sizes || [],
        category: category || null,
        featuredOnHomepage: featuredOnHomepage || false,
        shipping: shipping || null,
        returns: returns || null,
        details: details || null,
      },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error('Error updating product:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Error updating product' },
      { status: 500 }
    );
  }
}

// === PATCH: Update likes (Public) ===
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, likes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: { likes },
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error updating likes:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating product' },
      { status: 500 }
    );
  }
}

// === DELETE: Delete product (Admin only) ===
export async function DELETE(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Error deleting product' },
      { status: 500 }
    );
  }
}