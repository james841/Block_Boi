// app/api/Products/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = Number(id);
    if (isNaN(idNum)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: idNum },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// ADD THIS: PUT handler
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = Number(id);
    if (isNaN(idNum)) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();

    const updated = await prisma.product.update({
      where: { id: idNum },
      data: {
        name: body.name,
        price: body.price,
        oldPrice: body.oldPrice,
        imageUrl: body.imageUrl,
        category: body.category,
        description: body.description,
        featuredOnHomepage: body.featuredOnHomepage,
        colors: body.colors,  
        sizes: body.sizes,     
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    console.error("PUT error:", err);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}