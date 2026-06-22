// 📁 FILE: app/api/CategoriesShowcase/route.ts
// (the collection route — no [id] folder, handles GET list + POST create)

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";

export async function GET() {
  try {
    const categories = await prisma.categoryShowcase.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching category showcase:", error);
    return NextResponse.json(
      { error: "Failed to load category showcase" },
      { status: 500 }
    );
  }
}

// POST - Create new category showcase
export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, imageUrl, slug } = body;

    if (!title || !imageUrl || !slug) {
      return NextResponse.json(
        { error: "Title, imageUrl, and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await prisma.categoryShowcase.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.categoryShowcase.create({
      data: {
        title,
        imageUrl,
        slug,
      },
    });

    console.log("✅ Category created:", category);

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category", details: error.message },
      { status: 500 }
    );
  }
}