import { Calendar, Clock, ArrowRight } from "lucide-react";

interface PostCardProps {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  imageUrl: string;
  slug: string;
  featured?: boolean;
  index?: number;
}

const PostCard = ({
  title,
  excerpt,
  date,
  readTime,
  tags,
  imageUrl,
  slug,
  featured = false,
  index = 0,
}: PostCardProps) => {
  if (featured) {
    return (
      <article
        className="group relative overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-500 animate-fade-in"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <a href={`/post/${slug}`} className="block">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative h-64 md:h-full overflow-hidden">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
            <div className="p-6 md:p-10 flex flex-col justify-center">
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
                {title}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">
                {excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {readTime}
                </span>
              </div>
              <span className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                Đọc tiếp
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </a>
      </article>
    );
  }

  return (
    <article
      className="group overflow-hidden rounded-xl bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300 animate-fade-in"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <a href={`/post/${slug}`} className="block">
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="font-serif text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {excerpt}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {readTime}
            </span>
          </div>
        </div>
      </a>
    </article>
  );
};

export default PostCard;
