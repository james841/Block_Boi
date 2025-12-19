// app/api/products/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/adminAuth';
import { NextRequest } from 'next/server';

// === IN-MEMORY CACHE FOR FEATURED PRODUCTS (Homepage) ===
let featuredProductsCache: {
  data: any[] | null;
  timestamp: number;
} = { data: null, timestamp: 0 };

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

// === GET: Fetch products with pagination, search, category filter — WITH CACHING FOR FEATURED ===
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const search = searchParams.get('search')?.trim() || '';
    const categoryParam = searchParams.get('category')?.trim() || '';
    const forceRefresh = searchParams.get('refresh') === 'true';
    const now = Date.now();

    // === SPECIAL CASE: Fetching featured products for homepage (no filters) ===
    if (!search && !categoryParam) {
      if (
        !forceRefresh &&
        featuredProductsCache.data &&
        now - featuredProductsCache.timestamp < CACHE_DURATION
      ) {
        console.log('✅ Serving featured products from server cache');
        return NextResponse.json(
          {
            success: true,
            products: featuredProductsCache.data,
            cached: true,
            cacheAge: Math.floor((now - featuredProductsCache.timestamp) / 1000),
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            },
          }
        );
      }

      console.log('🔄 Fetching fresh featured products from database');
      const products = await prisma.product.findMany({
        where: { featuredOnHomepage: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          oldPrice: true,
          imageUrl: true,
          category: true,
          featuredOnHomepage: true,
        },
      });

      featuredProductsCache = { data: products, timestamp: now };
      console.log(`💾 Cached ${products.length} featured products`);

      return NextResponse.json(
        { success: true, products, cached: false },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      );
    }

    // === REGULAR PAGINATED/FILTERED PRODUCTS ===
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '12')));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
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
      success: true,
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

    const url = new URL(request.url);
    const searchParams = url.searchParams;

    if (!searchParams.get('search') && !searchParams.get('category') && featuredProductsCache.data) {
      console.log('⚠️ Serving stale featured cache due to database error');
      return NextResponse.json({
        success: true,
        products: featuredProductsCache.data,
        cached: true,
        stale: true,
      });
    }

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

    if (featuredOnHomepage) {
      featuredProductsCache = { data: null, timestamp: 0 };
      console.log('🗑️ Cache invalidated: new featured product added');
    }

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
      featuredOnHomepage = false,
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

    const existing = await prisma.product.findUnique({
      where: { id: Number(id) },
      select: { featuredOnHomepage: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
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
        featuredOnHomepage,
        shipping: shipping || null,
        returns: returns || null,
        details: details || null,
      },
    });

    if (existing.featuredOnHomepage !== featuredOnHomepage) {
      featuredProductsCache = { data: null, timestamp: 0 };
      console.log('🗑️ Cache invalidated: featured status changed');
    }

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
    const url = new URL(request.url);
    const idParam = url.searchParams.get('id');

    if (!idParam) {
      return NextResponse.json(
        { success: false, message: 'Product ID is required' },
        { status: 400 }
      );
    }

    const productId = Number(idParam);
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { featuredOnHomepage: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    if (product.featuredOnHomepage) {
      featuredProductsCache = { data: null, timestamp: 0 };
      console.log('🗑️ Cache invalidated: featured product deleted');
    }

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