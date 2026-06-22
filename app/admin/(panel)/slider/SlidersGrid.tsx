"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Plus, X, Image as ImageIcon, Loader2, Link2 } from "lucide-react";
import ImageDropzone from "@/app/components/admin/ui/ImageDropzone";
import PageHeader from "@/app/components/admin/ui/PageHeader";
import EmptyState from "@/app/components/admin/ui/EmptyState";
import Field from "@/app/components/admin/ui/Field";

type Slider = {
  id: number;
  title: string;
  imageUrl: string;
  Button?: string | null;
  subtitle?: string | null;
  createdAt: string;
  updatedAt: string;
};

// Resizes to a sane max dimension and re-encodes as JPEG, returning a Blob
// ready to upload — this is what keeps the payload off the RSC/JSON wire
// entirely, instead of just shrinking a base64 string.
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

export default function SlidersGrid({ initialSliders }: { initialSliders: Slider[] }) {
  const router = useRouter();
  const [sliders, setSliders] = useState(initialSliders);
  const [submitting, setSubmitting] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [formData, setFormData] = useState({ title: "", imageUrl: "", Button: "", subtitle: "" });
  const [imagePreview, setImagePreview] = useState("");
  const [imageChanged, setImageChanged] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/slider");
    const data = await res.json();
    setSliders(data.sliders || []);
    router.refresh();
  };

  const handleImageFile = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) return alert("Image is too large (max 15MB before compression)");
    setCompressing(true);
    try {
      const compressedBlob = await compressImage(file);

      // Instant local preview without waiting for the upload round-trip
      const localPreviewUrl = URL.createObjectURL(compressedBlob);
      setImagePreview(localPreviewUrl);

      const uploadForm = new FormData();
      uploadForm.append("file", compressedBlob, "slider.jpg");

      const res = await fetch("/api/slider/upload", {
        method: "POST",
        body: uploadForm,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      const { url } = await res.json();
      setFormData((f) => ({ ...f, imageUrl: url }));
      setImageChanged(true);
    } catch (err: any) {
      alert(err.message || "Could not process that image — try a different file");
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) return alert("Please upload an image");

    setSubmitting(true);
    try {
      const url = editingSlider ? `/api/slider/${editingSlider.id}` : "/api/slider";
      const method = editingSlider ? "PUT" : "POST";
      const payload =
        editingSlider && !imageChanged
          ? { title: formData.title, Button: formData.Button, subtitle: formData.subtitle }
          : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await refresh();
        closeModal();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save slider");
      }
    } catch {
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this slider?")) return;
    try {
      const res = await fetch(`/api/slider/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSliders((prev) => prev.filter((s) => s.id !== id));
        router.refresh();
      } else {
        alert("Failed to delete slider");
      }
    } catch {
      alert("Error deleting slider");
    }
  };

  const openCreateModal = () => {
    setEditingSlider(null);
    setFormData({ title: "", imageUrl: "", Button: "", subtitle: "" });
    setImagePreview("");
    setImageChanged(false);
    setShowModal(true);
  };

  const openEditModal = (slider: Slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      imageUrl: slider.imageUrl,
      Button: slider.Button || "",
      subtitle: slider.subtitle || "",
    });
    setImagePreview(slider.imageUrl);
    setImageChanged(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSlider(null);
    setFormData({ title: "", imageUrl: "", Button: "", subtitle: "" });
    setImagePreview("");
    setImageChanged(false);
    setSubmitting(false);
  };

  return (
    <div>
      <PageHeader
        title="Hero Slider"
        subtitle="Manage your homepage hero banners"
        action={
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add Slider
          </button>
        }
      />

      {sliders.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No sliders yet"
          description="Create your first homepage hero banner."
          action={
            <button onClick={openCreateModal} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
              Create Slider
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sliders.map((slider) => (
            <div key={slider.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="relative h-48">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slider.imageUrl} alt={slider.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-5">
                <h3 className="mb-0.5 line-clamp-1 text-sm font-semibold text-slate-800">{slider.title}</h3>
                {slider.subtitle && <p className="mb-3 line-clamp-1 text-xs text-slate-500">{slider.subtitle}</p>}
                {slider.Button && (
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    <Link2 className="h-3 w-3" /> {slider.Button}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(slider)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(slider.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-50 py-2 text-xs font-medium text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="p-7">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  {editingSlider ? "Edit Slider" : "Create New Slider"}
                </h2>
                <button onClick={closeModal} disabled={submitting} className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Title" required>
                  <input
                    type="text"
                    required
                    disabled={submitting}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    placeholder="Summer Collection 2026"
                  />
                </Field>
                <Field label="Subtitle">
                  <input
                    type="text"
                    disabled={submitting}
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="input"
                    placeholder="Up to 50% off on selected items"
                  />
                </Field>
                <Field label="Button Text (Optional)">
                  <input
                    type="text"
                    disabled={submitting}
                    value={formData.Button}
                    onChange={(e) => setFormData({ ...formData, Button: e.target.value })}
                    className="input"
                    placeholder="Shop Now"
                  />
                </Field>

                <div>
                  <ImageDropzone
                    label="Image"
                    required
                    preview={imagePreview}
                    onFile={handleImageFile}
                    onRemove={() => {
                      setFormData({ ...formData, imageUrl: "" });
                      setImagePreview("");
                      setImageChanged(true);
                    }}
                  />
                  {compressing && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-600">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading image...
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || compressing}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> {editingSlider ? "Updating..." : "Creating..."}
                      </>
                    ) : editingSlider ? (
                      "Update Slider"
                    ) : (
                      "Create Slider"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}