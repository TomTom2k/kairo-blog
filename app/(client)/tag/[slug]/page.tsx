"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { postService, Post } from "@/services/post-service";
import { tagService, Tag } from "@/services/tag-service";
import PostCard from "@/components/home/PostCard";
import { Loader2, Tags } from "lucide-react";

export default function TagPage() {
  const { slug } = useParams();
  const [tag, setTag] = useState<Tag | null>(null);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        const [tagData, tagsListData] = await Promise.all([
          tagService.getBySlug(slug as string),
          tagService.getAll(),
        ]);

        setTag(tagData);
        setAllTags(tagsListData);

        if (tagData) {
          const postsData = await postService.getByTag({
            tagId: tagData.id,
            pageSize: 100,
          });
          setPosts(postsData.posts);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Tags className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-serif font-bold mb-2">
          Không tìm thấy chủ đề
        </h1>
        <p className="text-muted-foreground mb-6">
          Chủ đề bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <a
          href="/blog"
          className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all"
        >
          Xem tất cả bài viết
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Tag Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-secondary/50 to-background border-b border-border/50">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <Tags className="w-4 h-4" />
            Chủ đề
          </div>

          {/* Quick Switch Tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
            <a
              href="/blog"
              className="px-4 py-1.5 rounded-full text-sm font-medium bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-all whitespace-nowrap"
            >
              Tất cả
            </a>
            {allTags.map((t) => (
              <a
                key={t.id}
                href={`/tag/${t.slug}`}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  t.slug === slug
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105"
                    : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                }`}
              >
                {t.name}
              </a>
            ))}
          </div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            {tag.name}
          </h1>
          {tag.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {tag.description}
            </p>
          )}
          <div className="mt-8 text-sm text-muted-foreground">
            {posts.length} bài viết
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {posts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => {
                const lang = post.languages.vi || post.languages.en;
                if (!lang) return null;
                return (
                  <PostCard
                    key={post.id}
                    title={lang.title}
                    excerpt={lang.excerpt}
                    date={new Date(post.created_at).toLocaleDateString(
                      "vi-VN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                    readTime="5 phút đọc"
                    tags={post.tags?.map((t) => t.name) || []}
                    imageUrl={
                      post.thumbnail ||
                      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop"
                    }
                    slug={post.slug}
                    index={index}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-card border border-dashed border-border rounded-2xl">
              <p className="text-muted-foreground text-lg">
                Chưa có bài viết nào cho chủ đề này.
              </p>
              <a
                href="/blog"
                className="inline-block mt-4 text-primary font-medium hover:underline"
              >
                Khám phá các chủ đề khác
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
