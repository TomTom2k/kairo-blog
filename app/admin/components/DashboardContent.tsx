"use client";

import Header from "./Header";
import StatsCard from "./StatsCard";
import DataTable, { Column } from "./DataTable";
import {
  FileText,
  Eye,
  CheckCircle,
  Clock,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  published: boolean;
  created_at: string;
  view_count?: number;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface DashboardContentProps {
  posts: Post[];
  tags: Tag[];
  totalPosts: number;
}

export default function DashboardContent({
  posts,
  tags,
  totalPosts,
}: DashboardContentProps) {
  const publishedCount = posts?.filter((p) => p.published).length || 0;
  const draftCount = posts?.filter((p) => !p.published).length || 0;
  const totalViews =
    posts?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;

  const postColumns: Column<Post>[] = [
    {
      key: "title",
      title: "Tiêu đề",
      render: (value) => (
        <span className="font-medium line-clamp-1">{String(value)}</span>
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
      key: "created_at",
      title: "Ngày tạo",
      render: (value) => (
        <span className="text-muted-foreground">
          {new Date(String(value)).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
  ];

  return (
    <>
      <Header title="Dashboard" subtitle="Tổng quan về blog của bạn" />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Tổng bài viết"
            value={totalPosts || 0}
            icon={FileText}
            gradient="purple"
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Đã xuất bản"
            value={publishedCount}
            icon={CheckCircle}
            gradient="blue"
          />
          <StatsCard
            title="Bản nháp"
            value={draftCount}
            icon={Clock}
            gradient="orange"
          />
          <StatsCard
            title="Lượt xem"
            value={totalViews.toLocaleString()}
            icon={Eye}
            gradient="green"
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Posts */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Bài viết gần đây
              </h2>
              <Link
                href="/admin/posts"
                className="text-sm text-primary hover:underline"
              >
                Xem tất cả →
              </Link>
            </div>
            <DataTable
              columns={postColumns}
              data={posts || []}
              keyField="id"
              actions={(post) => (
                <div className="flex items-center gap-1">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="p-1.5 rounded hover:bg-muted transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-muted-foreground" />
                  </Link>
                  <button className="p-1.5 rounded hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              )}
              emptyMessage="Chưa có bài viết nào"
            />
          </div>

          {/* Tags Cloud */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Thẻ</h2>
              <Link
                href="/admin/tags"
                className="text-sm text-primary hover:underline"
              >
                Quản lý →
              </Link>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              {tags && tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Chưa có thẻ nào
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Thao tác nhanh
              </h3>
              <div className="space-y-2">
                <Link
                  href="/admin/posts/new"
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <FileText className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Viết bài mới</p>
                    <p className="text-sm text-muted-foreground">
                      Tạo bài viết mới
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
