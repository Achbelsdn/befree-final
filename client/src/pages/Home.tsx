import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import ChatWidget from "@/components/ChatWidget";
import { 
  Search, 
  ArrowRight, 
  Shield, 
  Briefcase,
  Code,
  Palette,
  TrendingUp,
  FileText,
  Video,
  Music,
  MessageCircle,
  CreditCard,
  CheckCircle,
  Star,
  Clock,
  Smartphone,
  MapPin,
  Users,
  Inbox
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Category icons mapping
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "developpement-it": Code,
  "design-creatif": Palette,
  "marketing-digital": TrendingUp,
  "redaction-traduction": FileText,
  "video-animation": Video,
  "musique-audio": Music,
};

// Steps for "How it works" section
const steps = [
  {
    number: "01",
    title: "Décrivez votre besoin",
    description: "Pas de formulaire interminable. Juste l'essentiel. Dites-nous ce qu'il vous faut, on s'occupe du reste.",
    icon: FileText,
  },
  {
    number: "02", 
    title: "Choisissez votre talent",
    description: "Des profils triés sur le volet. Pas de bots, pas de faux avis. De vraies personnes, vraiment compétentes.",
    icon: Users,
  },
  {
    number: "03",
    title: "Payez quand c'est fait",
    description: "Votre argent reste en sécurité jusqu'à ce que vous soyez satisfait. Mobile Money ou carte, comme vous voulez.",
    icon: CreditCard,
  },
];

// Features
const features = [
  {
    icon: Shield,
    title: "Argent protégé",
    description: "On garde vos sous jusqu'à ce que le travail soit nickel",
  },
  {
    icon: CheckCircle,
    title: "Talents vérifiés",
    description: "Chaque freelance passe par notre filtre. Pas de mauvaises surprises",
  },
  {
    icon: Smartphone,
    title: "Paiement local",
    description: "MTN, Moov, Celtiis... Payez comme vous avez l'habitude",
  },
  {
    icon: Clock,
    title: "On répond vite",
    description: "Une question ? On est là. Vraiment. Même le dimanche",
  },
];

// Loading skeleton for categories
function CategorySkeleton() {
  return (
    <Card className="p-6 border border-transparent">
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="w-12 h-12 rounded-lg mb-4" />
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="w-5 h-5" />
      </div>
    </Card>
  );
}

// Loading skeleton for services
function ServiceSkeleton() {
  return (
    <Card className="border border-transparent">
      <Skeleton className="aspect-[4/3] rounded-t-lg" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </Card>
  );
}

