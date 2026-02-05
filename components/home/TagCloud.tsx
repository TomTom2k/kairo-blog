import { Tag } from "@/services/tag-service";

interface TagCloudProps {
  tags: Tag[];
}

const colorClasses = [
  "from-tag-gradient-1 to-tag-gradient-2",
  "from-tag-gradient-3 to-tag-gradient-4",
  "from-tag-gradient-2 to-tag-gradient-1",
  "from-tag-gradient-4 to-tag-gradient-3",
  "from-tag-gradient-5 to-tag-gradient-6",
  "from-tag-gradient-6 to-tag-gradient-5",
];

const TagCloud = ({ tags }: TagCloudProps) => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-8">
          Khám phá theo chủ đề
        </h2>
        <div className="flex flex-wrap gap-3">
          {tags.map((tag, index) => {
            const colorClass = colorClasses[index % colorClasses.length];
            return (
              <a
                key={tag.id}
                href={`/tag/${tag.slug}`}
                className="group relative animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r ${colorClass} text-primary-foreground font-medium text-sm shadow-lg shadow-primary/10 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/20 group-hover:scale-105`}
                >
                  {tag.name}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TagCloud;
