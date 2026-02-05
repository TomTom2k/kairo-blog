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

interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface PostData {
  id?: string;
  title: string;
  title_en?: string;
  slug: string;
  content: string;
  content_en?: string;
  excerpt?: string;
  excerpt_en?: string;
  published: boolean;
  featured_image?: string;
  // SEO Fields
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  og_image?: string;
  focus_keywords?: string;
  // Relations
  tag_ids?: string[];
}

interface PostEditorProps {
  postId?: string;
}

export default function PostEditor({ postId }: PostEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSEO, setShowSEO] = useState(false);
  const [activeTab, setActiveTab] = useState<"vi" | "en">("vi");

  const [formData, setFormData] = useState<PostData>({
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
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

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
      setFormData({
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

  const handleTitleChange = (value: string, lang: "vi" | "en") => {
    if (lang === "vi") {
      setFormData((prev) => ({
        ...prev,
        title: value,
        slug: generateSlug(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        title_en: value,
      }));
    }
  };

  const handleSave = async (publish: boolean = false) => {
    setSaving(true);
    try {
      const postData = {
        title: formData.title,
        title_en: formData.title_en,
        slug: formData.slug,
        content: formData.content,
        content_en: formData.content_en,
        excerpt: formData.excerpt,
        excerpt_en: formData.excerpt_en,
        published: publish ? true : formData.published,
        featured_image: formData.featured_image,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        canonical_url: formData.canonical_url,
        og_image: formData.og_image,
        focus_keywords: formData.focus_keywords,
      };

      let savedPostId = formData.id;

      if (formData.id) {
        await supabase.from("posts").update(postData).eq("id", formData.id);
      } else {
        const { data } = await supabase
          .from("posts")
          .insert(postData)
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
    } finally {
      setSaving(false);
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
    if (formData.meta_title) score += 25;
    if (formData.meta_description) score += 25;
    if (formData.focus_keywords) score += 25;
    if (formData.og_image || formData.featured_image) score += 25;
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
        subtitle={formData.title || "Chưa có tiêu đề"}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
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
                onClick={() => handleSave(false)}
                disabled={saving || !formData.title}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                Lưu nháp
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving || !formData.title}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                {saving ? "Đang lưu..." : "Xuất bản"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Language Tabs */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                <button
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
                  type="text"
                  value={
                    activeTab === "vi"
                      ? formData.title
                      : formData.title_en || ""
                  }
                  onChange={(e) => handleTitleChange(e.target.value, activeTab)}
                  placeholder={
                    activeTab === "vi"
                      ? "Nhập tiêu đề bài viết..."
                      : "Enter post title..."
                  }
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
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
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }))
                      }
                      className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nội dung
                </label>
                <textarea
                  value={
                    activeTab === "vi"
                      ? formData.content
                      : formData.content_en || ""
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [activeTab === "vi" ? "content" : "content_en"]:
                        e.target.value,
                    }))
                  }
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
                  value={
                    activeTab === "vi"
                      ? formData.excerpt || ""
                      : formData.excerpt_en || ""
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [activeTab === "vi" ? "excerpt" : "excerpt_en"]:
                        e.target.value,
                    }))
                  }
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
                        type="text"
                        value={formData.meta_title || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            meta_title: e.target.value,
                          }))
                        }
                        placeholder="Tiêu đề hiển thị trên Google..."
                        maxLength={60}
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {(formData.meta_title || "").length}/60 ký tự
                      </p>
                    </div>

                    {/* Meta Description */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <FileText className="w-4 h-4 inline mr-1" />
                        Meta Description
                      </label>
                      <textarea
                        value={formData.meta_description || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            meta_description: e.target.value,
                          }))
                        }
                        placeholder="Mô tả ngắn hiển thị trên kết quả tìm kiếm..."
                        maxLength={160}
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {(formData.meta_description || "").length}/160 ký tự
                      </p>
                    </div>

                    {/* Focus Keywords */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        <SearchIcon className="w-4 h-4 inline mr-1" />
                        Focus Keywords
                      </label>
                      <input
                        type="text"
                        value={formData.focus_keywords || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            focus_keywords: e.target.value,
                          }))
                        }
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
                        type="url"
                        value={formData.canonical_url || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            canonical_url: e.target.value,
                          }))
                        }
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
                        type="url"
                        value={formData.og_image || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            og_image: e.target.value,
                          }))
                        }
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
                          {formData.meta_title ||
                            formData.title ||
                            "Tiêu đề bài viết"}
                        </p>
                        <p className="text-emerald-700 text-sm">
                          yourblog.com › blog ›{" "}
                          {formData.slug || "url-bai-viet"}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {formData.meta_description ||
                            formData.excerpt ||
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
                {formData.featured_image ? (
                  <div className="relative">
                    <img
                      src={formData.featured_image}
                      alt="Featured"
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, featured_image: "" }))
                      }
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
                        setFormData((prev) => ({
                          ...prev,
                          featured_image: e.target.value,
                        }))
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
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        published: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="text-foreground">Đã xuất bản</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
