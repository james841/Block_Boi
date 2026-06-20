import { prisma } from "@/lib/prisma";
import CategoriesGrid from "./CategoriesGrid";

export const dynamic = "force-dynamic";

export default async function CategoryShowcasePage() {
  // ⚠️ ASSUMPTION: model name "categoryShowcase" — your API route is /api/CategoriesShowcase
  // but that doesn't confirm the Prisma model name. If this doesn't match your schema.prisma,
  // change `prisma.categoryShowcase` below to whatever your model is actually called.
  const categories = await prisma.categoryShowcase.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serialized = categories.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return <CategoriesGrid initialCategories={serialized} />;
}
