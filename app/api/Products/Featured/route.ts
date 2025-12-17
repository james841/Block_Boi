// app/api/products/featured/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
  
    const products = await prisma.product.findMany({
      where: {
        featuredOnHomepage: true,
      },
      take: 12, 
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: any) {
    // 🧠 Enhanced error logging for debugging
    console.error("Error fetching featured products:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Error fetching featured products",
        error: error?.message || "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
