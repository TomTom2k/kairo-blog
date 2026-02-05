import { createClient } from "@/lib/supabase/server";
import DashboardContent from "./components/DashboardContent";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch posts
  const { data: posts, count: totalPosts } = await supabase
    .from("posts")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch tags
  const { data: tags } = await supabase.from("tags").select("*").limit(20);

  return (
    <DashboardContent
      posts={posts || []}
      tags={tags || []}
      totalPosts={totalPosts || 0}
    />
  );
}
