import { postService } from "@/services/post-service";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Calendar, Clock, ArrowLeft, User, Eye, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LikeDislike } from "@/components/blog/LikeDislike";
import { CommentSection } from "@/components/blog/CommentSection";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetail({ params }: PostPageProps) {
  const { slug } = await params;
  let post;

  try {
    post = await postService.getBySlug(slug);
    // Increment view count (fire and forget)
    postService.incrementViewCount(slug).catch(console.error);
  } catch (error) {
    return notFound();
  }

  if (!post) return notFound();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Article Header */}
      <header className="relative w-full h-[50vh] min-h-[400px] mb-12">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.languages.vi.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-4xl font-bold italic text-muted-foreground/30">
              Kairo Blog
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full">
          <div className="container mx-auto px-4 max-w-4xl pb-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8 group"
            >
              <div className="p-2 rounded-full bg-background/50 border border-border group-hover:bg-primary/10 group-hover:border-primary/50 transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              Quay lại trang chủ
            </Link>

            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags?.map((tag: any) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider"
                >
                  {tag.name}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-8 leading-tight tracking-tight">
              {post.languages.vi.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-medium border-t border-border/50 pt-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-4 h-4" />
                </div>
                <span>By Kairo</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(post.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>8 phút đọc</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{post.views || 0} lượt xem</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col lg:flex-row gap-12 relative">
          {/* Main Content */}
          <article className="flex-1 min-w-0">
            {post.languages.vi.excerpt && (
              <div className="bg-muted/30 border-l-4 border-primary p-6 rounded-r-xl mb-12 italic text-lg text-muted-foreground">
                {post.languages.vi.excerpt}
              </div>
            )}

            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:scroll-mt-24 prose-img:rounded-3xl prose-pre:bg-muted prose-pre:rounded-2xl">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 className="text-4xl font-bold mt-8 mb-4" {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className="text-3xl font-bold mt-8 mb-4" {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className="text-2xl font-bold mt-6 mb-3" {...props} />
                  ),
                  p: ({ node, ...props }) => (
                    <p
                      className="mb-4 leading-relaxed whitespace-pre-wrap"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-6 mb-4" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-6 mb-4" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="mb-1" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-primary pl-4 italic my-6 text-muted-foreground"
                      {...props}
                    />
                  ),
                  code: ({
                    node,
                    inline,
                    className,
                    children,
                    ...props
                  }: any) => {
                    return !inline ? (
                      <pre className="p-4 rounded-xl bg-muted overflow-x-auto my-6">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code
                        className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {post.languages.vi.content}
              </ReactMarkdown>
            </div>

            {/* Engagement Section */}
            <div className="mt-16 pt-12 border-t border-border">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-foreground">
                  Bài viết này có hữu ích không?
                </h3>
              </div>

              <LikeDislike postId={post.id} />
            </div>

            {/* Comment Section */}
            <CommentSection postId={post.id} />
          </article>

          {/* Sidebar/Actions */}
          <aside className="lg:w-16 flex lg:flex-col gap-4 lg:sticky lg:top-24 h-fit">
            <button
              className="p-3 rounded-full border border-border bg-card hover:border-primary/50 hover:text-primary transition-all group"
              title="Chia sẻ"
            >
              <Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}
