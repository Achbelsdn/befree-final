import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Search,
  Filter,
  Briefcase,
  Clock,
  DollarSign,
  MapPin,
  Heart,
  MessageCircle,
  Bookmark,
  Eye,
  Users,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Plus
} from "lucide-react";

export default function PublicProjects() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBudget, setSelectedBudget] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const { data: projects, isLoading } = trpc.project.listPublic.useQuery({
    search: searchQuery || undefined,
    categoryId: selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
    sortBy: sortBy as "newest" | "budget_high" | "budget_low" | "deadline" | "popular",
    limit: 20,
  });

  const { data: categories } = trpc.category.list.useQuery();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const budgetRanges = [
    { value: "all", label: "Tous les budgets" },
    { value: "0-50000", label: "Moins de 50 000 XOF" },
    { value: "50000-200000", label: "50 000 - 200 000 XOF" },
    { value: "200000-500000", label: "200 000 - 500 000 XOF" },
    { value: "500000+", label: "Plus de 500 000 XOF" },
  ];

  const getBudgetDisplay = (min?: string | null, max?: string | null) => {
    if (!min && !max) return "Budget à négocier";
    if (min && max) return `${parseInt(min).toLocaleString()} - ${parseInt(max).toLocaleString()} XOF`;
    if (min) return `À partir de ${parseInt(min).toLocaleString()} XOF`;
    if (max) return `Jusqu'à ${parseInt(max).toLocaleString()} XOF`;
    return "Budget à négocier";
  };

  const getExperienceBadge = (level?: string | null) => {
    switch (level) {
      case "entry":
        return { label: "Débutant", bgColor: 'rgba(92, 107, 74, 0.1)', color: '#5C6B4A' };
      case "intermediate":
        return { label: "Intermédiaire", bgColor: 'rgba(199, 91, 57, 0.1)', color: '#C75B39' };
      case "expert":
        return { label: "Expert", bgColor: 'rgba(139, 69, 19, 0.1)', color: '#8B4513' };
      default:
        return { label: "Tous niveaux", bgColor: '#E8E2D9', color: '#6B6560' };
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAF7F2' }}>
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FAF7F2 0%, #E8E2D9 100%)' }}>
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: 'rgba(199, 91, 57, 0.08)' }} />
            <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full blur-[80px]" style={{ background: 'rgba(92, 107, 74, 0.06)' }} />
          </div>
          
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm mb-6" style={{ background: 'rgba(199, 91, 57, 0.08)', border: '1px solid rgba(199, 91, 57, 0.15)' }}>
                <Briefcase className="w-4 h-4" style={{ color: '#C75B39' }} />
                <span className="text-sm font-medium" style={{ color: '#C75B39' }}>Projets disponibles</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714', letterSpacing: '-0.02em' }}>
                Trouvez votre prochain{" "}
                <span style={{ color: '#C75B39', fontStyle: 'italic' }}>
                  projet
                </span>
              </h1>
              
              <p className="text-lg mb-8" style={{ color: '#6B6560' }}>
                Des centaines de projets vous attendent. Postulez et collaborez avec des clients du Bénin.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="flex items-center rounded-sm p-2" style={{ background: '#FFFDFB', border: '1px solid #E8E2D9', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: '#9A948D' }} />
                    <Input
                      type="search"
                      placeholder="Rechercher un projet..."
                      className="pl-12 h-12 border-0"
                      style={{ background: 'transparent', color: '#1A1714' }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="h-10 px-6 rounded-sm"
                    style={{ background: '#C75B39', color: '#FFFDFB' }}
                  >
                    Rechercher
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Filters & Projects */}
        <section className="py-12">
          <div className="container">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <aside className="lg:w-64 shrink-0">
                <Card className="p-6 sticky top-24" style={{ background: '#FFFDFB', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                  <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A1714' }}>
                    <Filter className="w-4 h-4" style={{ color: '#C75B39' }} />
                    Filtres
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Category Filter */}
                    <div>
                      <label className="text-sm mb-2 block" style={{ color: '#6B6560' }}>Catégorie</label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger style={{ background: '#FFFDFB', border: '1px solid #E8E2D9', color: '#3D3833' }}>
                          <SelectValue placeholder="Toutes les catégories" />
                        </SelectTrigger>
                        <SelectContent style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
                          <SelectItem value="all" style={{ color: '#3D3833' }}>Toutes les catégories</SelectItem>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()} style={{ color: '#3D3833' }}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Budget Filter */}
                    <div>
                      <label className="text-sm mb-2 block" style={{ color: '#6B6560' }}>Budget</label>
                      <Select value={selectedBudget} onValueChange={setSelectedBudget}>
                        <SelectTrigger style={{ background: '#FFFDFB', border: '1px solid #E8E2D9', color: '#3D3833' }}>
                          <SelectValue placeholder="Tous les budgets" />
                        </SelectTrigger>
                        <SelectContent style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
                          {budgetRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value} style={{ color: '#3D3833' }}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="text-sm mb-2 block" style={{ color: '#6B6560' }}>Trier par</label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger style={{ background: '#FFFDFB', border: '1px solid #E8E2D9', color: '#3D3833' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
                          <SelectItem value="newest" style={{ color: '#3D3833' }}>Plus récents</SelectItem>
                          <SelectItem value="budget_high" style={{ color: '#3D3833' }}>Budget élevé</SelectItem>
                          <SelectItem value="budget_low" style={{ color: '#3D3833' }}>Budget bas</SelectItem>
                          <SelectItem value="deadline" style={{ color: '#3D3833' }}>Date limite</SelectItem>
                          <SelectItem value="popular" style={{ color: '#3D3833' }}>Populaires</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Post Project CTA */}
                  {isAuthenticated && user?.userType === "client" && (
                    <div className="mt-8 pt-6" style={{ borderTop: '1px solid #E8E2D9' }}>
                      <Link href="/dashboard/projects/new">
                        <Button className="w-full" style={{ background: '#C75B39', color: '#FFFDFB' }}>
                          <Plus className="w-4 h-4 mr-2" />
                          Publier un projet
                        </Button>
                      </Link>
                    </div>
                  )}
                </Card>
              </aside>

              {/* Projects List */}
              <div className="flex-1">
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <p style={{ color: '#6B6560' }}>
                    <span className="font-medium" style={{ color: '#1A1714' }}>{projects?.length || 0}</span> projets trouvés
                  </p>
                </div>

                {/* Projects Grid */}
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-6 animate-pulse" style={{ background: '#FFFDFB', border: '1px solid rgba(0,0,0,0.04)' }}>
                        <div className="h-6 rounded w-3/4 mb-4" style={{ background: '#E8E2D9' }} />
                        <div className="h-4 rounded w-full mb-2" style={{ background: '#E8E2D9' }} />
                        <div className="h-4 rounded w-2/3" style={{ background: '#E8E2D9' }} />
                      </Card>
                    ))}
                  </div>
                ) : projects && projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.map((project, index) => {
                      const expBadge = getExperienceBadge(project.experienceLevel);
                      return (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          <Link href={`/projects/${project.id}`}>
                            <Card className="p-6 transition-all cursor-pointer group" style={{ background: '#FFFDFB', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                              <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge className="rounded-sm" style={{ background: expBadge.bgColor, color: expBadge.color, border: 'none' }}>
                                      {expBadge.label}
                                    </Badge>
                                    {project.budgetType === "fixed" && (
                                      <Badge className="rounded-sm" style={{ background: 'rgba(92, 107, 74, 0.1)', color: '#5C6B4A', border: 'none' }}>
                                        Prix fixe
                                      </Badge>
                                    )}
                                  </div>
                                  <h3 className="text-xl font-semibold transition-colors" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>
                                    {project.title}
                                  </h3>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold" style={{ color: '#5C6B4A' }}>
                                    {getBudgetDisplay(project.budgetMin, project.budgetMax)}
                                  </div>
                                  <div className="text-sm" style={{ color: '#9A948D' }}>{project.budgetType === "hourly" ? "/heure" : ""}</div>
                                </div>
                              </div>

                              <p className="mb-4 line-clamp-2" style={{ color: '#6B6560' }}>
                                {project.description}
                              </p>

                              {/* Skills */}
                              {project.skills && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {JSON.parse(project.skills).slice(0, 5).map((skill: string, i: number) => (
                                    <span
                                      key={i}
                                      className="px-2 py-1 text-xs rounded-sm"
                                      style={{ background: '#E8E2D9', color: '#6B6560' }}
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Meta Info */}
                              <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid #E8E2D9' }}>
                                <div className="flex items-center gap-4 text-sm" style={{ color: '#9A948D' }}>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {project.createdAt && formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: fr })}
                                  </span>
                                  {project.deadline && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      Deadline: {format(new Date(project.deadline), "dd MMM yyyy", { locale: fr })}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {project.applicationCount || 0} candidatures
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button className="transition-colors" style={{ color: '#9A948D' }}>
                                    <Heart className="w-5 h-5" />
                                  </button>
                                  <button className="transition-colors" style={{ color: '#9A948D' }}>
                                    <Bookmark className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="p-12 text-center" style={{ background: '#FFFDFB', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <Briefcase className="w-16 h-16 mx-auto mb-4" style={{ color: '#E8E2D9' }} />
                    <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>Aucun projet disponible</h3>
                    <p className="mb-6" style={{ color: '#6B6560' }}>
                      Soyez le premier à publier un projet et trouvez des freelances talentueux !
                    </p>
                    {isAuthenticated && user?.userType === "client" && (
                      <Link href="/dashboard/projects/new">
                        <Button style={{ background: '#C75B39', color: '#FFFDFB' }}>
                          <Plus className="w-4 h-4 mr-2" />
                          Publier un projet
                        </Button>
                      </Link>
                    )}
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
