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

import ConfirmDialog from "../components/ConfirmDialog";

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string>("all");
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Load comments and posts in parallel
      const [commentsRes, postsRes] = await Promise.all([
        supabase
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
          .order("created_at", { ascending: false }),
        postService.getLiteList(),
      ]);

      if (commentsRes.error) throw commentsRes.error;
      setComments(commentsRes.data as any);
      setPosts(postsRes || []);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredComments =
    selectedPostId === "all"
      ? comments
      : comments.filter((c) => c.post_id === selectedPostId);

  function handleDeleteClick(id: string) {
    setCommentToDelete(id);
  }

  async function handleConfirmDelete() {
    if (!commentToDelete) return;

    setDeletingId(commentToDelete);
    try {
      await engagementService.deleteComment(commentToDelete);
      setComments(comments.filter((c) => c.id !== commentToDelete));
      setCommentToDelete(null);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý bình luận
            </h1>
            <p className="text-muted-foreground mt-1">
              Xem và quản lý tất cả bình luận từ người đọc (
              {filteredComments.length})
            </p>
          </div>
        </div>

        {/* Post Filter */}
        <div className="min-w-[250px]">
          <select
            value={selectedPostId}
            onChange={(e) => setSelectedPostId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary truncate"
          >
            <option value="all">Tất cả bài viết</option>
            {posts.map((post) => (
              <option key={post.id} value={post.id}>
                {post.languages?.vi?.title || post.slug}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        {filteredComments.length === 0 ? (
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
                {filteredComments.map((comment) => (
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
                        onClick={() => handleDeleteClick(comment.id)}
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

      <ConfirmDialog
        open={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa bình luận"
        description="Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác."
        confirmText="Xóa vĩnh viễn"
        variant="danger"
        loading={!!deletingId}
      />
    </div>
  );
}
