import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const storageService = {
  async uploadPostImage(file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from("post-image")
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: publicUrl } = supabase.storage
      .from("post-image")
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  },

  async uploadTagImage(file: File) {
    const fileExt = file.name.split(".").pop();
    const fileName = `tag-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from("post-image") // Using post-image bucket but with tag prefix for now as bucket might not exist
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data: publicUrl } = supabase.storage
      .from("post-image")
      .getPublicUrl(filePath);

    return publicUrl.publicUrl;
  },

  async deleteTagImage(path: string) {
    const fileName = path.split("/").pop();
    if (!fileName) return;

    const { error } = await supabase.storage
      .from("post-image")
      .remove([fileName]);

    if (error) {
      console.error("Failed to delete tag image from storage:", error);
    }
  },

  async deletePostImage(path: string) {
    // path might be the full URL, we need to extract the relative path
    // Supabase public URL usually looks like: https://[project].supabase.co/storage/v1/object/public/post-image/[filename]
    const fileName = path.split("/").pop();
    if (!fileName) return;

    const { error } = await supabase.storage
      .from("post-image")
      .remove([fileName]);

    if (error) {
      console.error("Failed to delete image from storage:", error);
    }
  },
};
