import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient: "purple" | "blue" | "green" | "orange";
}

const gradients = {
  purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
  blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
  green: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30",
  orange: "from-orange-500/20 to-orange-600/20 border-orange-500/30",
};

const iconColors = {
  purple: "text-purple-500",
  blue: "text-blue-500",
  green: "text-emerald-500",
  orange: "text-orange-500",
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  gradient,
}: StatsCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl p-5
        bg-gradient-to-br ${gradients[gradient]}
        border backdrop-blur-sm
        hover:scale-[1.02] transition-transform duration-200
      `}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-transparent" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 text-foreground">{value}</p>

          {trend && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? "text-emerald-500" : "text-destructive"}`}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground">vs tuần trước</span>
            </div>
          )}
        </div>

        <div
          className={`p-3 rounded-xl bg-background/50 ${iconColors[gradient]}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
