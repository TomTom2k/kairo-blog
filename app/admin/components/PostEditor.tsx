"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import Header from "../components/Header";
import {
  Save,
  Eye,
  ArrowLeft,
  Image as ImageIcon,
  Globe,
  Search as SearchIcon,
  FileText,
  Link as LinkIcon,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const postSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Tiêu đề không được để trống"),
  title_en: z.string().optional(),
  slug: z.string().min(1, "Slug không được để trống"),
  content: z.string().optional(),
  content_en: z.string().optional(),
  excerpt: z.string().optional(),
  excerpt_en: z.string().optional(),
  published: z.boolean().default(false),
  featured_image: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  canonical_url: z.string().optional(),
  og_image: z.string().optional(),
  focus_keywords: z.string().optional(),
});

type PostFormValues = z.infer<typeof postSchema>;

interface Tag {
  id: string;
  name: string;
}

interface PostEditorProps {
  postId?: string;
}

export default function PostEditor({ postId }: PostEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSEO, setShowSEO] = useState(false);
  const [activeTab, setActiveTab] = useState<"vi" | "en">("vi");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      title_en: "",
      slug: "",
      content: "",
      content_en: "",
      excerpt: "",
      excerpt_en: "",
      published: false,
      featured_image: "",
      meta_title: "",
      meta_description: "",
      canonical_url: "",
      og_image: "",
      focus_keywords: "",
    },
  });

  const titleValue = watch("title");
  const metaTitleValue = watch("meta_title");
  const metaDescriptionValue = watch("meta_description");
  const focusKeywordsValue = watch("focus_keywords");
  const featuredImageValue = watch("featured_image");
  const ogImageValue = watch("og_image");
  const slugValue = watch("slug");
  const excerptValue = watch("excerpt");

  useEffect(() => {
    fetchTags();
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchTags = async () => {
    const { data } = await supabase.from("tags").select("*").order("name");
    setTags((data as Tag[]) || []);
  };

  const fetchPost = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("posts")
      .select("*, post_tags(tag_id)")
      .eq("id", postId)
      .single();

    if (data) {
      reset({
        id: data.id,
        title: data.title || "",
        title_en: data.title_en || "",
        slug: data.slug || "",
        content: data.content || "",
        content_en: data.content_en || "",
        excerpt: data.excerpt || "",
        excerpt_en: data.excerpt_en || "",
        published: data.published || false,
        featured_image: data.featured_image || "",
        meta_title: data.meta_title || "",
        meta_description: data.meta_description || "",
        canonical_url: data.canonical_url || "",
        og_image: data.og_image || "",
        focus_keywords: data.focus_keywords || "",
      });
      setSelectedTags(
        data.post_tags?.map((t: { tag_id: string }) => t.tag_id) || [],
      );
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Auto-generate slug when title changes (only for new posts)
  useEffect(() => {
    if (titleValue && !postId) {
      setValue("slug", generateSlug(titleValue));
    }
  }, [titleValue, setValue, postId]);

  const onSubmit = async (values: PostFormValues) => {
    try {
      let savedPostId = values.id;

      if (values.id) {
        await supabase.from("posts").update(values).eq("id", values.id);
      } else {
        const { data } = await supabase
          .from("posts")
          .insert(values)
          .select()
          .single();
        savedPostId = data?.id;
      }

      // Update tags
      if (savedPostId) {
        await supabase.from("post_tags").delete().eq("post_id", savedPostId);
        if (selectedTags.length > 0) {
          await supabase.from("post_tags").insert(
            selectedTags.map((tagId) => ({
              post_id: savedPostId,
              tag_id: tagId,
            })),
          );
        }
      }

      router.push("/admin/posts");
    } catch (error) {
      console.error("Failed to save post:", error);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const seoScore = (() => {
    let score = 0;
    if (metaTitleValue) score += 25;
    if (metaDescriptionValue) score += 25;
    if (focusKeywordsValue) score += 25;
    if (ogImageValue || featuredImageValue) score += 25;
    return score;
  })();

  if (loading) {
    return (
      <>
        <Header title="Đang tải..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={postId ? "Chỉnh sửa bài viết" : "Viết bài mới"}
        subtitle={titleValue || "Chưa có tiêu đề"}
      />

      <div className="flex-1 overflow-y-auto">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-6xl mx-auto p-6"
        >
          {/* Top Actions */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/admin/posts"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Link>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setValue("published", false);
                  handleSubmit(onSubmit)();
                }}
                disabled={isSubmitting || !titleValue}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Lưu nháp
              </button>
              <button
                type="submit"
                onClick={() => setValue("published", true)}
                disabled={isSubmitting || !titleValue}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                {isSubmitting ? "Đang lưu..." : "Xuất bản"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Language Tabs */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() => setActiveTab("vi")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "vi"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🇻🇳 Tiếng Việt
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("en")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === "en"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tiêu đề{" "}
                  {activeTab === "vi" && (
                    <span className="text-destructive">*</span>
                  )}
                </label>
                <input
                  {...register(activeTab === "vi" ? "title" : "title_en")}
                  type="text"
                  placeholder={
                    activeTab === "vi"
                      ? "Nhập tiêu đề bài viết..."
                      : "Enter post title..."
                  }
                  className={`w-full px-4 py-3 rounded-lg border bg-background text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    activeTab === "vi" && errors.title
                      ? "border-destructive focus:ring-destructive"
                      : "border-input"
                  }`}
                />
                {activeTab === "vi" && errors.title && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Slug */}
              {activeTab === "vi" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">/blog/</span>
                    <input
                      {...register("slug")}
                      type="text"
                      className={`flex-1 px-3 py-2 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.slug
                          ? "border-destructive focus:ring-destructive"
                          : "border-input"
                      }`}
                    />
                  </div>
                  {errors.slug && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.slug.message}
                    </p>
                  )}
                </div>
              )}

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nội dung
                </label>
                <textarea
                  {...register(activeTab === "vi" ? "content" : "content_en")}
                  rows={15}
                  placeholder={
                    activeTab === "vi"
                      ? "Viết nội dung bài viết của bạn..."
                      : "Write your post content..."
                  }
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tóm tắt
                </label>
                <textarea
                  {...register(activeTab === "vi" ? "excerpt" : "excerpt_en")}
                  rows={3}
                  placeholder={
                    activeTab === "vi"
                      ? "Tóm tắt ngắn gọn về bài viết..."
                      : "Brief summary of the post..."
                  }
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* SEO Section */}
              <div className="rounded-xl border border-border bg-card">
                <button
                  type="button"
                  onClick={() => setShowSEO(!showSEO)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <SearchIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        Cài đặt SEO
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tối ưu hóa cho công cụ tìm kiếm
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* SEO Score */}
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            seoScore >= 75
                              ? "bg-emerald-500"
                              : seoScore >= 50
                                ? "bg-orange-500"
                                : "bg-destructive"
                          }`}
                          style={{ width: `${seoScore}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground">
                        {seoScore}%
                      </span>
                    </div>
                    {showSEO ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {showSEO && (
                  <div className="p-4 pt-0 space-y-4 border-t border-border">
                    {/* Meta Title */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <Globe className="w-4 h-4 inline mr-1" />
                        Meta Title
                      </label>
                      <input
                        {...register("meta_title")}
                        type="text"
                        placeholder="Tiêu đề hiển thị trên Google..."
                        maxLength={60}
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {(metaTitleValue || "").length}/60 ký tự
                      </p>
                    </div>

                    {/* Meta Description */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <FileText className="w-4 h-4 inline mr-1" />
                        Meta Description
                      </label>
                      <textarea
                        {...register("meta_description")}
                        placeholder="Mô tả ngắn hiển thị trên kết quả tìm kiếm..."
                        maxLength={160}
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {(metaDescriptionValue || "").length}/160 ký tự
                      </p>
                    </div>

                    {/* Focus Keywords */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <SearchIcon className="w-4 h-4 inline mr-1" />
                        Focus Keywords
                      </label>
                      <input
                        {...register("focus_keywords")}
                        type="text"
                        placeholder="Từ khóa chính, từ khóa phụ, ..."
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Canonical URL */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <LinkIcon className="w-4 h-4 inline mr-1" />
                        Canonical URL
                      </label>
                      <input
                        {...register("canonical_url")}
                        type="url"
                        placeholder="https://yourblog.com/original-post"
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* OG Image */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <ImageIcon className="w-4 h-4 inline mr-1" />
                        OG Image URL
                      </label>
                      <input
                        {...register("og_image")}
                        type="url"
                        placeholder="https://yourblog.com/images/og-image.png"
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* SEO Preview */}
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-2">
                        Xem trước Google
                      </p>
                      <div className="space-y-1">
                        <p className="text-blue-600 text-lg hover:underline cursor-pointer line-clamp-1">
                          {metaTitleValue || titleValue || "Tiêu đề bài viết"}
                        </p>
                        <p className="text-emerald-700 text-sm">
                          yourblog.com › blog › {slugValue || "url-bai-viet"}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {metaDescriptionValue ||
                            excerptValue ||
                            "Mô tả bài viết sẽ hiển thị ở đây..."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Featured Image */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground mb-3">
                  Ảnh đại diện
                </h3>
                {featuredImageValue ? (
                  <div className="relative">
                    <img
                      src={featuredImageValue}
                      alt="Featured"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setValue("featured_image", "")}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Chưa có ảnh đại diện
                    </p>
                    <input
                      type="url"
                      placeholder="Nhập URL ảnh..."
                      onChange={(e) =>
                        setValue("featured_image", e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground mb-3">Thẻ</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        selectedTags.includes(tag.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Chưa có thẻ nào
                    </p>
                  )}
                </div>
                <Link
                  href="/admin/tags"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-3"
                >
                  <Plus className="w-4 h-4" />
                  Quản lý thẻ
                </Link>
              </div>

              {/* Status */}
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground mb-3">
                  Trạng thái
                </h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    {...register("published")}
                    type="checkbox"
                    className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="text-foreground">Đã xuất bản</span>
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
