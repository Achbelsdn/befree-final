import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { 
  Code, 
  Palette, 
  TrendingUp, 
  FileText, 
  Video, 
  Music, 
  Briefcase, 
  GraduationCap,
  Camera,
  Megaphone,
  PenTool,
  Database
} from "lucide-react";

interface CategoryCardProps {
  category: {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    icon?: string | null;
    image?: string | null;
    color?: string | null;
  };
  variant?: "default" | "compact" | "large";
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code,
  palette: Palette,
  trending: TrendingUp,
  file: FileText,
  video: Video,
  music: Music,
  briefcase: Briefcase,
  graduation: GraduationCap,
  camera: Camera,
  megaphone: Megaphone,
  pen: PenTool,
  database: Database,
};

const defaultColors = [
  "from-green-500 to-emerald-600",
  "from-yellow-500 to-amber-600",
  "from-red-500 to-rose-600",
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-violet-600",
  "from-pink-500 to-fuchsia-600",
  "from-cyan-500 to-teal-600",
  "from-orange-500 to-amber-600",
];

export default function CategoryCard({ category, variant = "default" }: CategoryCardProps) {
  const IconComponent = iconMap[category.icon || "briefcase"] || Briefcase;
  const colorIndex = category.id % defaultColors.length;
  const gradientClass = category.color || defaultColors[colorIndex];

  if (variant === "compact") {
    return (
      <Link href={`/services?category=${category.slug}`}>
        <Card className="group p-4 cursor-pointer card-hover text-center">
          <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
            {category.name}
          </h3>
        </Card>
      </Link>
    );
  }

  if (variant === "large") {
    return (
      <Link href={`/services?category=${category.slug}`}>
        <Card className="group relative overflow-hidden cursor-pointer card-hover h-48">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`} />
          )}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
          <div className="relative h-full p-6 flex flex-col justify-end text-white">
            <div className="w-12 h-12 mb-3 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <IconComponent className="h-6 w-6" />
            </div>
            <h3 className="font-heading font-bold text-xl mb-1">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-white/80 line-clamp-2">{category.description}</p>
            )}
          </div>
        </Card>
      </Link>
    );
  }

  // Default variant
  return (
    <Link href={`/services?category=${category.slug}`}>
      <Card className="group p-6 cursor-pointer card-hover">
        <div className={`w-14 h-14 mb-4 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <IconComponent className="h-7 w-7 text-white" />
        </div>
        <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {category.description}
          </p>
        )}
      </Card>
    </Link>
  );
}
