import { prisma } from "@/lib/prisma";
import ProductsTable from "./ProductsTable";

export const dynamic = "force-dynamic"; // always show fresh stock/price data

export default async function ProductsPage() {
  // NOTE: confirmed field names from your own Product type (admin/products/page.tsx).
  // select keeps this query light — only what the list view actually renders.
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
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
  });

  // Dates aren't serializable across the server/client boundary as Date objects
  const serialized = products.map((p: { createdAt: Date; [key: string]: any }) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return <ProductsTable initialProducts={serialized} />;
}
