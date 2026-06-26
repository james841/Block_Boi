// app/components/admin/ui/uploadImage.ts
// Shared utility — compress in browser then upload to Supabase Storage
// Used by: Add/Edit Product, Slider, Category forms

function compressImage(file: File, maxDimension = 1920, quality = 0.78): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

// uploadEndpoint: "/api/slider/upload" | "/api/Products/upload" | "/api/CategoriesShowcase/upload"
export async function compressAndUpload(
  file: File,
  uploadEndpoint: string
): Promise<string> {
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Image is too large (max 15MB)");
  }

  // Compress in browser first — reduces a 3MB photo to ~150KB
  const blob = await compressImage(file);

  // Upload compressed blob to Supabase Storage via your API route
  const form = new FormData();
  form.append("file", blob, "image.jpg");

  const res = await fetch(uploadEndpoint, { method: "POST", body: form });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || `Upload failed (${res.status})`);
  }

  const { url } = await res.json();
  if (!url) throw new Error("No URL returned from upload");

  return url; // This is the Supabase CDN URL stored in the DB
}