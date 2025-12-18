import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

// PUT - Update slider
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid slider ID" }, { status: 400 });
    }

    const body = await request.json();
    const { title, imageUrl, Button, subtitle } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Prepare update data - only include fields that are provided
    const updateData: any = {
      title,
      Button: Button || null,
      subtitle: subtitle || null,
    };

    // Only update imageUrl if it's provided (meaning it was changed)
    if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }

    const slider = await prisma.slider.update({
      where: { id },
      data: updateData,
    });

    console.log("✅ Slider updated:", slider.id, "- Image updated:", !!imageUrl);

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid slider ID" }, { status: 400 });
    }

    await prisma.slider.delete({
      where: { id },
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