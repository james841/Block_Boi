

import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BATCH_SIZE = 5; 



function isBase64(str: string | null): boolean {
  return !!str && str.startsWith("data:");
}

function base64ToBuffer(dataUri: string): { buffer: Buffer; mimeType: string; ext: string } {
  const [header, data] = dataUri.split(",");
  const mimeType = header.match(/data:([^;]+)/)?.[1] || "image/jpeg";
  const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  return { buffer: Buffer.from(data, "base64"), mimeType, ext };
}

async function uploadToSupabase(
  buffer: Buffer,
  mimeType: string,
  ext: string,
  bucket: string,
  prefix: string
): Promise<string> {
  const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(fileName, buffer, {
    contentType: mimeType,
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

// ─── per-table migrations (batched) ───────────────────────────────────────────

async function migrateProducts() {
  console.log("\n📦 Migrating Products...");

  let updated = 0;
  let skipped = 0;
  let skip = 0;

  while (true) {
    const products = await prisma.product.findMany({
      select: { id: true, name: true, imageUrl: true, images: true },
      orderBy: { id: "asc" },
      skip,
      take: BATCH_SIZE,
    });

    if (products.length === 0) break;

    for (const product of products) {
      const updates: Record<string, any> = {};

      // Main image
      if (isBase64(product.imageUrl)) {
        try {
          const { buffer, mimeType, ext } = base64ToBuffer(product.imageUrl!);
          const url = await uploadToSupabase(buffer, mimeType, ext, "products", `product-${product.id}`);
          updates.imageUrl = url;
          console.log(`  ✅ Product ${product.id} (${product.name}) — main image uploaded`);
        } catch (err: any) {
          console.error(`  ❌ Product ${product.id} main image failed: ${err.message}`);
        }
      }

      // Gallery images
      if (product.images && product.images.some(isBase64)) {
        const newImages: string[] = [];
        for (let i = 0; i < product.images.length; i++) {
          const img = product.images[i];
          if (isBase64(img)) {
            try {
              const { buffer, mimeType, ext } = base64ToBuffer(img);
              const url = await uploadToSupabase(buffer, mimeType, ext, "products", `product-${product.id}-gallery-${i}`);
              newImages.push(url);
              console.log(`  ✅ Product ${product.id} gallery[${i}] uploaded`);
            } catch (err: any) {
              console.error(`  ❌ Product ${product.id} gallery[${i}] failed: ${err.message}`);
              newImages.push(img);
            }
          } else {
            newImages.push(img);
          }
        }
        updates.images = newImages;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.product.update({ where: { id: product.id }, data: updates });
        updated++;
      } else {
        skipped++;
      }
    }

    skip += BATCH_SIZE;
  }

  console.log(`  📊 Products: ${updated} updated, ${skipped} already had URLs`);
}

async function migrateSliders() {
  console.log("\n🖼️  Migrating Sliders...");

  let updated = 0;
  let skipped = 0;
  let skip = 0;

  while (true) {
    const sliders = await prisma.slider.findMany({
      select: { id: true, title: true, imageUrl: true },
      orderBy: { id: "asc" },
      skip,
      take: BATCH_SIZE,
    });

    if (sliders.length === 0) break;

    for (const slider of sliders) {
      if (!isBase64(slider.imageUrl)) {
        skipped++;
        continue;
      }

      try {
        const { buffer, mimeType, ext } = base64ToBuffer(slider.imageUrl);
        const url = await uploadToSupabase(buffer, mimeType, ext, "sliders", `slider-${slider.id}`);
        await prisma.slider.update({ where: { id: slider.id }, data: { imageUrl: url } });
        console.log(`  ✅ Slider ${slider.id} (${slider.title}) uploaded`);
        updated++;
      } catch (err: any) {
        console.error(`  ❌ Slider ${slider.id} failed: ${err.message}`);
      }
    }

    skip += BATCH_SIZE;
  }

  console.log(`  📊 Sliders: ${updated} updated, ${skipped} already had URLs`);
}

async function migrateCategories() {
  console.log("\n📁 Migrating Categories...");

  let updated = 0;
  let skipped = 0;
  let skip = 0;

  while (true) {
    const categories = await prisma.categoryShowcase.findMany({
      select: { id: true, title: true, imageUrl: true },
      orderBy: { id: "asc" },
      skip,
      take: BATCH_SIZE,
    });

    if (categories.length === 0) break;

    for (const category of categories) {
      if (!isBase64(category.imageUrl)) {
        skipped++;
        continue;
      }

      try {
        const { buffer, mimeType, ext } = base64ToBuffer(category.imageUrl);
        const url = await uploadToSupabase(buffer, mimeType, ext, "categories", `category-${category.id}`);
        await prisma.categoryShowcase.update({ where: { id: category.id }, data: { imageUrl: url } });
        console.log(`  ✅ Category ${category.id} (${category.title}) uploaded`);
        updated++;
      } catch (err: any) {
        console.error(`  ❌ Category ${category.id} failed: ${err.message}`);
      }
    }

    skip += BATCH_SIZE;
  }

  console.log(`  📊 Categories: ${updated} updated, ${skipped} already had URLs`);
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Starting image migration to Supabase Storage...");
  console.log(`   Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error("❌ Cannot connect to Supabase Storage:", error.message);
    console.error("   Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const bucketNames = data.map((b) => b.name);
  console.log(`   Found buckets: ${bucketNames.join(", ") || "none"}`);

  const required = ["products", "sliders", "categories"];
  const missing = required.filter((b) => !bucketNames.includes(b));

  if (missing.length > 0) {
    console.error(`\n❌ Missing buckets: ${missing.join(", ")}`);
    console.error("   Create them in Supabase dashboard → Storage → New bucket");
    console.error("   Set each bucket to PUBLIC so images are accessible");
    process.exit(1);
  }

  await migrateProducts();
  await migrateSliders();
  await migrateCategories();

  console.log("\n✅ Migration complete!");
  console.log("   Your DB now stores URLs instead of base64.");
  console.log("   Images are served from Supabase CDN.");
  console.log("   Page load times should drop from 2 minutes to under 2 seconds.");
}

main()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });