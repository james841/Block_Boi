import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// PUT - Update slider
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← Async params for Next.js 15+
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idStr } = await params;  // ← Await params
    const id = parseInt(idStr, 10);     // ← Convert string to number

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid slider ID" }, { status: 400 });
    }

    const body = await request.json();
    const { title, imageUrl, Button, subtitle } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Title and imageUrl are required" },
        { status: 400 }
      );
    }

    const slider = await prisma.slider.update({
      where: { id },  // ← Now number
      data: {
        title,
        imageUrl,
        Button: Button || null,
        subtitle: subtitle || null,
      },
    });

    console.log("✅ Slider updated:", slider);

    return NextResponse.json({ slider });
  } catch (error: any) {
    console.error("❌ Error updating slider:", error);
    return NextResponse.json(
      { error: "Failed to update slider", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete slider
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ← Async params
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idStr } = await params;  // ← Await params
    const id = parseInt(idStr, 10);     // ← Convert to number

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid slider ID" }, { status: 400 });
    }

    await prisma.slider.delete({
      where: { id },  // ← Now number
    });

    console.log("✅ Slider deleted:", id);

    return NextResponse.json({ message: "Slider deleted successfully" });
  } catch (error: any) {
    console.error("❌ Error deleting slider:", error);
    return NextResponse.json(
      { error: "Failed to delete slider", details: error.message },
      { status: 500 }
    );
  }
}