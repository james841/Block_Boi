# CLAUDE.md
# Wine & Carbon — E-Commerce Platform

This file is read by Claude Code on every session. Keep it up to date as the project evolves.

---

## What This Project Is

A full-stack e-commerce store for Wine & Carbon, built on:

- **Next.js 15 App Router** (TypeScript, Server Components by default)
- **Prisma ORM** → **Supabase PostgreSQL** (connection pooler on port 6543)
- **Upstash Redis** for caching (import from `@/lib/redis`)
- **Supabase Storage** for images (never base64 — see Images rule below)
- **NextAuth.js** for customer/storefront sessions
- **Custom admin auth** (`@/lib/adminAuth` — `getAdminSession()`) for the admin panel
- **Tailwind CSS** for all styling

---

## Folder Structure

```
app/
  (panel)/              # Admin route group — persistent layout, no URL segment
    dashboard/          # Orders + stats + fulfillment gauge
    products/           # Server Component list + ProductsTable client
    products/add/
    products/edit/[id]/
    slider/             # Hero slider management
    CategoryShowcase/   # Homepage category cards
  api/
    admin/              # login, logout, me, stats
    Products/           # GET (cached), POST, PUT, DELETE, PATCH
    Products/[id]/      # Single product CRUD
    slider/             # GET (Redis-cached), POST
    slider/[id]/        # PUT, DELETE
    slider/upload/      # Multipart upload → Supabase Storage
    CategoriesShowcase/ # GET, POST
    CategoriesShowcase/[id]/ # PUT, DELETE
    orders/             # Customer orders
    orders/[id]/        # PATCH status
    exchange-rates/     # NGN/USD/EUR/GBP rates (cached)
  components/
    HeroSlider.tsx      # Server Component, Redis-cached, Next.js Image priority
    admin/
      AdminSidebar.tsx
      AdminTopbar.tsx
      AdminAuthContext.tsx
      ui/               # StatCard, Badge, EmptyState, PageHeader,
                        # ImageDropzone, Field, TagInput, DonutGauge
lib/
  prisma.ts             # SINGLETON PATTERN — never create PrismaClient elsewhere
  redis.ts              # Upstash Redis client
  adminAuth.ts          # getAdminSession(), setAdminSession(), clearAdminSession()
  supabaseAdmin.ts      # Supabase service-role client for server-side uploads
```

---

## Critical Rules

### 1. Prisma — always use the singleton
```ts
// CORRECT
import { prisma } from "@/lib/prisma";

// WRONG — never do this anywhere in the codebase
const prisma = new PrismaClient();
```
The singleton in `lib/prisma.ts` caches the client on `globalThis` to survive
Next.js Fast Refresh hot reloads. Creating a new instance per file exhausts the
5-connection pool and causes "Timed out fetching a new connection" 500 errors.

### 2. Admin auth — use getAdminSession(), never getServerSession()
The admin panel uses a custom cookie-based auth system, not NextAuth.

```ts
// CORRECT — for all admin API routes
import { getAdminSession } from "@/lib/adminAuth";
const session = await getAdminSession();
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

// WRONG — this checks NextAuth (customer sessions), will always 401 in admin
import { getServerSession } from "next-auth";
```

Every single admin mutation route (POST, PUT, DELETE) must use `getAdminSession()`.
GET routes that are public (homepage data, product listings) need no auth check.

### 3. Images — Supabase Storage URLs only, never base64
```ts
// CORRECT — store a URL string, serve via CDN
imageUrl: "https://xxx.supabase.co/storage/v1/object/public/sliders/abc.jpg"

// WRONG — destroys performance, bloats DB, causes 1.5MB+ RSC payloads
imageUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRgAB..."
```

Upload flow for all admin image uploads:
1. Browser compresses image via `<canvas>` (max 1920px, JPEG 78%) before upload
2. POST compressed blob to `/api/slider/upload` or `/api/products/upload`
3. Server uploads to Supabase Storage, returns a public URL
4. That URL is what gets stored in the DB

### 4. Redis cache invalidation pattern
Every route that mutates data must delete the relevant cache key:
```ts
import { redis } from "@/lib/redis";

// After any create/update/delete:
await redis.del("sliders:list");      // slider routes
await redis.del("products:featured"); // product routes
await redis.del("categories:list");   // category routes
```

Cache TTLs:
- Hero sliders: 3600s (1 hour)
- Featured products: 300s (5 minutes)  
- Categories: 21600s (6 hours)
- Exchange rates: 3600s (1 hour)

