import { prisma } from "@/lib/prisma";
import ProductsTable from "./ProductsTable";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const skip = (currentPage - 1) * PAGE_SIZE;

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        price: true,
        oldPrice: true,
        imageUrl: true,
        category: true,
        featuredOnHomepage: true,
        createdAt: true,
      },
    }),
    prisma.product.count(),
  ]);

  const serialized = products.map((p) => ({
    ...p,
    price: Number(p.price),
    oldPrice: p.oldPrice !== null && p.oldPrice !== undefined ? Number(p.oldPrice) : null,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <ProductsTable
      initialProducts={serialized}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={PAGE_SIZE}
    />
  );
}