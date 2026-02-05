"use client";

import { Tag } from "@/services/tag-service";
import { useState } from "react";

interface TagFilterProps {
  tags: Tag[];
  selectedTagId: string | null;
  onTagSelect: (tagId: string | null) => void;
}

export function TagFilter({
  tags,
  selectedTagId,
  onTagSelect,
}: TagFilterProps) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onTagSelect(null)}
        className={`
          px-6 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-300
          ${
            selectedTagId === null
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
              : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:scale-105"
          }
        `}
      >
        Tất cả
      </button>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => onTagSelect(tag.id)}
          className={`
            px-6 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-300
            ${
              selectedTagId === tag.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:scale-105"
            }
          `}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
