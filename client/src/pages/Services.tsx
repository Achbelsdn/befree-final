import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { 
  Search, 
  SlidersHorizontal, 
  X,
  Loader2,
  Code,
  Palette,
  TrendingUp,
  FileText,
  Video,
  Music,
  GraduationCap,
  Camera,
  Grid3X3,
  List,
  Sparkles
} from "lucide-react";

const categories = [
  { id: 1, name: "Développement & IT", slug: "developpement-it", icon: Code },
  { id: 2, name: "Design & Créatif", slug: "design-creatif", icon: Palette },
  { id: 3, name: "Marketing Digital", slug: "marketing-digital", icon: TrendingUp },
  { id: 4, name: "Rédaction & Traduction", slug: "redaction-traduction", icon: FileText },
  { id: 5, name: "Vidéo & Animation", slug: "video-animation", icon: Video },
  { id: 6, name: "Musique & Audio", slug: "musique-audio", icon: Music },
  { id: 7, name: "Formation", slug: "formation", icon: GraduationCap },
  { id: 8, name: "Photographie", slug: "photographie", icon: Camera },
];

const deliveryOptions = [
  { value: "1", label: "24 heures" },
  { value: "3", label: "3 jours" },
  { value: "7", label: "7 jours" },
  { value: "14", label: "14 jours" },
  { value: "30", label: "30 jours" },
];

