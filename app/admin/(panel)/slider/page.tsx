import { prisma } from "@/lib/prisma";
import SlidersGrid from "./SlidersGrid";

export const dynamic = "force-dynamic";

export default async function SliderPage() {
  const sliders = await prisma.slider.findMany({
    orderBy: { createdAt: "desc" },
  });

  type RawSlider = {
    id: number;
    title: string;
    imageUrl: string;
    Button?: string | null;
    subtitle?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };

  type SerializedSlider = {
    id: number;
    title: string;
    imageUrl: string;
    Button?: string | null;
    subtitle?: string | null;
    createdAt: string;
    updatedAt: string;
  };

  const serialized: SerializedSlider[] = sliders.map((s: RawSlider) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }));

  return <SlidersGrid initialSliders={serialized} />;
}
