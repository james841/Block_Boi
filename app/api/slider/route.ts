import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getAdminSession } from "@/lib/adminAuth";

const SLIDER_CACHE_KEY = "sliders:list";
const SLIDER_CACHE_TTL_SECONDS = 3600; // safety-net expiry; invalidation below keeps it fresh in practice

// GET - Fetch all sliders
export async function GET() {
  try {
    const cached = await redis.get(SLIDER_CACHE_KEY);
    if (cached) {
      return NextResponse.json({ sliders: cached });
    }

    const sliders = await prisma.slider.findMany({
      orderBy: { createdAt: "desc" },
    });

    await redis.set(SLIDER_CACHE_KEY, sliders, { ex: SLIDER_CACHE_TTL_SECONDS });

    console.log("Fetched sliders from DB:", sliders.length);

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
    const session = await getAdminSession();
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

    await redis.del(SLIDER_CACHE_KEY);

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