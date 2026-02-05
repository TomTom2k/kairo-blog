"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const tagSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tên thẻ không được để trống"),
  slug: z.string().min(1, "Slug không được để trống"),
});

type TagFormValues = z.infer<typeof tagSchema>;

interface Tag {
  id?: string;
  name: string;
  slug: string;
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
    },
  });

  const nameValue = watch("name");

  useEffect(() => {
    if (tag && open) {
      reset({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      });
    } else if (open) {
      reset({
        name: "",
        slug: "",
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
      <div className="relative w-full max-w-sm mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
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
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tên thẻ <span className="text-destructive">*</span>
            </label>
            <input
              {...register("name")}
              type="text"
              autoFocus
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
              disabled={isSubmitting}
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
