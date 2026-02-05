"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import DataTable, { Column } from "../components/DataTable";
import Link from "next/link";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  FileText,
  Filter,
} from "lucide-react";
import { postService, Post } from "@/services/post-service";

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft"
  >("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { posts, total } = await postService.getAll({
        page,
        pageSize,
        search,
        status: statusFilter,
      });
      setPosts(posts);
      setTotal(total);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [search, statusFilter, page]);

  const handleDelete = async (post: Post) => {
    if (!confirm(`Bạn chắc chắn muốn xóa bài viết "${post.title}"?`)) return;
    try {
      await postService.delete(post.id);
      fetchPosts();
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const togglePublish = async (post: Post) => {
    try {
      await postService.togglePublish(post.id, !post.published);
      fetchPosts();
    } catch (error) {
      console.error("Failed to toggle publish status:", error);
    }
  };

  const columns: Column<Post>[] = [
    {
      key: "title",
      title: "Tiêu đề",
      render: (value, row) => (
        <div>
          <p className="font-medium text-foreground line-clamp-1">
            {String(value)}
          </p>
          <p className="text-sm text-muted-foreground">/{row.slug}</p>
        </div>
      ),
    },
    {
      key: "published",
      title: "Trạng thái",
      render: (value) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            value
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-orange-500/10 text-orange-500"
          }`}
        >
          {value ? (
            <>
              <CheckCircle className="w-3 h-3" />
              Đã xuất bản
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" />
              Bản nháp
            </>
          )}
        </span>
      ),
    },
    {
      key: "view_count",
      title: "Lượt xem",
      render: (value) => (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Eye className="w-4 h-4" />
          <span>{Number(value || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: "created_at",
      title: "Ngày tạo",
      render: (value) => (
        <span className="text-muted-foreground">
          {new Date(String(value)).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
  ];

  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.filter((p) => !p.published).length;

  return (
    <>
      <Header
        title="Quản lý bài viết"
        subtitle="Tạo và quản lý các bài viết trên blog"
      />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Actions Bar */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "published" | "draft",
                  )
                }
                className="px-3 py-2.5 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Tất cả</option>
                <option value="published">Đã xuất bản</option>
                <option value="draft">Bản nháp</option>
              </select>
            </div>
          </div>

          {/* Create Button */}
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Viết bài mới
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Tổng cộng: {total} bài viết</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>{publishedCount} đã xuất bản</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>{draftCount} bản nháp</span>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={posts}
            keyField="id"
            actions={(post) => (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePublish(post);
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    post.published
                      ? "hover:bg-orange-500/10 text-orange-500"
                      : "hover:bg-emerald-500/10 text-emerald-500"
                  }`}
                  title={post.published ? "Gỡ xuất bản" : "Xuất bản"}
                >
                  {post.published ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </button>
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="p-1.5 rounded hover:bg-muted transition-colors"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(post);
                  }}
                  className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            )}
            emptyMessage="Chưa có bài viết nào"
            pagination={{
              page,
              pageSize,
              total,
              onPageChange: setPage,
            }}
          />
        )}
      </div>
    </>
  );
}
