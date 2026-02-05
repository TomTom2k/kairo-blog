import { Post } from "@/services/post-service";
import PostCard from "./PostCard";

interface PostListProps {
  posts: Post[];
}

const PostList = ({ posts }: PostListProps) => {
  if (!posts || posts.length === 0) {
    return (
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Chưa có bài viết nào.</p>
        </div>
      </section>
    );
  }

  // Transform Post to PostCard props
  const transformPost = (post: Post) => {
    const lang = post.languages.vi || post.languages.en;
    if (!lang) return null;

    return {
      title: lang.title,
      excerpt: lang.excerpt,
      date: new Date(post.created_at).toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      readTime: "5 phút đọc", // Placeholder as calculation is not implemented
      tags: post.tags?.map((t) => t.name) || [],
      imageUrl:
        post.thumbnail ||
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=600&fit=crop",
      slug: post.slug,
    };
  };

  const formattedPosts = posts
    .map((post) => {
      const transformed = transformPost(post);
      return transformed ? { ...transformed, originalId: post.id } : null;
    })
    .filter((post): post is NonNullable<typeof post> => post !== null);

  const featuredPost = formattedPosts[0];
  const regularPosts = formattedPosts.slice(1);

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-8">
          Bài viết mới nhất
        </h2>

        {/* Featured Post */}
        {featuredPost && (
          <div className="mb-10">
            <PostCard
              {...featuredPost}
              index={0}
              featured={true}
              // Required by PostCard types but filtered out from passing spread if strictly typed,
              // but here we just spread the transformed object which matches PostCardProps
            />
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularPosts.map((post, index) => (
            <PostCard
              key={post.slug}
              {...post}
              index={index + 1}
              // featured defaults to false
            />
          ))}
        </div>

        {/* Load More */}
        {posts.length > 7 && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25">
              Xem thêm bài viết
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PostList;
