"use client";

import { Post } from "@/services/post-service";
import { Tag } from "@/services/tag-service";
import { TagFilter } from "./TagFilter";
import { PostCard } from "./PostCard";
import { useState } from "react";

interface PostsGridProps {
  initialPosts: Post[];
  allPosts: Post[];
  tags: Tag[];
}

export function PostsGrid({ initialPosts, allPosts, tags }: PostsGridProps) {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  const filteredPosts = selectedTagId
    ? allPosts.filter((post) =>
        post.tags?.some((tag: any) => tag.id === selectedTagId),
      )
    : allPosts;

  return (
    <div>
      {/* Tag Filter */}
      <div className="mb-12 overflow-x-auto">
        <TagFilter
          tags={tags}
          selectedTagId={selectedTagId}
          onTagSelect={setSelectedTagId}
        />
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post: Post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border">
          <h3 className="text-xl font-medium text-muted-foreground mb-2">
            Không tìm thấy bài viết nào
          </h3>
          <p className="text-sm text-muted-foreground">
            Thử chọn tag khác hoặc quay lại tất cả bài viết.
          </p>
        </div>
      )}
    </div>
  );
}
