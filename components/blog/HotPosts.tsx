import { Post } from "@/services/post-service";
import Link from "next/link";
import { Flame, Eye, TrendingUp } from "lucide-react";

interface HotPostsProps {
  posts: Post[];
}

export function HotPosts({ posts }: HotPostsProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <aside className="bg-gradient-to-br from-primary/5 to-secondary/5 border border-border rounded-3xl p-8 sticky top-24 h-fit">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <Flame className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">🔥 Đang Hot</h2>
      </div>

      <div className="space-y-4">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex gap-4 p-4 rounded-2xl hover:bg-card/80 border border-transparent hover:border-primary/30 transition-all duration-300"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/20">
              {index + 1}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {post.languages.vi.title}
              </h3>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{post.views || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-primary font-semibold">Hot</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
