"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { tagService, TagWithCount } from "@/services/tag-service";

const DEFAULT_METADATA = {
  description:
    "Khám phá các bài viết trong danh mục này - từ kiến thức chuyên môn đến chia sẻ cá nhân.",
  imageUrl:
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop",
  colorClass: "from-gray-500 to-slate-500",
};

const Categories = () => {
  const [categories, setCategories] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await tagService.getTagsWithCount();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="bg-background font-sans">
      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-secondary/50 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              Danh mục
            </h1>
            <p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              Khám phá các chủ đề mà tôi viết về - từ lập trình, công nghệ đến
              cuộc sống và những điều thú vị.
            </p>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12 md:py-16 min-h-[400px]">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">
                  Đang tải danh mục...
                </p>
              </div>
            ) : categories.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((category, index) => {
                  const imageUrl =
                    category.image_url || DEFAULT_METADATA.imageUrl;
                  const description =
                    category.description || DEFAULT_METADATA.description;

                  return (
                    <a
                      key={category.id}
                      href={`/tag/${category.slug}`}
                      className="group relative overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-500 animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Image */}
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />

                        {/* Category Badge */}
                        <div className="absolute bottom-4 left-4 right-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${DEFAULT_METADATA.colorClass} text-white font-semibold text-sm shadow-lg`}
                          >
                            {category.name}
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                              {category.count}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {description}
                        </p>
                        <span className="inline-flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                          Xem bài viết
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground">
                  Chưa có danh mục nào được tạo.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Categories;
