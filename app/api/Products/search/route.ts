import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const q = new URL(request.url).searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json({ success: true, products: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        price: true,
        oldPrice: true,
        imageUrl: true,
        category: true,
      },
    });

    // Convert Decimal and strip base64 images (too large for dropdown)
    const serialized = products.map((p) => ({
      ...p,
      price: Number(p.price),
      oldPrice: p.oldPrice ? Number(p.oldPrice) : null,
      imageUrl:
        p.imageUrl && !p.imageUrl.startsWith("data:")
          ? p.imageUrl
          : null,
    }));

    return NextResponse.json({ success: true, products: serialized });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, message: "Search failed" },
      { status: 500 }
    );
  }
}