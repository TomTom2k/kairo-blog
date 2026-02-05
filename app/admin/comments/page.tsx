"use client";

import { engagementService } from "@/services/engagement-service";
import { postService } from "@/services/post-service";
import { Loader2, Trash2, MessageSquare, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface AdminComment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_at: string;
  post?: {
    slug: string;
    languages: any;
  };
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadComments();
  }, []);

  async function loadComments() {
    setLoading(true);
    try {
      // Need to join with posts to get post title/slug
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          post:posts (
            slug,
            languages
          )
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data as any);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return;

    setDeletingId(id);
    try {
      await engagementService.deleteComment(id);
      setComments(comments.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert("Không thể xóa bình luận. Vui lòng thử lại.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <MessageSquare className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý bình luận
          </h1>
          <p className="text-muted-foreground mt-1">
            Xem và quản lý tất cả bình luận từ người đọc ({comments.length})
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {comments.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium text-muted-foreground">
              Chưa có bình luận nào
            </h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                <tr>
                  <th className="px-6 py-4">Người bình luận</th>
                  <th className="px-6 py-4 w-1/3">Nội dung</th>
                  <th className="px-6 py-4">Bài viết</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {comments.map((comment) => (
                  <tr
                    key={comment.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">
                      {comment.author_name}
                    </td>
                    <td className="px-6 py-4">
                      <p className="line-clamp-2" title={comment.content}>
                        {comment.content}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {comment.post ? (
                        <Link
                          href={`/blog/${comment.post.slug}`}
                          target="_blank"
                          className="flex items-center gap-1.5 text-primary hover:underline group"
                        >
                          <span className="truncate max-w-[200px]">
                            {comment.post.languages?.vi?.title || "Untitled"}
                          </span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      ) : (
                        <span className="text-muted-foreground italic">
                          Bài viết đã xóa
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(comment.created_at).toLocaleDateString(
                        "vi-VN",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Xóa bình luận"
                      >
                        {deletingId === comment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
