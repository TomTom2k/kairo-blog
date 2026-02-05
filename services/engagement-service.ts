import { createClient } from "@/lib/supabase/client";

export interface LikeStats {
  likes: number;
  dislikes: number;
}

export interface UserLike {
  likeType: "like" | "dislike" | null;
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_at: string;
  approved?: boolean;
}

export interface CreateCommentInput {
  post_id: string;
  author_name: string;
  content: string;
}

const supabase = createClient();

export const engagementService = {
  /**
   * Get like and dislike counts for a post
   */
  async getLikeStats(postId: string): Promise<LikeStats> {
    const { data, error } = await supabase
      .from("post_likes")
      .select("like_type")
      .eq("post_id", postId);

    if (error) {
      console.error("Error fetching like stats:", error);
      return { likes: 0, dislikes: 0 };
    }

    const stats = data.reduce(
      (acc, item) => {
        if (item.like_type === "like") acc.likes++;
        if (item.like_type === "dislike") acc.dislikes++;
        return acc;
      },
      { likes: 0, dislikes: 0 },
    );

    return stats;
  },

  /**
   * Get user's like/dislike status for a post
   */
  async getUserLike(postId: string, userId: string): Promise<UserLike> {
    const { data, error } = await supabase
      .from("post_likes")
      .select("like_type")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user like:", error);
      return { likeType: null };
    }

    return { likeType: data?.like_type || null };
  },

  /**
   * Toggle like/dislike for a post
   * If user clicks the same type again, it removes the like/dislike
   * If user clicks a different type, it updates to the new type
   */
  async toggleLike(
    postId: string,
    userId: string,
    likeType: "like" | "dislike",
  ): Promise<void> {
    // First, check if user already has a like/dislike
    const { data: existingLike, error: fetchError } = await supabase
      .from("post_likes")
      .select("like_type")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    // If user already liked/disliked with the same type, remove it
    if (existingLike?.like_type === likeType) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) throw error;
      return;
    }

    // If user has existing like/dislike of different type, update it
    if (existingLike) {
      const { error } = await supabase
        .from("post_likes")
        .update({ like_type: likeType })
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) throw error;
      return;
    }

    // Otherwise, insert new like/dislike
    const { error } = await supabase.from("post_likes").insert({
      post_id: postId,
      user_id: userId,
      like_type: likeType,
    });

    if (error) throw error;
  },

  /**
   * Get all comments for a post
   */
  async getComments(postId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return [];
    }

    return data as Comment[];
  },

  /**
   * Add a new comment to a post
   */
  async addComment(comment: CreateCommentInput): Promise<Comment> {
    const { data, error } = await supabase
      .from("comments")
      .insert({ ...comment, approved: true })
      .select()
      .single();

    if (error) throw error;
    return data as Comment;
  },

  /**
   * Delete a comment (Admin)
   */
  async deleteComment(commentId: string) {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) throw error;
  },
};
