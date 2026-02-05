"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import Header from "../components/Header";
import DataTable, { Column } from "../components/DataTable";
import TagDialog from "../components/TagDialog";
import { Plus, Search, Pencil, Trash2, Tags as TagsIcon } from "lucide-react";

interface Tag {
  id: string;
  name: string;
  name_en?: string;
  slug: string;
  description?: string;
  color?: string;
  created_at: string;
  _count?: {
    posts: number;
  };
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const fetchTags = async () => {
    setLoading(true);
    let query = supabase
      .from("tags")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const { data } = await query;
    setTags((data as Tag[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, [search]);

  const handleSave = async (
    tagData: Omit<Tag, "id" | "created_at"> & { id?: string },
  ) => {
    if (tagData.id) {
      // Update
      await supabase
        .from("tags")
        .update({
          name: tagData.name,
          name_en: tagData.name_en,
          slug: tagData.slug,
          description: tagData.description,
          color: tagData.color,
        })
        .eq("id", tagData.id);
    } else {
      // Create
      await supabase.from("tags").insert({
        name: tagData.name,
        name_en: tagData.name_en,
        slug: tagData.slug,
        description: tagData.description,
        color: tagData.color,
      });
    }
    fetchTags();
    setDialogOpen(false);
    setEditingTag(null);
  };

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`Bạn chắc chắn muốn xóa thẻ "${tag.name}"?`)) return;
    await supabase.from("tags").delete().eq("id", tag.id);
    fetchTags();
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTag(null);
    setDialogOpen(true);
  };

  const columns: Column<Tag>[] = [
    {
      key: "name",
      title: "Tên thẻ",
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: row.color || "#8B5CF6" }}
          />
          <div>
            <p className="font-medium text-foreground">{row.name}</p>
            {row.name_en && (
              <p className="text-sm text-muted-foreground">{row.name_en}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "slug",
      title: "Slug",
      render: (value) => (
        <code className="px-2 py-1 rounded bg-muted text-sm">
          {String(value)}
        </code>
      ),
    },
    {
      key: "description",
      title: "Mô tả",
      render: (value) => (
        <span className="text-muted-foreground line-clamp-1">
          {String(value || "—")}
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
      <Header
        title="Quản lý thẻ"
        subtitle="Tạo và quản lý các thẻ cho bài viết"
      />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm thẻ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Tạo thẻ mới
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TagsIcon className="w-4 h-4" />
          <span>Tổng cộng: {tags.length} thẻ</span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={tags}
            keyField="id"
            actions={(tag) => (
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(tag);
                  }}
                  className="p-1.5 rounded hover:bg-muted transition-colors"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(tag);
                  }}
                  className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            )}
            emptyMessage="Chưa có thẻ nào"
          />
        )}
      </div>

      {/* Dialog */}
      <TagDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingTag(null);
        }}
        onSave={handleSave}
        tag={editingTag}
      />
    </>
  );
}
