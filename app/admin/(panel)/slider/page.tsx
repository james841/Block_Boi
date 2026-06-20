import { prisma } from "@/lib/prisma";
import SlidersGrid from "./SlidersGrid";

export const dynamic = "force-dynamic";

export default async function SliderPage() {
  const sliders = await prisma.slider.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serialized = sliders.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return <SlidersGrid initialSliders={serialized} />;
}
