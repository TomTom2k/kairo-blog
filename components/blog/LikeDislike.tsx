"use client";

import {
  engagementService,
  LikeStats,
  UserLike,
} from "@/services/engagement-service";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface LikeDislikeProps {
  postId: string;
}

// Generate a simple user ID from browser fingerprint or localStorage
function getUserId(): string {
  if (typeof window === "undefined") return "server";

  let userId = localStorage.getItem("blog_user_id");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("blog_user_id", userId);
  }
  return userId;
}

export function LikeDislike({ postId }: LikeDislikeProps) {
  const [stats, setStats] = useState<LikeStats>({ likes: 0, dislikes: 0 });
  const [userLike, setUserLike] = useState<"like" | "dislike" | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId] = useState(getUserId);

  useEffect(() => {
    loadData();
  }, [postId]);

  async function loadData() {
    try {
      const [statsData, userLikeData] = await Promise.all([
        engagementService.getLikeStats(postId),
        engagementService.getUserLike(postId, userId),
      ]);
      setStats(statsData);
      setUserLike(userLikeData.likeType);
    } catch (error) {
      console.error("Failed to load engagement data:", error);
    }
  }

  async function handleToggle(type: "like" | "dislike") {
    if (loading) return;

    setLoading(true);
    try {
      await engagementService.toggleLike(postId, userId, type);
      await loadData();
    } catch (error) {
      console.error("Failed to toggle like:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => handleToggle("like")}
        disabled={loading}
        className={`
          group flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 border-2
          ${
            userLike === "like"
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
              : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-primary hover:scale-105"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ThumbsUp
            className={`w-5 h-5 transition-transform ${
              userLike === "like" ? "fill-current" : "group-hover:scale-110"
            }`}
          />
        )}
        <span className="text-lg font-bold">{stats.likes}</span>
      </button>

      <button
        onClick={() => handleToggle("dislike")}
        disabled={loading}
        className={`
          group flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 border-2
          ${
            userLike === "dislike"
              ? "bg-destructive text-white border-destructive shadow-lg shadow-destructive/20 scale-105"
              : "bg-card border-border text-muted-foreground hover:border-destructive/50 hover:text-destructive hover:scale-105"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ThumbsDown
            className={`w-5 h-5 transition-transform ${
              userLike === "dislike" ? "fill-current" : "group-hover:scale-110"
            }`}
          />
        )}
        <span className="text-lg font-bold">{stats.dislikes}</span>
      </button>
    </div>
  );
}
