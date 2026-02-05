import { createClient } from "@/lib/supabase/client";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface TagWithCount extends Tag {
  count: number;
}

export type CreateTagInput = Omit<Tag, "id">;
export type UpdateTagInput = Partial<CreateTagInput> & { id: string };

const supabase = createClient();

export const tagService = {
  async getAll(search?: string) {
    let query = supabase
      .from("tags")
      .select("*")
      .order("name", { ascending: true });

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Tag[];
  },

  async getTagsWithCount() {
    const { data, error } = await supabase
      .from("tags")
      .select(
        `
        *,
        post_tags(
          posts(published)
        )
      `,
      )
      .order("name", { ascending: true });

    if (error) throw error;

    return (data as any[]).map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      description: tag.description,
      image_url: tag.image_url,
      count:
        tag.post_tags?.filter((pt: any) => pt.posts?.published).length || 0,
    })) as TagWithCount[];
  },

  async create(tag: CreateTagInput) {
    const { data, error } = await supabase
      .from("tags")
      .insert(tag)
      .select()
      .single();

    if (error) throw error;
    return data as Tag;
  },

  async update(tag: UpdateTagInput) {
    const { id, ...updateData } = tag;
    const { data, error } = await supabase
      .from("tags")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Tag;
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data as Tag;
  },

  async delete(id: string) {
    const { error } = await supabase.from("tags").delete().eq("id", id);
    if (error) throw error;
  },
};
