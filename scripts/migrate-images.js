// scripts/migrate-images.js
// Fetches ONE product at a time to avoid statement timeout on large base64 payloads
// Run with: node --env-file=.env.local scripts/migrate-images.js

const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function isBase64(str) {
  return str && str.startsWith('data:');
}

function base64ToBuffer(dataUri) {
  const [header, data] = dataUri.split(',');
  const mimeType = header.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
  const ext = mimeType.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
  return { buffer: Buffer.from(data, 'base64'), mimeType, ext };
}

async function upload(buffer, mimeType, ext, bucket, prefix) {
  const fileName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(fileName, buffer, {
    contentType: mimeType,
    cacheControl: '31536000',
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return supabase.storage.from(bucket).getPublicUrl(fileName).data.publicUrl;
}

async function migrateProducts() {
  console.log('\n📦 Migrating Products...');

  // Get just IDs first — no base64 payload in this query
  const ids = await prisma.product.findMany({ select: { id: true } });
  console.log(`  Found ${ids.length} products`);

  let updated = 0;
  let skipped = 0;

  for (const { id } of ids) {
    // Fetch one product at a time to avoid timeout
    const p = await prisma.product.findUnique({
      where: { id },
      select: { id: true, name: true, imageUrl: true, images: true },
    });
    if (!p) continue;

    const updates = {};

    if (isBase64(p.imageUrl)) {
      try {
        const { buffer, mimeType, ext } = base64ToBuffer(p.imageUrl);
        updates.imageUrl = await upload(buffer, mimeType, ext, 'products', `product-${p.id}`);
        console.log(`  ✅ Product ${p.id} (${p.name}) main image`);
      } catch (e) {
        console.error(`  ❌ Product ${p.id} main image: ${e.message}`);
      }
    }

    if (p.images?.some(isBase64)) {
      const newImages = [];
      for (let i = 0; i < p.images.length; i++) {
        if (isBase64(p.images[i])) {
          try {
            const { buffer, mimeType, ext } = base64ToBuffer(p.images[i]);
            newImages.push(await upload(buffer, mimeType, ext, 'products', `product-${p.id}-g${i}`));
            console.log(`  ✅ Product ${p.id} gallery[${i}]`);
          } catch (e) {
            console.error(`  ❌ Product ${p.id} gallery[${i}]: ${e.message}`);
            newImages.push(p.images[i]);
          }
        } else {
          newImages.push(p.images[i]);
        }
      }
      updates.images = newImages;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.product.update({ where: { id: p.id }, data: updates });
      updated++;
    } else {
      skipped++;
    }

    // Small delay between products to avoid hammering the DB
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`  📊 Products: ${updated} updated, ${skipped} already had URLs`);
}

async function migrateSliders() {
  console.log('\n🖼️  Migrating Sliders...');
  const sliders = await prisma.slider.findMany({ select: { id: true, title: true, imageUrl: true } });
  let updated = 0, skipped = 0;

  for (const s of sliders) {
    if (!isBase64(s.imageUrl)) { skipped++; continue; }
    try {
      const { buffer, mimeType, ext } = base64ToBuffer(s.imageUrl);
      const url = await upload(buffer, mimeType, ext, 'sliders', `slider-${s.id}`);
      await prisma.slider.update({ where: { id: s.id }, data: { imageUrl: url } });
      console.log(`  ✅ Slider ${s.id} (${s.title})`);
      updated++;
    } catch (e) {
      console.error(`  ❌ Slider ${s.id}: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  console.log(`  📊 Sliders: ${updated} updated, ${skipped} already had URLs`);
}

async function migrateCategories() {
  console.log('\n📁 Migrating Categories...');
  const categories = await prisma.categoryShowcase.findMany({ select: { id: true, title: true, imageUrl: true } });
  let updated = 0, skipped = 0;

  for (const c of categories) {
    if (!isBase64(c.imageUrl)) { skipped++; continue; }
    try {
      const { buffer, mimeType, ext } = base64ToBuffer(c.imageUrl);
      const url = await upload(buffer, mimeType, ext, 'categories', `category-${c.id}`);
      await prisma.categoryShowcase.update({ where: { id: c.id }, data: { imageUrl: url } });
      console.log(`  ✅ Category ${c.id} (${c.title})`);
      updated++;
    } catch (e) {
      console.error(`  ❌ Category ${c.id}: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  console.log(`  📊 Categories: ${updated} updated, ${skipped} already had URLs`);
}

async function main() {
  console.log('🚀 Starting migration (one record at a time to avoid timeouts)...');

  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) { console.error('❌ Supabase Storage error:', error.message); process.exit(1); }

  const names = buckets.map(b => b.name);
  const missing = ['products', 'sliders', 'categories'].filter(b => !names.includes(b));
  if (missing.length) {
    console.error(`❌ Missing buckets: ${missing.join(', ')} — create them in Supabase Storage first`);
    process.exit(1);
  }

  await migrateProducts();
  await migrateSliders();
  await migrateCategories();

  console.log('\n✅ Migration complete!');
}

main()
  .catch(e => { console.error('Fatal error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());