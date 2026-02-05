"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import DataTable, { Column } from "../components/DataTable";
import TagDialog from "../components/TagDialog";
import { Plus, Search, Pencil, Trash2, Tags as TagsIcon } from "lucide-react";
import { tagService, Tag } from "@/services/tag-service";
import { storageService } from "@/services/storage-service";
import ConfirmDialog from "../components/ConfirmDialog";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const data = await tagService.getAll(search);
      setTags(data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [search]);

  const handleSave = async (tagData: {
    id?: string;
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
  }) => {
    try {
      if (tagData.id) {
        await tagService.update({
          id: tagData.id,
          name: tagData.name,
          slug: tagData.slug,
          description: tagData.description,
          image_url: tagData.image_url,
        });
      } else {
        await tagService.create({
          name: tagData.name,
          slug: tagData.slug,
          description: tagData.description,
          image_url: tagData.image_url,
        });
      }
      fetchTags();
      setDialogOpen(false);
      setEditingTag(null);
    } catch (error) {
      console.error("Failed to save tag:", error);
    }
  };

  const handleDelete = (tag: Tag) => {
    setTagToDelete(tag);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!tagToDelete) return;
    setIsDeleting(true);
    try {
      if (tagToDelete.image_url) {
        await storageService.deleteTagImage(tagToDelete.image_url);
      }
      await tagService.delete(tagToDelete.id);
      fetchTags();
      setConfirmOpen(false);
      setTagToDelete(null);
    } catch (error) {
      console.error("Failed to delete tag:", error);
    } finally {
      setIsDeleting(false);
    }
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
      key: "image_url",
      title: "Ảnh",
      render: (value) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border">
          {value ? (
            <img
              src={String(value)}
              alt="Tag"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TagsIcon className="w-5 h-5 text-muted-foreground/50" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      title: "Tên thẻ",
      render: (value, tag) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{String(value)}</span>
          <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
            {tag.description || "Không có mô tả"}
          </span>
        </div>
      ),
    },
    {
      key: "slug",
      title: "Slug",
      render: (value) => (
        <code className="px-2 py-1 rounded bg-muted text-sm text-muted-foreground">
          /{String(value)}
        </code>
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
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
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

          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Tạo thẻ mới
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TagsIcon className="w-4 h-4" />
          <span>Tổng cộng: {tags.length} thẻ</span>
        </div>

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
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Chỉnh sửa"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(tag);
                  }}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors group"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive" />
                </button>
              </div>
            )}
            emptyMessage="Chưa có thẻ nào"
          />
        )}
      </div>

      <TagDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingTag(null);
        }}
        onSave={handleSave}
        tag={editingTag}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setTagToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Xóa thẻ"
        description={`Bạn chắc chắn muốn xóa thẻ "${tagToDelete?.name}"? Hành động này không thể hoàn tác.`}
        loading={isDeleting}
      />
    </>
  );
}
