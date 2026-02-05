import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  Calendar,
  Clock,
  ArrowLeft,
  User,
  Eye,
  Share2,
  Bookmark,
  Tag,
} from "lucide-react";
import { postService } from "@/services/post-service";
import { Button } from "@/components/ui/Button";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await postService.getBySlug(slug);
    const lang = post.languages.vi || post.languages.en;

    if (!lang) {
      return {
        title: "Bài viết không tồn tại",
      };
    }

    const title = lang.meta_title || lang.title;
    const description = lang.meta_description || lang.excerpt;
    const ogImage = lang.og_image || post.thumbnail;

    return {
      title: `${title} | Kairo's Blog`,
      description,
      keywords: lang.focus_keywords?.split(",").map((k) => k.trim()),
      authors: [{ name: "Thành Tín" }],
      openGraph: {
        title,
        description,
        type: "article",
        publishedTime: post.published_at || post.created_at,
        modifiedTime: post.updated_at,
        authors: ["Thành Tín"],
        images: ogImage
          ? [
              {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: title,
              },
            ]
          : [],
        siteName: "Kairo's Blog",
        locale: "vi_VN",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ogImage ? [ogImage] : [],
      },
      alternates: {
        canonical: lang.canonical_url || `/blog/${slug}`,
      },
    };
  } catch {
    return {
      title: "Bài viết không tồn tại | Kairo's Blog",
    };
  }
}

// Estimate reading time based on content length
function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} phút đọc`;
}

export default async function BlogDetail({ params }: PostPageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await postService.getBySlug(slug);
    // Increment view count (fire and forget)
    postService.incrementViewCount(slug).catch(console.error);
  } catch {
    notFound();
  }

  if (!post) {
    notFound();
  }

  const lang = post.languages.vi || post.languages.en;
  if (!lang) {
    notFound();
  }

  const readingTime = calculateReadingTime(lang.content || "");

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: lang.title,
    description: lang.excerpt,
    image: post.thumbnail,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: {
      "@type": "Person",
      name: "Thành Tín",
    },
    publisher: {
      "@type": "Organization",
      name: "Kairo's Blog",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `/blog/${slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen bg-background">
        {/* Hero Section */}
        <header className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
          {post.thumbnail ? (
            <img
              src={post.thumbnail}
              alt={lang.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center">
              <span className="text-6xl font-serif font-bold text-muted-foreground/20">
                Kairo's Blog
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          {/* Header Content */}
          <div className="absolute bottom-0 left-0 w-full">
            <div className="container mx-auto px-4 max-w-4xl pb-12">
              {/* Back Button */}
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8 group"
              >
                <div className="p-2 rounded-full bg-background/50 backdrop-blur-sm border border-border group-hover:bg-primary/10 group-hover:border-primary/50 transition-all">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                Quay lại trang chủ
              </Link>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag: any) => (
                    <Link
                      key={tag.id}
                      href={`/tag/${tag.slug}`}
                      className="px-3 py-1.5 rounded-full bg-primary/10 backdrop-blur-sm text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors"
                    >
                      <Tag className="w-3 h-3 inline mr-1" />
                      {tag.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-8 leading-tight tracking-tight">
                {lang.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-medium border-t border-border/50 pt-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                    TT
                  </div>
                  <div>
                    <span className="block text-foreground font-semibold">
                      Thành Tín
                    </span>
                    <span className="text-xs">Tác giả</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.created_at}>
                    {new Date(post.created_at).toLocaleDateString("vi-VN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{readingTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.views || 0} lượt xem</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 max-w-4xl py-12">
          {/* Excerpt / Lead */}
          {lang.excerpt && (
            <div className="bg-muted/30 border-l-4 border-primary p-6 rounded-r-xl mb-12 italic text-lg text-muted-foreground leading-relaxed">
              {lang.excerpt}
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-serif prose-headings:scroll-mt-24 prose-img:rounded-2xl prose-img:shadow-lg prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:py-1 prose-blockquote:rounded-r-lg prose-pre:bg-muted prose-pre:rounded-xl prose-code:text-primary prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                h1: ({ children, ...props }) => (
                  <h1
                    className="text-4xl font-bold mt-12 mb-6 text-foreground"
                    {...props}
                  >
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }) => (
                  <h2
                    className="text-3xl font-bold mt-10 mb-5 text-foreground"
                    {...props}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children, ...props }) => (
                  <h3
                    className="text-2xl font-semibold mt-8 mb-4 text-foreground"
                    {...props}
                  >
                    {children}
                  </h3>
                ),
                p: ({ children, ...props }) => (
                  <p
                    className="mb-6 leading-relaxed text-muted-foreground"
                    {...props}
                  >
                    {children}
                  </p>
                ),
                ul: ({ children, ...props }) => (
                  <ul className="list-disc pl-6 mb-6 space-y-2" {...props}>
                    {children}
                  </ul>
                ),
                ol: ({ children, ...props }) => (
                  <ol className="list-decimal pl-6 mb-6 space-y-2" {...props}>
                    {children}
                  </ol>
                ),
                li: ({ children, ...props }) => (
                  <li className="text-muted-foreground" {...props}>
                    {children}
                  </li>
                ),
                blockquote: ({ children, ...props }) => (
                  <blockquote
                    className="border-l-4 border-primary pl-6 py-2 my-8 bg-muted/30 rounded-r-lg italic text-muted-foreground"
                    {...props}
                  >
                    {children}
                  </blockquote>
                ),
                code: ({ className, children, ...props }: any) => {
                  const isInline = !className;
                  return isInline ? (
                    <code
                      className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({ children, ...props }) => (
                  <pre
                    className="p-4 rounded-xl bg-muted overflow-x-auto my-8 text-sm"
                    {...props}
                  >
                    {children}
                  </pre>
                ),
                img: ({ src, alt, ...props }) => (
                  <figure className="my-8">
                    <img
                      src={src}
                      alt={alt}
                      className="w-full rounded-2xl shadow-lg"
                      {...props}
                    />
                    {alt && (
                      <figcaption className="text-center text-sm text-muted-foreground mt-3">
                        {alt}
                      </figcaption>
                    )}
                  </figure>
                ),
                a: ({ href, children, ...props }) => (
                  <a
                    href={href}
                    className="text-primary hover:underline font-medium"
                    target={href?.startsWith("http") ? "_blank" : undefined}
                    rel={
                      href?.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    {...props}
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {lang.content}
            </ReactMarkdown>
          </div>

          {/* Share & Actions */}
          <div className="flex items-center justify-between mt-16 pt-8 border-t border-border">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Chia sẻ
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Bookmark className="w-4 h-4" />
                Lưu
              </Button>
            </div>
          </div>

          {/* Tags Section */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Chủ đề liên quan
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag: any) => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.slug}`}
                    className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </article>
    </>
  );
}
