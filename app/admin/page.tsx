import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import DashboardContent from "./components/DashboardContent";

export default async function AdminDashboard() {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookies().then((c) => c.get(name)?.value || null),
      },
    },
  );

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
