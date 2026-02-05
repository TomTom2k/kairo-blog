"use client";

import { useEffect, useState } from "react";
import { postService, Post } from "@/services/post-service";
import { tagService, Tag } from "@/services/tag-service";
import { TagFilter } from "@/components/blog/TagFilter";
import PostCard from "@/components/home/PostCard";
import { Loader2 } from "lucide-react";

export default function BlogListPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tagsData, postsData] = await Promise.all([
          tagService.getAll(),
          postService.getAll({ status: "published", pageSize: 100 }),
        ]);
        setTags(tagsData);
        setPosts(postsData.posts);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTagSelect = async (tagId: string | null) => {
    setSelectedTagId(tagId);
    setLoadingPosts(true);
    try {
      if (tagId) {
        const data = await postService.getByTag({ tagId, pageSize: 100 });
        setPosts(data.posts);
      } else {
        const data = await postService.getAll({
          status: "published",
          pageSize: 100,
        });
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Failed to fetch posts by tag:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-secondary/50 to-background border-b border-border/50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Tất cả bài viết
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Khám phá kiến thức, kinh nghiệm và những câu chuyện thú vị về công
            nghệ và cuộc sống.
          </p>

          <div className="flex justify-center">
            <TagFilter
              tags={tags}
              selectedTagId={selectedTagId}
              onTagSelect={handleTagSelect}
            />
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {loadingPosts ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground animate-pulse">
                Đang tìm bài viết...
              </p>
            </div>
          ) : posts.length > 0 ? (
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
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
