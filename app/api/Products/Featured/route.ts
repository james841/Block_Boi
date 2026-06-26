// app/api/Products/Featured/route.ts
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const CACHE_KEY = "products:featured";
const CACHE_TTL = 300; // 5 minutes — invalidate when admin updates featured products

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    // 1. Try Redis first — returns in ~5ms, no DB round-trip
    try {
      const cached = await redis.get<any[]>(CACHE_KEY);
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return NextResponse.json(
          { success: true, products: cached, cached: true },
          {
            headers: {
              "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            },
          }
        );
      }
    } catch (redisError) {
      // Redis unavailable — fall through to DB silently
      console.warn("Redis unavailable, falling back to DB:", redisError);
    }

    // 2. DB query — only runs on cache miss
    // Select only the fields the frontend actually uses to minimize payload
    const products = await prisma.product.findMany({
      where: { featuredOnHomepage: true },
      take: 12,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        oldPrice: true,
        imageUrl: true,
        category: true,
        featuredOnHomepage: true,
        // Deliberately NOT selecting: colors, sizes, images, details,
        // shipping, returns, likes — the homepage grid doesn't need them
        // and they add significant payload when images are base64
      },
    });

    // 3. Warm the cache so next visitor is instant
    try {
      await redis.set(CACHE_KEY, products, { ex: CACHE_TTL });
    } catch {
      // Non-fatal — page still renders
    }

    return NextResponse.json(
      { success: true, products, cached: false },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error: any) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching featured products",
        error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}