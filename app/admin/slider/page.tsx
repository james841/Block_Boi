"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  Edit,
  Plus,
  X,
  ArrowLeft,
  ImageIcon,
  Link2,
  Upload,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Slider = {
  id: number;
  title: string;
  imageUrl: string;
  Button?: string | null;
  subtitle?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function AdminSliderPage() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    Button: "",
    subtitle: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageChanged, setImageChanged] = useState(false); // Track if image was changed

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const res = await fetch("/api/slider");
      const data = await res.json();
      setSliders(data.sliders || []);
    } catch (error) {
      console.error("Failed to fetch sliders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Image upload handler
  const handleImageChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      // Check file size (max 5MB recommended)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, imageUrl: base64String });
        setImagePreview(base64String);
        setImageChanged(true); // Mark that image was changed
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      alert("Please upload an image");
      return;
    }

    setSubmitting(true);

    try {
      const url = editingSlider ? `/api/slider/${editingSlider.id}` : "/api/slider";
      const method = editingSlider ? "PUT" : "POST";

      // Prepare payload - only send imageUrl if it changed
      const payload = editingSlider && !imageChanged
        ? {
            title: formData.title,
            Button: formData.Button,
            subtitle: formData.subtitle,
            // Don't send imageUrl if it hasn't changed
          }
        : formData; // Send full data including imageUrl for new sliders or when image changed

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        await fetchSliders();
        closeModal();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save slider");
      }
    } catch (error) {
      console.error("Error saving slider:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this slider?")) return;

    try {
      const res = await fetch(`/api/slider/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchSliders();
      } else {
        alert("Failed to delete slider");
      }
    } catch (error) {
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
    setImageChanged(false); // Reset image changed flag
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
    <>
      <div className="mt-16 min-h-screen bg-gradient-to-r from-slate-800 to-slate-900 shadow-2xl border-b border-slate-700 text-white">
        {/* Header */}
        <div className="border-b border-white/10 backdrop-blur-lg bg-black/20">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Link
                href="/admin/dashboard"
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  Slider Management
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Manage your homepage hero sliders
                </p>
              </div>
            </div>

            <button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-3 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus size={20} />
              Add New Slider
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-64 bg-white/10" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-white/20 rounded-lg w-3/4" />
                    <div className="h-4 bg-white/10 rounded-lg w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : sliders.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 backdrop-blur-md mb-8">
                <ImageIcon className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-300 mb-3">No sliders yet</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Get started by creating your first beautiful hero slider.
              </p>
              <button
                onClick={openCreateModal}
                className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-medium flex items-center gap-3 mx-auto shadow-lg hover:shadow-xl transition-all"
              >
                <Plus size={22} />
                Create Your First Slider
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sliders.map((slider) => (
                <div
                  key={slider.id}
                  className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={slider.imageUrl}
                      alt={slider.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold drop-shadow-lg">{slider.title}</h3>
                      {slider.subtitle && <p className="text-sm opacity-90 drop-shadow">{slider.subtitle}</p>}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {slider.Button && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm">
                        <Link2 size={14} />
                        {slider.Button}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => openEditModal(slider)}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                      >
                        <Edit size={18} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(slider.id)}
                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-red-500/30"
                      >
                        <Trash2 size={18} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-white">
                    {editingSlider ? "Edit Slider" : "Create New Slider"}
                  </h2>
                  <button
                    onClick={closeModal}
                    disabled={submitting}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={submitting}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50"
                      placeholder="Summer Collection 2025"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle</label>
                    <input
                      type="text"
                      disabled={submitting}
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 disabled:opacity-50"
                      placeholder="Up to 50% off on selected items"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Button Text (Optional)
                    </label>
                    <input
                      type="text"
                      disabled={submitting}
                      value={formData.Button}
                      onChange={(e) => setFormData({ ...formData, Button: e.target.value })}
                      className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 disabled:opacity-50"
                      placeholder="Shop Now"
                    />
                  </div>

                  {/* IMAGE UPLOAD */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image <span className="text-red-400">*</span>
                      {editingSlider && !imageChanged && (
                        <span className="ml-2 text-xs text-green-400">(Using existing image)</span>
                      )}
                    </label>
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-white/50 transition-all bg-white/5"
                    >
                      <input
                        type="file"
                        accept="image/*"
                        disabled={submitting}
                        onChange={(e) => e.target.files?.[0] && handleImageChange(e.target.files[0])}
                        className="hidden"
                        id="slider-image-upload"
                      />
                      <label htmlFor="slider-image-upload" className="cursor-pointer block">
                        {imagePreview ? (
                          <div className="relative h-64 rounded-xl overflow-hidden border border-white/20">
                            <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                            {!submitting && (
                              <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p className="text-white font-medium">
                                  {imageChanged ? "Change Image" : "Click to change image"}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Upload className="w-12 h-12 mx-auto text-gray-400" />
                            <p className="text-gray-400">Drop your image here or click to browse</p>
                            <p className="text-xs text-gray-500">JPG, PNG, WebP • Max 5MB</p>
                          </div>
                        )}
                      </label>

                      {imagePreview && !submitting && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, imageUrl: "" });
                            setImagePreview("");
                            setImageChanged(true);
                          }}
                          className="mt-4 text-sm text-red-400 hover:text-red-300"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={submitting}
                      className="flex-1 px-6 py-4 border border-white/20 text-gray-300 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {editingSlider ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>{editingSlider ? "Update Slider" : "Create Slider"}</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}