// Loading skeleton for freelancers
function FreelancerSkeleton() {
  return (
    <div className="bg-[#FFFDFB] rounded-sm p-4 border border-[#E8E2D9]">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-20 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

// Empty state component
function EmptyState({ title, description, icon: Icon }: { title: string; description: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-[#E8E2D9] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#9A948D]" />
      </div>
      <h3 className="text-lg font-medium text-[#3D3833] mb-2">{title}</h3>
      <p className="text-sm text-[#9A948D] max-w-md">{description}</p>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Fetch categories from API
  const { data: categories, isLoading: loadingCategories } = trpc.category.list.useQuery();
  
  // Fetch popular services from API
  const { data: popularServices, isLoading: loadingServices } = trpc.service.popular.useQuery({ limit: 6 });
  
  // Fetch top freelancers from API
  const { data: topFreelancers, isLoading: loadingFreelancers } = trpc.user.topSellers.useQuery({ limit: 3 });
  
  // Fetch platform stats from API
  const { data: platformStats, isLoading: loadingStats } = trpc.system.stats.useQuery();

  // Parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / 50;
        const y = (e.clientY - rect.top - rect.height / 2) / 50;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/services?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Format numbers for display
  const formatNumber = (num: number | undefined) => {
    if (!num) return "0";
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* ============================================
            HERO SECTION
            ============================================ */}
        <section ref={heroRef} className="hero">
          <div className="container">
            <div className="hero-grid">
              <div className="hero-content">
                {/* Eyebrow */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-block w-8 h-[2px] bg-[#C75B39]"></span>
                  <span className="text-sm font-semibold tracking-widest uppercase text-[#C75B39]">
                    Plateforme béninoise
                  </span>
                </div>
                
                <h1 className="hero-title">
                  Les talents du Bénin,{" "}
                  <span className="text-highlight">enfin réunis</span>
                  {" "}au même endroit
                </h1>
                
                <p className="hero-subtitle">
                  Fini les recherches interminables sur Facebook. Ici, vous trouvez des développeurs, designers et marketeurs béninois vérifiés. Et vous payez en Mobile Money.
                </p>
                
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="search-input-group">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9A948D]" />
                      <Input
                        type="search"
                        placeholder="Que cherchez-vous ? Un dev React, un logo..."
                        className="pl-12 h-14 bg-transparent border-0 text-[#1A1714] placeholder:text-[#9A948D] focus-visible:ring-0 text-base w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="h-12 px-8 bg-[#C75B39] hover:bg-[#A84832] text-white rounded-sm transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Chercher
                    </Button>
                  </div>
                  
                  <div className="popular-tags">
                    <span className="text-sm text-[#9A948D] mr-2">Tendances :</span>
                    <Link href="/services?category=developpement-it">
                      <span className="tag">Sites web</span>
                    </Link>
                    <Link href="/services?category=design-creatif">
                      <span className="tag">Logos</span>
                    </Link>
                    <Link href="/services?category=redaction-traduction">
                      <span className="tag">Rédaction</span>
                    </Link>
                    <Link href="/services?category=marketing-digital">
                      <span className="tag">Réseaux sociaux</span>
                    </Link>
                  </div>
                </form>
                
                <div className="hero-stats">
                  <div className="stat">
                    {loadingStats ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <strong>{formatNumber(platformStats?.totalFreelancers)}+</strong>
                    )}
                    <span>Freelances actifs</span>
                  </div>
                  <div className="stat">
                    {loadingStats ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <strong>{formatNumber(platformStats?.totalOrders)}+</strong>
                    )}
                    <span>Projets livrés</span>
                  </div>
                  <div className="stat">
                    {loadingStats ? (
                      <Skeleton className="h-8 w-12" />
                    ) : (
                      <strong>{platformStats?.averageRating || "4.8"}/5</strong>
                    )}
                    <span>Note moyenne</span>
                  </div>
                </div>
              </div>
              
              {/* Featured Freelancers Showcase - Dynamic from API */}
              <div className="hidden lg:block relative">
                <div 
                  className="space-y-4"
                  style={{
                    transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                    transition: 'transform 0.3s ease-out'
                  }}
                >
                  {loadingFreelancers ? (
                    <>
                      <FreelancerSkeleton />
                      <FreelancerSkeleton />
                      <FreelancerSkeleton />
                    </>
                  ) : topFreelancers && topFreelancers.length > 0 ? (
                    topFreelancers.map((freelancer, index) => (
                      <div 
                        key={freelancer.id}
                        className={`freelancer-card ${index === 0 ? 'featured' : ''}`}
                        style={{
                          marginLeft: index === 1 ? '2rem' : index === 2 ? '1rem' : '0',
                          transform: `rotate(${index === 0 ? '-1deg' : index === 1 ? '0.5deg' : '-0.5deg'})`
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <img 
                            src={freelancer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(freelancer.name || 'U')}&background=C75B39&color=fff`} 
                            alt={freelancer.name || 'Freelancer'}
                            className="w-14 h-14 rounded-full object-cover border-2 border-[#E8E2D9]"
                            loading="lazy"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-[#1A1714] font-sans">{freelancer.name?.split(' ')[0] || 'Freelancer'}</h4>
                              {freelancer.isSeller && (
                                <span className="badge-verified">
                                  <CheckCircle className="w-3 h-3" />
                                  Pro
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[#6B6560]">{freelancer.bio?.slice(0, 30) || 'Freelance'}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="w-4 h-4 text-[#C9A962] fill-[#C9A962]" />
                                <span className="font-medium text-[#3D3833]">{freelancer.rating || "5.0"}</span>
                                <span className="text-[#9A948D]">({freelancer.totalReviews || 0})</span>
                              </div>
                              {freelancer.city && (
                                <div className="flex items-center gap-1 text-sm text-[#9A948D]">
                                  <MapPin className="w-3 h-3" />
                                  {freelancer.city}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[#9A948D]">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Aucun freelance disponible</p>
                    </div>
                  )}
                </div>
                
                {/* Decorative elements */}
                <div 
                  className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-[#C75B39]/5"
                  style={{
                    transform: `translate(${-mousePosition.x * 2}px, ${-mousePosition.y * 2}px)`,
                  }}
                />
                <div 
                  className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-[#5C6B4A]/5"
                  style={{
                    transform: `translate(${-mousePosition.x * 1.5}px, ${-mousePosition.y * 1.5}px)`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            TRUST INDICATORS
            ============================================ */}
        <section className="py-16 bg-[#FFFDFB] border-y border-[#E8E2D9]">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 rounded-sm bg-[#C75B39]/8 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-[#C75B39] group-hover:-translate-y-1">
                    <feature.icon className="w-5 h-5 text-[#C75B39] transition-colors group-hover:text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#1A1714] mb-1 font-sans text-sm">{feature.title}</h4>
                    <p className="text-sm text-[#6B6560] leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            CATEGORIES SECTION - Dynamic from API
            ============================================ */}
        <section className="py-20 bg-[#FAF7F2]">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#C75B39] mb-3 block">
                  Catégories
                </span>
                <h2 className="text-3xl md:text-4xl font-normal text-[#1A1714] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                  Trouvez votre expert
                </h2>
                <p className="text-[#6B6560] max-w-md">
                  Du code au design, de la rédaction au marketing. Tout ce dont votre projet a besoin.
                </p>
              </div>
              <Link href="/services">
                <Button variant="ghost" className="text-[#C75B39] hover:text-[#A84832] hover:bg-[#C75B39]/5 group">
                  Tout voir
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {loadingCategories ? (
                [...Array(6)].map((_, i) => <CategorySkeleton key={i} />)
              ) : categories && categories.length > 0 ? (
                categories.slice(0, 6).map((category, index) => {
                  const IconComponent = categoryIcons[category.slug] || Briefcase;
                  return (
                    <Link key={category.id} href={`/services?category=${category.slug}`}>
                      <Card 
                        className="p-5 border border-transparent hover:border-[#C75B39] transition-all cursor-pointer group h-full bg-[#FFFDFB]"
                        style={{
                          transform: `rotate(${index % 2 === 0 ? '-0.5deg' : '0.5deg'})`,
                        }}
                      >
                        <div className="w-12 h-12 rounded-sm bg-[#C75B39]/8 group-hover:bg-[#C75B39] flex items-center justify-center mb-4 transition-all duration-300">
                          <IconComponent className="w-5 h-5 text-[#C75B39] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="font-semibold text-[#1A1714] mb-1 text-sm font-sans">
                          {category.name}
                        </h3>
                        <p className="text-xs text-[#9A948D]">
                          {category.description?.slice(0, 35)}...
                        </p>
                      </Card>
                    </Link>
                  );
                })
              ) : (
                <EmptyState 
                  title="Aucune catégorie" 
                  description="Les catégories seront bientôt disponibles." 
                  icon={Briefcase} 
                />
              )}
            </div>
          </div>
        </section>

        {/* ============================================
            HOW IT WORKS
            ============================================ */}
        <section className="py-20 bg-[#FFFDFB]">
          <div className="container">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#C75B39] mb-3 block">
                Comment ça marche
              </span>
              <h2 className="text-3xl md:text-4xl font-normal text-[#1A1714] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                Simple comme bonjour
              </h2>
              <p className="text-[#6B6560] max-w-lg mx-auto">
                Pas de process compliqué. Pas de jargon. Juste vous, votre projet, et le bon freelance.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-12 left-[20%] w-[60%] h-[2px] bg-gradient-to-r from-[#E8E2D9] via-[#E8A090] to-[#E8E2D9]" />
              
              {steps.map((step, index) => (
                <div key={index} className="text-center relative group">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full bg-[#FFFDFB] border-2 border-[#C75B39] text-[#C75B39] flex items-center justify-center mx-auto text-2xl transition-all duration-500 group-hover:bg-[#C75B39] group-hover:text-white group-hover:scale-110 group-hover:-rotate-6" style={{ fontFamily: 'var(--font-serif)' }}>
                      {step.number}
                    </div>
                  </div>
                  <h3 className="font-semibold text-[#1A1714] mb-3 text-lg font-sans">{step.title}</h3>
                  <p className="text-[#6B6560] leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-14">
              <Link href={isAuthenticated ? "/projects/new" : "/register"}>
                <Button className="bg-[#5C6B4A] hover:bg-[#4A5A3C] text-white px-10 py-6 h-auto text-base rounded-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  Publier mon projet
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <p className="text-sm text-[#9A948D] mt-4">C'est gratuit. Vraiment.</p>
            </div>
          </div>
        </section>

        {/* ============================================
            POPULAR SERVICES - Dynamic from API
            ============================================ */}
        <section className="py-20 bg-[#FAF7F2]">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs font-semibold tracking-widest uppercase text-[#C75B39] mb-3 block">
                  Services populaires
                </span>
                <h2 className="text-3xl md:text-4xl font-normal text-[#1A1714] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                  Ce qui marche en ce moment
                </h2>
                <p className="text-[#6B6560] max-w-md">
                  Les services les plus demandés par les entrepreneurs béninois.
                </p>
              </div>
              <Link href="/services">
                <Button variant="ghost" className="text-[#C75B39] hover:text-[#A84832] hover:bg-[#C75B39]/5 group">
                  Explorer tout
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loadingServices ? (
                [...Array(6)].map((_, i) => <ServiceSkeleton key={i} />)
              ) : popularServices && popularServices.length > 0 ? (
                popularServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))
              ) : (
                <EmptyState 
                  title="Aucun service disponible" 
                  description="Les services seront bientôt disponibles. Revenez plus tard !" 
                  icon={Inbox} 
                />
              )}
            </div>
          </div>
        </section>

        {/* ============================================
            STATS SECTION - Dynamic from API
            ============================================ */}
        <section className="py-20 bg-[#1A1714] text-[#FAF7F2] relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-[#C75B39]/5 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-[#5C6B4A]/5 blur-3xl" />
          </div>
          
          <div className="container relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-normal text-[#FAF7F2] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                Des chiffres qui parlent
              </h2>
              <p className="text-[#9A948D] max-w-lg mx-auto">
                Pas du blabla marketing. Juste la réalité de notre communauté.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                {loadingStats ? (
                  <Skeleton className="h-16 w-24 mx-auto mb-2 bg-[#3D3833]" />
                ) : (
                  <div className="text-5xl md:text-6xl font-normal mb-2 text-[#FAF7F2]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {formatNumber(platformStats?.totalFreelancers || 0)}
                  </div>
                )}
                <div className="text-[#9A948D] text-sm">Freelances actifs</div>
              </div>
              <div className="text-center">
                {loadingStats ? (
                  <Skeleton className="h-16 w-24 mx-auto mb-2 bg-[#3D3833]" />
                ) : (
                  <div className="text-5xl md:text-6xl font-normal mb-2 text-[#FAF7F2]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {formatNumber(platformStats?.totalOrders || 0)}
                  </div>
                )}
                <div className="text-[#9A948D] text-sm">Projets livrés</div>
              </div>
              <div className="text-center">
                {loadingStats ? (
                  <Skeleton className="h-16 w-16 mx-auto mb-2 bg-[#3D3833]" />
                ) : (
                  <div className="text-5xl md:text-6xl font-normal mb-2 text-[#E8A090]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {platformStats?.satisfactionRate || 98}%
                  </div>
                )}
                <div className="text-[#9A948D] text-sm">Clients satisfaits</div>
              </div>
              <div className="text-center">
                {loadingStats ? (
                  <Skeleton className="h-16 w-16 mx-auto mb-2 bg-[#3D3833]" />
                ) : (
                  <div className="text-5xl md:text-6xl font-normal mb-2 text-[#FAF7F2]" style={{ fontFamily: 'var(--font-serif)' }}>
                    {platformStats?.averageResponseTime || "24h"}
                  </div>
                )}
                <div className="text-[#9A948D] text-sm">Temps de réponse</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            PAYMENT PARTNERS SECTION
            ============================================ */}
        <section className="py-16 bg-[#FAF7F2]">
          <div className="container">
            <div className="text-center mb-10">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#C75B39] mb-3 block">
                Partenaires de paiement
              </span>
              <h2 className="text-2xl md:text-3xl font-normal text-[#1A1714] mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                Payez comme vous voulez
              </h2>
              <p className="text-[#6B6560] max-w-lg mx-auto">
                Mobile Money ou carte bancaire, on s'adapte à vos habitudes.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
              <div className="flex flex-col items-center">
                <img src="/mtn.png" alt="MTN Mobile Money" className="h-16 md:h-20 object-contain" />
                <span className="text-sm text-[#6B6560] mt-2">MTN MoMo</span>
              </div>
              <div className="flex flex-col items-center">
                <img src="/moov.png" alt="Moov Africa" className="h-16 md:h-20 object-contain" />
                <span className="text-sm text-[#6B6560] mt-2">Moov Money</span>
              </div>
              <div className="flex flex-col items-center">
                <img src="/celtiis.png" alt="Celtiis" className="h-16 md:h-20 object-contain" />
                <span className="text-sm text-[#6B6560] mt-2">Celtiis</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================
            CTA SECTION
            ============================================ */}
        <section className="py-20 bg-[#FFFDFB]">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-normal text-[#1A1714] mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                Prêt à lancer votre projet ?
              </h2>
              <p className="text-lg text-[#6B6560] mb-10 leading-relaxed">
                Décrivez ce dont vous avez besoin. En quelques heures, des freelances qualifiés vous envoient leurs propositions. Vous choisissez. C'est tout.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={isAuthenticated ? "/projects/new" : "/register"}>
                  <Button className="bg-[#C75B39] hover:bg-[#A84832] text-white px-10 py-6 h-auto text-base rounded-sm w-full sm:w-auto transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    Publier un projet
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" className="border-[#C75B39] text-[#C75B39] hover:bg-[#C75B39] hover:text-white px-10 py-6 h-auto text-base rounded-sm w-full sm:w-auto transition-all duration-300">
                    Voir les services
                  </Button>
                </Link>
              </div>
              
              {/* Contact Info */}
              <div className="mt-14 pt-10 border-t border-[#E8E2D9]">
                <p className="text-sm text-[#9A948D] mb-5">Une question ? On est là.</p>
                <div className="flex flex-wrap justify-center gap-8">
                  <a 
                    href="https://wa.me/22960000000" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#5C6B4A] hover:text-[#4A5A3C] transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </a>
                  <a 
                    href="tel:+22960000000"
                    className="flex items-center gap-2 text-[#C75B39] hover:text-[#A84832] transition-colors"
                  >
                    <Smartphone className="w-5 h-5" />
                    +229 60 00 00 00
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <ChatWidget />
    </div>
  );
}
