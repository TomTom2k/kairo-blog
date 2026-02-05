"use client";

import { useEffect, useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { storageService } from "@/services/storage-service";

const tagSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tên thẻ không được để trống"),
  slug: z.string().min(1, "Slug không được để trống"),
  description: z.string().optional(),
  image_url: z.string().optional(),
});

type TagFormValues = z.infer<typeof tagSchema>;

interface Tag {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

interface TagDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (tag: Tag) => Promise<void>;
  tag?: Tag | null;
}

export default function TagDialog({
  open,
  onClose,
  onSave,
  tag,
}: TagDialogProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      image_url: "",
    },
  });

  const nameValue = watch("name");
  const imageUrl = watch("image_url");

  useEffect(() => {
    if (tag && open) {
      reset({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description || "",
        image_url: tag.image_url || "",
      });
    } else if (open) {
      reset({
        name: "",
        slug: "",
        description: "",
        image_url: "",
      });
    }
  }, [tag, open, reset]);

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

  // Auto-generate slug when name changes
  useEffect(() => {
    if (nameValue && !tag) {
      // Only auto-generate for new tags
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, setValue, tag]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // If there's an existing image, delete it first (optional, but good for cleanup)
      if (imageUrl) {
        await storageService.deleteTagImage(imageUrl);
      }
      const url = await storageService.uploadTagImage(file);
      setValue("image_url", url);
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    if (imageUrl) {
      try {
        await storageService.deleteTagImage(imageUrl);
        setValue("image_url", "");
      } catch (error) {
        console.error("Failed to delete image:", error);
      }
    }
  };

  const onSubmit = async (data: TagFormValues) => {
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error("Failed to save tag:", error);
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
      <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-4 space-y-4 overflow-y-auto"
        >
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Ảnh đại diện
            </label>
            <div className="relative aspect-video rounded-xl border-2 border-dashed border-border overflow-hidden bg-muted/50 group">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-all"
                      title="Đổi ảnh"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-2 rounded-full bg-destructive/80 hover:bg-destructive text-white transition-all"
                      title="Xóa ảnh"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Tải ảnh lên
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tên thẻ <span className="text-destructive">*</span>
            </label>
            <input
              {...register("name")}
              type="text"
              className={`w-full px-3 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.name
                  ? "border-destructive focus:ring-destructive"
                  : "border-input"
              }`}
              placeholder="Ví dụ: Lập trình"
            />
            {errors.name && (
              <p className="text-xs text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Slug
            </label>
            <input
              {...register("slug")}
              type="text"
              className={`w-full px-3 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.slug
                  ? "border-destructive focus:ring-destructive"
                  : "border-input"
              }`}
              placeholder="lap-trinh"
            />
            {errors.slug && (
              <p className="text-xs text-destructive mt-1">
                {errors.slug.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Mô tả
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Nhập mô tả cho danh mục này..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang lưu..." : tag ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
