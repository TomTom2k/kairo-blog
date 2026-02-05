import { postService } from "@/services/post-service";
import { tagService } from "@/services/tag-service";
import HeroSection from "@/components/home/HeroSection";
import TagCloud from "@/components/home/TagCloud";
import PostList from "@/components/home/PostList";

export default async function Home() {
  // Fetch all data in parallel for better performance
  const [{ posts }, featuredPosts, hotPosts, tags] = await Promise.all([
    postService.getAll({ status: "published", pageSize: 100 }),
    postService.getFeaturedPosts(3),
    postService.getHotPosts(5),
    tagService.getAll(),
  ]);

  return (
    <main>
      <HeroSection />
      <TagCloud tags={tags} />
      <PostList posts={posts} />
    </main>
  );
}