### 5. Server Components first — client only when needed
```ts
// Default: Server Component (no directive needed)
export default async function ProductsPage() { ... }

// Only add "use client" when you need: onClick, useState, useEffect, forms
"use client"
export default function ProductsTable({ initialProducts }) { ... }
```

The products, slider, and categories list pages are Server Components that
query Prisma directly and pass serialized data to client sub-components.
This means zero loading spinner on first paint.

### 6. Date serialization across the server/client boundary
Prisma returns `Date` objects. Server Components cannot pass them directly
to client components as props — they must be serialized first:
```ts
const serialized = items.map((item) => ({
  ...item,
  createdAt: item.createdAt.toISOString(),
  updatedAt: item.updatedAt.toISOString(),
}));
```

### 7. Next.js Image for all images
```tsx
// Hero/above-the-fold: always use priority
<Image src={slide.imageUrl} alt={slide.title} fill priority sizes="100vw" quality={85} />

// Below the fold: lazy load
<Image src={product.imageUrl} alt={product.name} fill loading="lazy" sizes="(max-width: 768px) 100vw, 33vw" />

// Never use <img> for content images — only for user-avatar fallbacks or
// cases where the domain can't be whitelisted in next.config.js
```

---

## Database Models (confirmed from Prisma errors + route inspection)

```
Product         id, name, description, price, oldPrice, imageUrl, images[],
                colors[], sizes[], category, featuredOnHomepage, likes,
                shipping, returns, details, createdAt, updatedAt

Slider          id, title, subtitle, imageUrl, Button, createdAt, updatedAt

CategoryShowcase id, title, imageUrl, slug, createdAt, updatedAt

Admin           id, username, password, createdAt, updatedAt

Order           id, userName, userEmail, total, status, paymentStatus,
                isNew, shippingAddress{}, items[], createdAt, updatedAt
```

---

## Currency

- All prices are stored and displayed in **NGN (₦)**
- Exchange rates (NGN → USD/EUR/GBP) are fetched from exchangerate-api.com
  and cached in Redis + in-memory for 1 hour
- Always format prices as: `₦${price.toLocaleString()}`

---

## Homepage Performance Architecture

```
Visitor request
      ↓
Next.js static page (revalidate = 300 — refreshes every 5 min)
      ↓ (only on cache miss or revalidation)
Redis cache check
      ↓ (only on Redis miss)
Supabase DB query
      ↓
Images served from Supabase CDN (not base64, not the DB)
```

The homepage `app/page.tsx` must have:
```ts
export const revalidate = 300;
```

---

## Admin Panel Architecture

- Route group `app/admin/(panel)/` has a persistent layout (`layout.tsx`)
  that runs the auth check ONCE per session, not on every page navigation
- The sidebar and topbar never remount between admin page navigations
- Dashboard polls `/api/orders` every 30s for new orders
- Bell badge in topbar shows real `isNew` order count (also polled every 30s)
- All admin form pages use shared UI components from `app/components/admin/ui/`

---

## Design System

Admin panel colors (warm terracotta / GasWise-inspired):
```
Sidebar gradient:  #2A0E09 → #6E2310 → #C2410C  (165deg)
Topbar gradient:   #5C1E10 → #C2410C             (90deg)
Content background: #F8F3EC  (warm cream)
Icon chips:        #FBE7D8 bg / #C2410C icon
Active states:     bg-white/15 text-white (sidebar)
Card borders:      border-stone-200/70
```

Public storefront: follow the existing design system already in place.

---

## Common Mistakes to Avoid

| Mistake | Fix |
|---|---|
| `new PrismaClient()` outside lib/prisma.ts | Import `prisma` from `@/lib/prisma` |
| `getServerSession()` in admin routes | Use `getAdminSession()` from `@/lib/adminAuth` |
| Storing base64 in imageUrl fields | Upload to Supabase Storage, store URL |
| Passing Date objects as props to client components | `.toISOString()` before passing |
| `<img>` tags for content images | Use Next.js `<Image>` |
| Missing `router.refresh()` after mutations | Always call after `router.push()` on create/edit |
| `SELECT *` in performance-sensitive queries | `select: { id, name, price, imageUrl }` only |
| Fetching slider/product data client-side on first load | Server Component + `revalidate` |

---

## Environment Variables Required

```
DATABASE_URL=                    # Supabase pooler URL (port 6543)
DIRECT_URL=                      # Supabase direct URL (port 5432, for migrations)
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # Server-side uploads only, never expose to client
REDIS_URL=                       # Upstash Redis REST URL
REDIS_TOKEN=                     # Upstash Redis REST token
```