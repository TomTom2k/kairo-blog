import { Post } from "@/services/post-service";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.languages.vi.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-muted-foreground font-medium italic">
              Kairo Blog
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <span className="text-white text-sm font-medium flex items-center gap-1">
            Đọc ngay <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 font-medium">
          <div className="flex items-center gap-1 border-r border-border pr-4">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(post.created_at).toLocaleDateString("vi-VN")}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>5 phút đọc</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {post.languages.vi.title}
        </h2>

        <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
          {post.languages.vi.excerpt || "Chưa có tóm tắt cho bài viết này..."}
        </p>

        <div className="flex flex-wrap gap-2 mt-auto">
          {post.tags?.map((tag: any) => (
            <span
              key={tag.id}
              className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
