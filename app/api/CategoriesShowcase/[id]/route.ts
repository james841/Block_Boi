import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// PUT - Update category showcase
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);
    const body = await request.json();
    const { title, imageUrl, slug } = body;

    if (!title || !imageUrl || !slug) {
      return NextResponse.json(
        { error: "Title, imageUrl, and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists (excluding current category)
    const existingCategory = await prisma.categoryShowcase.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.categoryShowcase.update({
      where: { id },
      data: {
        title,
        imageUrl,
        slug,
      },
    });

    console.log("✅ Category updated:", category);

    return NextResponse.json({ category });
  } catch (error: any) {
    console.error("❌ Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete category showcase
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = parseInt(params.id);

    await prisma.categoryShowcase.delete({
      where: { id },
    });

    console.log("✅ Category deleted:", id);

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("❌ Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category", details: error.message },
      { status: 500 }
    );
  }
}