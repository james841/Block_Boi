import { prisma } from "@/lib/prisma";
import SlidersGrid from "./SlidersGrid";

export const dynamic = "force-dynamic";

export default async function SliderPage() {
  const sliders = await prisma.slider.findMany({
    orderBy: { createdAt: "desc" },
    take: 20, // hero sliders are never realistically more than a handful — this is just a guard rail
  });

  const serialized = sliders.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return <SlidersGrid initialSliders={serialized} />;
}