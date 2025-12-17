import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Use your centralized prisma instance
import { getServerSession } from "next-auth";

// GET - Fetch all sliders
export async function GET() {
  try {
    const sliders = await prisma.slider.findMany({
      orderBy: { createdAt: "desc" },
    });

    console.log("Fetched sliders:", sliders);

    return NextResponse.json({ sliders });
  } catch (error: any) {
    console.error("❌ Error fetching sliders:", error);
    return NextResponse.json(
      { error: "Failed to fetch sliders", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new slider
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, imageUrl, Button, subtitle } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: "Title and imageUrl are required" },
        { status: 400 }
      );
    }

    const slider = await prisma.slider.create({
      data: {
        title,
        imageUrl,
        Button: Button || null,
        subtitle: subtitle || null,
      },
    });

    console.log("✅ Slider created:", slider);

    return NextResponse.json({ slider }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error creating slider:", error);
    return NextResponse.json(
      { error: "Failed to create slider", details: error.message },
      { status: 500 }
    );
  }
}