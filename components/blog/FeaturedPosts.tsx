import { Post } from "@/services/post-service";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

interface FeaturedPostsProps {
  posts: Post[];
}

export function FeaturedPosts({ posts }: FeaturedPostsProps) {
  if (!posts || posts.length === 0) return null;

  const [mainPost, ...otherPosts] = posts;

  return (
    <section className="mb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-foreground">✨ Nổi bật</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Featured Post */}
        <Link
          href={`/blog/${mainPost.slug}`}
          className="lg:col-span-2 group relative overflow-hidden rounded-3xl bg-card border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
        >
          <div className="aspect-[21/9] relative overflow-hidden">
            {mainPost.thumbnail ? (
              <img
                src={mainPost.thumbnail}
                alt={mainPost.languages.vi.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 p-8 w-full">
            <div className="flex flex-wrap gap-2 mb-4">
              {mainPost.tags?.slice(0, 3).map((tag: any) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 rounded-full bg-primary/20 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider border border-white/20"
                >
                  {tag.name}
                </span>
              ))}
            </div>

            <h3 className="text-3xl font-bold text-white mb-3 line-clamp-2 group-hover:text-primary/90 transition-colors">
              {mainPost.languages.vi.title}
            </h3>

            <p className="text-gray-200 text-sm line-clamp-2 mb-4">
              {mainPost.languages.vi.excerpt || ""}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(mainPost.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <span className="flex items-center gap-1 text-white font-medium">
                Đọc thêm{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </Link>

        {/* Other Featured Posts */}
        <div className="flex flex-col gap-6">
          {otherPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex gap-4 bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 p-4"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                {post.thumbnail ? (
                  <img
                    src={post.thumbnail}
                    alt={post.languages.vi.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-foreground mb-2 line-clamp-2 text-sm group-hover:text-primary transition-colors">
                  {post.languages.vi.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(post.created_at).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