const sortOptions = [
  { value: "popular", label: "Les plus populaires" },
  { value: "newest", label: "Les plus récents" },
  { value: "rating", label: "Meilleure note" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
];

export default function Services() {
  const searchParams = useSearch();
  const params = new URLSearchParams(searchParams);
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter states
  const [searchQuery, setSearchQuery] = useState(params.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(params.get("category") || "");
  const [sortBy, setSortBy] = useState<"popular" | "newest" | "rating" | "price_asc" | "price_desc">(
    (params.get("sort") as any) || "popular"
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [deliveryTime, setDeliveryTime] = useState<string>("");

  // Build query params
  const queryParams = useMemo(() => {
    const p: {
      search?: string;
      categoryId?: number;
      sortBy?: "popular" | "newest" | "rating" | "price_asc" | "price_desc";
      minPrice?: number;
      maxPrice?: number;
      deliveryTime?: number;
      limit?: number;
    } = {
      sortBy,
      limit: 20,
    };

    if (searchQuery) p.search = searchQuery;
    if (selectedCategory) {
      const cat = categories.find(c => c.slug === selectedCategory);
      if (cat) p.categoryId = cat.id;
    }
    if (priceRange[0] > 0) p.minPrice = priceRange[0];
    if (priceRange[1] < 500000) p.maxPrice = priceRange[1];
    if (deliveryTime) p.deliveryTime = parseInt(deliveryTime);

    return p;
  }, [searchQuery, selectedCategory, sortBy, priceRange, deliveryTime]);

  const { data: services, isLoading } = trpc.service.list.useQuery(queryParams);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL();
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    if (sortBy !== "popular") params.set("sort", sortBy);
    setLocation(`/services?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSortBy("popular");
    setPriceRange([0, 500000]);
    setDeliveryTime("");
    setLocation("/services");
  };

  const hasActiveFilters = searchQuery || selectedCategory || sortBy !== "popular" || priceRange[0] > 0 || priceRange[1] < 500000 || deliveryTime;

  const selectedCategoryData = categories.find(c => c.slug === selectedCategory);

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: '#C75B39' }}>Catégories</h3>
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.slug} className="flex items-center space-x-3">
              <Checkbox
                id={cat.slug}
                checked={selectedCategory === cat.slug}
                onCheckedChange={(checked) => {
                  setSelectedCategory(checked ? cat.slug : "");
                }}
                className="rounded-sm"
                style={{ borderColor: '#E8E2D9', accentColor: '#C75B39' }}
              />
              <Label
                htmlFor={cat.slug}
                className="text-sm cursor-pointer flex items-center gap-3 flex-1"
                style={{ color: '#3D3833' }}
              >
                <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ background: selectedCategory === cat.slug ? 'rgba(199, 91, 57, 0.1)' : '#E8E2D9' }}>
                  <cat.icon className="h-4 w-4" style={{ color: selectedCategory === cat.slug ? '#C75B39' : '#6B6560' }} />
                </div>
                <span>{cat.name}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: '#C75B39' }}>Budget (FCFA)</h3>
        <div className="px-1">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={500000}
            step={5000}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="px-3 py-1.5 rounded-sm font-medium" style={{ background: '#E8E2D9', color: '#3D3833' }}>{priceRange[0].toLocaleString('fr-FR')} F</span>
            <span style={{ color: '#9A948D' }}>—</span>
            <span className="px-3 py-1.5 rounded-sm font-medium" style={{ background: '#E8E2D9', color: '#3D3833' }}>{priceRange[1].toLocaleString('fr-FR')} F</span>
          </div>
        </div>
      </div>

      {/* Delivery Time */}
      <div>
        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: '#C75B39' }}>Délai de livraison</h3>
        <Select value={deliveryTime} onValueChange={setDeliveryTime}>
          <SelectTrigger className="rounded-sm h-12" style={{ background: '#FFFDFB', border: '1px solid #E8E2D9', color: '#3D3833' }}>
            <SelectValue placeholder="Tous les délais" />
          </SelectTrigger>
          <SelectContent style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
            <SelectItem value="all">Tous les délais</SelectItem>
            {deliveryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button 
          variant="outline" 
          className="w-full rounded-sm h-12" 
          style={{ background: '#FFFDFB', border: '1px solid #E8E2D9', color: '#C75B39' }}
          onClick={clearFilters}
        >
          <X className="h-4 w-4 mr-2" />
          Effacer les filtres
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAF7F2' }}>
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Header */}
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FAF7F2 0%, #E8E2D9 100%)', borderBottom: '1px solid #E8E2D9' }}>
          <div className="container py-12 relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-sm flex items-center justify-center" style={{ background: '#C75B39' }}>
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <Badge variant="secondary" className="rounded-sm" style={{ background: 'rgba(199, 91, 57, 0.1)', color: '#C75B39', border: '1px solid rgba(199, 91, 57, 0.2)' }}>
                {services?.length || 0} services disponibles
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>
              {selectedCategoryData ? selectedCategoryData.name : "Explorer les "}
              <span style={{ color: '#C75B39', fontStyle: 'italic' }}>services</span>
            </h1>
            <p className="text-lg max-w-2xl" style={{ color: '#6B6560' }}>
              Découvrez des centaines de services proposés par les meilleurs freelances du Bénin
            </p>
          </div>
        </div>

        <div className="container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24 p-6 rounded-sm" style={{ background: '#FFFDFB', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }}>
                <h2 className="font-semibold text-lg mb-6 flex items-center gap-2" style={{ color: '#1A1714' }}>
                  <SlidersHorizontal className="h-5 w-5" style={{ color: '#C75B39' }} />
                  Filtres
                </h2>
                <FilterContent />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Sort Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: '#9A948D' }} />
                    <Input
                      type="search"
                      placeholder="Rechercher un service..."
                      className="pl-12 h-12 rounded-sm"
                      style={{ background: '#FFFDFB', border: '1px solid #E8E2D9', color: '#1A1714' }}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>

                <div className="flex gap-2">
                  {/* Mobile Filter Button */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="lg:hidden h-12 rounded-sm" style={{ background: '#FFFDFB', border: '1px solid #E8E2D9', color: '#3D3833' }}>
                        <SlidersHorizontal className="h-4 w-4 mr-2" />
                        Filtres
                        {hasActiveFilters && (
                          <Badge variant="secondary" className="ml-2 rounded-sm" style={{ background: 'rgba(199, 91, 57, 0.1)', color: '#C75B39' }}>
                            Actifs
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80" style={{ background: '#FAF7F2', borderColor: '#E8E2D9' }}>
                      <SheetHeader>
                        <SheetTitle style={{ color: '#1A1714' }}>Filtres</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FilterContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* Sort Select */}
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <SelectTrigger className="w-[180px] h-12 rounded-sm" style={{ background: '#FFFDFB', border: '1px solid #E8E2D9', color: '#3D3833' }}>
                      <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} style={{ color: '#3D3833' }}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* View Mode */}
                  <div className="hidden sm:flex items-center gap-1 p-1 rounded-sm" style={{ background: '#E8E2D9' }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-sm"
                      style={{ 
                        background: viewMode === "grid" ? '#FFFDFB' : 'transparent',
                        color: viewMode === "grid" ? '#1A1714' : '#9A948D'
                      }}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-sm"
                      style={{ 
                        background: viewMode === "list" ? '#FFFDFB' : 'transparent',
                        color: viewMode === "list" ? '#1A1714' : '#9A948D'
                      }}
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Filters Tags */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1 px-3 py-1.5 rounded-sm" style={{ background: '#E8E2D9', color: '#3D3833' }}>
                      Recherche: {searchQuery}
                      <X
                        className="h-3 w-3 cursor-pointer ml-1"
                        style={{ color: '#C75B39' }}
                        onClick={() => setSearchQuery("")}
                      />
                    </Badge>
                  )}
                  {selectedCategoryData && (
                    <Badge variant="secondary" className="gap-1 px-3 py-1.5 rounded-sm" style={{ background: 'rgba(199, 91, 57, 0.1)', color: '#C75B39' }}>
                      {selectedCategoryData.name}
                      <X
                        className="h-3 w-3 cursor-pointer ml-1"
                        onClick={() => setSelectedCategory("")}
                      />
                    </Badge>
                  )}
                  {deliveryTime && (
                    <Badge variant="secondary" className="gap-1 px-3 py-1.5 rounded-sm" style={{ background: '#E8E2D9', color: '#3D3833' }}>
                      {deliveryOptions.find(d => d.value === deliveryTime)?.label}
                      <X
                        className="h-3 w-3 cursor-pointer ml-1"
                        style={{ color: '#C75B39' }}
                        onClick={() => setDeliveryTime("")}
                      />
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFilters}
                    style={{ color: '#C75B39' }}
                  >
                    Tout effacer
                  </Button>
                </div>
              )}

              {/* Services Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" style={{ color: '#C75B39' }} />
                    <p style={{ color: '#6B6560' }}>Chargement des services...</p>
                  </div>
                </div>
              ) : services && services.length > 0 ? (
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
                }>
                  {services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center rounded-sm" style={{ background: '#FFFDFB', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-sm flex items-center justify-center" style={{ background: '#E8E2D9' }}>
                    <Search className="h-10 w-10" style={{ color: '#9A948D' }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>
                    Aucun service trouvé
                  </h3>
                  <p className="mb-6 max-w-md mx-auto" style={{ color: '#6B6560' }}>
                    Essayez de modifier vos critères de recherche ou explorez d'autres catégories
                  </p>
                  <Button 
                    onClick={clearFilters}
                    className="h-12"
                    style={{ background: '#C75B39', color: '#FFFDFB' }}
                  >
                    Voir tous les services
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
