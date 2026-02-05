"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface Tag {
  id?: string;
  name: string;
  name_en?: string;
  slug: string;
  description?: string;
  color?: string;
}

interface TagDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (tag: Tag) => Promise<void>;
  tag?: Tag | null;
}

const colors = [
  { name: "Tím", value: "#8B5CF6" },
  { name: "Xanh dương", value: "#3B82F6" },
  { name: "Xanh lá", value: "#10B981" },
  { name: "Cam", value: "#F59E0B" },
  { name: "Đỏ", value: "#EF4444" },
  { name: "Hồng", value: "#EC4899" },
  { name: "Xám", value: "#6B7280" },
];

export default function TagDialog({
  open,
  onClose,
  onSave,
  tag,
}: TagDialogProps) {
  const [formData, setFormData] = useState<Tag>({
    name: "",
    name_en: "",
    slug: "",
    description: "",
    color: "#8B5CF6",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tag) {
      setFormData(tag);
    } else {
      setFormData({
        name: "",
        name_en: "",
        slug: "",
        description: "",
        color: "#8B5CF6",
      });
    }
  }, [tag, open]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {tag ? "Chỉnh sửa thẻ" : "Tạo thẻ mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name Vietnamese */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tên (Tiếng Việt) <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ví dụ: Lập trình"
            />
          </div>

          {/* Name English */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tên (English)
            </label>
            <input
              type="text"
              value={formData.name_en || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name_en: e.target.value }))
              }
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g: Programming"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, slug: e.target.value }))
              }
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="lap-trinh"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Mô tả
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Mô tả ngắn về thẻ này..."
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Màu sắc
            </label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, color: color.value }))
                  }
                  className={`w-8 h-8 rounded-lg transition-all ${
                    formData.color === color.value
                      ? "ring-2 ring-offset-2 ring-offset-background"
                      : "hover:scale-110"
                  }`}
                  style={{
                    backgroundColor: color.value,
                    ringColor: color.value,
                  }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang lưu..." : tag ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
