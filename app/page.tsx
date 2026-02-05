import { postService } from "@/services/post-service";
import { tagService } from "@/services/tag-service";
import { FeaturedPosts } from "@/components/blog/FeaturedPosts";
import { HotPosts } from "@/components/blog/HotPosts";
import { PostsGrid } from "@/components/blog/PostsGrid";

export default async function Home() {
  // Fetch all data in parallel for better performance
  const [{ posts }, featuredPosts, hotPosts, tags] = await Promise.all([
    postService.getAll({ status: "published", pageSize: 100 }),
    postService.getFeaturedPosts(3),
    postService.getHotPosts(5),
    tagService.getAll(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
              Kairo <span className="text-primary">Blog</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Nơi chia sẻ kiến thức, kinh nghiệm về phát triển phần mềm và cuộc
              sống. Khám phá những bài viết mới nhất dưới đây.
            </p>
          </div>
        </div>
        {/* Dynamic Background Element */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Featured Posts Section */}
        <FeaturedPosts posts={featuredPosts} />

        {/* Posts Grid with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Posts Grid */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Tất cả bài viết
              </h2>
              <p className="text-muted-foreground">
                Khám phá {posts.length} bài viết của chúng tôi
              </p>
            </div>

            <PostsGrid initialPosts={posts} allPosts={posts} tags={tags} />
          </div>

          {/* Sidebar - Hot Posts */}
          <div className="lg:col-span-1">
            <HotPosts posts={hotPosts} />
          </div>
        </div>
      </main>
    </div>
  );
}
