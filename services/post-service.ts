import { createClient } from "@/lib/supabase/client";

export interface LanguageContent {
  title: string;
  content: string;
  excerpt: string;
  meta_title?: string;
  meta_description?: string;
  focus_keywords?: string;
  canonical_url?: string;
  og_image?: string;
}

export interface Post {
  id: string;
  slug: string;
  languages: {
    vi: LanguageContent;
    en?: LanguageContent;
  };
  published: boolean;
  thumbnail?: string;
  views?: number;
  created_at: string;
  published_at?: string;
  updated_at?: string;
  tags?: { id: string; name: string }[];
}

export type CreatePostInput = Omit<
  Post,
  "id" | "created_at" | "views" | "tags" | "published_at" | "updated_at"
>;

export type UpdatePostInput = Partial<CreatePostInput> & { id: string };

const supabase = createClient();

export const postService = {
  /**
   * Get lightweight list of posts (id, title) for selection/filtering
   */
  async getLiteList() {
    const { data, error } = await supabase
      .from("posts")
      .select("id, slug, languages")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Pick<Post, "id" | "slug" | "languages">[];
  },

  async getAll({
    page = 1,
    pageSize = 10,
    search = "",
    status = "all",
  }: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: "all" | "published" | "draft";
  }) {
    let query = supabase
      .from("posts")
      .select("*, post_tags(tags(*))", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (search) {
      // Search in the 'vi' title within the JSONB column
      query = query.ilike("languages->vi->>'title'", `%${search}%`);
    }

    if (status === "published") {
      query = query.eq("published", true);
    } else if (status === "draft") {
      query = query.eq("published", false);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    const posts = (data as any[]).map((post) => {
      if (post.post_tags) {
        post.tags = post.post_tags
          .filter((pt: any) => pt.tags)
          .map((pt: any) => pt.tags);
      }
      return post as Post;
    });

    return {
      posts: posts || [],
      total: count || 0,
    };
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("posts")
      .select("*, post_tags(tag_id)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from("posts")
      .select("*, post_tags(tags(*))")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error) throw error;

    // Flatten tags for easier access
    const post = data as any;
    if (post.post_tags) {
      post.tags = post.post_tags
        .filter((pt: any) => pt.tags)
        .map((pt: any) => pt.tags);
    }

    return post as Post;
  },

  async create(post: CreatePostInput, tagIds: string[] = []) {
    const { data, error } = await supabase
      .from("posts")
      .insert(post)
      .select()
      .single();

    if (error) throw error;
    const newPost = data as Post;

    if (tagIds.length > 0) {
      const postTags = tagIds.map((tagId) => ({
        post_id: newPost.id,
        tag_id: tagId,
      }));
      const { error: tagError } = await supabase
        .from("post_tags")
        .insert(postTags);
      if (tagError) throw tagError;
    }

    return newPost;
  },

  async update(post: UpdatePostInput, tagIds?: string[]) {
    const { id, ...updateData } = post;
    const { error } = await supabase
      .from("posts")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;

    if (tagIds !== undefined) {
      // Update tags: delete old and insert new
      await supabase.from("post_tags").delete().eq("post_id", id);
      if (tagIds.length > 0) {
        const postTags = tagIds.map((tagId) => ({
          post_id: id,
          tag_id: tagId,
        }));
        await supabase.from("post_tags").insert(postTags);
      }
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) throw error;
  },

  async togglePublish(id: string, published: boolean) {
    const { error } = await supabase
      .from("posts")
      .update({ published })
      .eq("id", id);
    if (error) throw error;
  },

  /**
   * Get hot posts sorted by view count
   */
  async getHotPosts(limit: number = 5) {
    const { data, error } = await supabase
      .from("posts")
      .select("*, post_tags(tags(*))")
      .eq("published", true)
      .order("views", { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) throw error;

    const posts = (data as any[]).map((post) => {
      if (post.post_tags) {
        post.tags = post.post_tags
          .filter((pt: any) => pt.tags)
          .map((pt: any) => pt.tags);
      }
      return post as Post;
    });

    return posts;
  },

  /**
   * Get featured posts (you can add a 'featured' boolean column to posts table)
   * For now, just return the most recent published posts
   */
  async getFeaturedPosts(limit: number = 3) {
    const { data, error } = await supabase
      .from("posts")
      .select("*, post_tags(tags(*))")
      .eq("published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const posts = (data as any[]).map((post) => {
      if (post.post_tags) {
        post.tags = post.post_tags
          .filter((pt: any) => pt.tags)
          .map((pt: any) => pt.tags);
      }
      return post as Post;
    });

    return posts;
  },

  /**
   * Get most read posts (same as hot posts for now)
   */
  async getMostReadPosts(limit: number = 5) {
    return this.getHotPosts(limit);
  },

  /**
   * Get posts filtered by tag
   */
  async getByTag({
    tagId,
    page = 1,
    pageSize = 12,
  }: {
    tagId: string;
    page?: number;
    pageSize?: number;
  }) {
    const { data, count, error } = await supabase
      .from("posts")
      .select("*, post_tags!inner(tags(*))", { count: "exact" })
      .eq("published", true)
      .eq("post_tags.tag_id", tagId)
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;

    const posts = (data as any[]).map((post) => {
      if (post.post_tags) {
        post.tags = post.post_tags
          .filter((pt: any) => pt.tags)
          .map((pt: any) => pt.tags);
      }
      return post as Post;
    });

    return {
      posts: posts || [],
      total: count || 0,
    };
  },

  /**
   * Increment view count for a post
   */
  async incrementViewCount(slug: string) {
    // First get the current view count
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("views")
      .eq("slug", slug)
      .single();

    if (fetchError) {
      console.error("Error fetching post for view count:", fetchError);
      return;
    }

    const currentCount = post?.views || 0;

    const { error } = await supabase
      .from("posts")
      .update({ views: currentCount + 1 })
      .eq("slug", slug);

    if (error) {
      console.error("Error incrementing view count:", error);
    }
  },
};
