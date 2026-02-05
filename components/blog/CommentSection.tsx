"use client";

import {
  engagementService,
  Comment,
  CreateCommentInput,
} from "@/services/engagement-service";
import { MessageSquare, Send, User, Calendar, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    author_name: "",
    content: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadComments();
  }, [postId]);

  async function loadComments() {
    setLoading(true);
    try {
      const data = await engagementService.getComments(postId);
      setComments(data);
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setLoading(false);
    }
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!formData.author_name.trim()) {
      newErrors.author_name = "Vui lòng nhập tên của bạn";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Vui lòng nhập nội dung bình luận";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const newComment: CreateCommentInput = {
        post_id: postId,
        author_name: formData.author_name.trim(),
        content: formData.content.trim(),
      };

      await engagementService.addComment(newComment);
      setFormData({ author_name: "", content: "" });
      setErrors({});
      await loadComments();
    } catch (error) {
      console.error("Failed to submit comment:", error);
      setErrors({ submit: "Không thể gửi bình luận. Vui lòng thử lại." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-16 border-t border-border pt-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <MessageSquare className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          Bình luận ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-12 bg-card border border-border rounded-3xl p-8"
      >
        <h3 className="text-xl font-bold text-foreground mb-6">
          Để lại bình luận của bạn
        </h3>

        <div className="mb-4">
          <div>
            <label
              htmlFor="author_name"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Tên của bạn <span className="text-destructive">*</span>
            </label>
            <input
              id="author_name"
              type="text"
              value={formData.author_name}
              onChange={(e) =>
                setFormData({ ...formData, author_name: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              placeholder="Nguyễn Văn A"
            />
            {errors.author_name && (
              <p className="text-destructive text-sm mt-1">
                {errors.author_name}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Nội dung <span className="text-destructive">*</span>
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
            placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
          />
          {errors.content && (
            <p className="text-destructive text-sm mt-1">{errors.content}</p>
          )}
        </div>

        {errors.submit && (
          <p className="text-destructive text-sm mb-4">{errors.submit}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang gửi...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Gửi bình luận
            </>
          )}
        </button>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-3xl border border-dashed border-border">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">
            Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 border-2 border-border">
                  <User className="w-6 h-6 text-primary" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-foreground">
                      {comment.author_name}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(comment.created_at).toLocaleDateString(
                          "vi-VN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>

                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
