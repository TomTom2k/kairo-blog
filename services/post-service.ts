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
  view_count?: number;
  created_at: string;
  published_at?: string;
  updated_at?: string;
  tags?: { id: string; name: string }[];
}

export type CreatePostInput = Omit<
  Post,
  "id" | "created_at" | "view_count" | "tags" | "published_at" | "updated_at"
>;
export type UpdatePostInput = Partial<CreatePostInput> & { id: string };

const supabase = createClient();

export const postService = {
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
      .select("*", { count: "exact" })
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

    return {
      posts: (data as Post[]) || [],
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
};
