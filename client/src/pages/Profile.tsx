import { useParams, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Star,
  MapPin,
  Calendar,
  Award,
  MessageSquare,
  Loader2,
  Settings,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Globe,
  Languages,
  ExternalLink,
  Image as ImageIcon,
  GraduationCap,
  Quote,
  ThumbsUp,
  Users,
  TrendingUp,
  Zap,
  Heart,
  Share2,
  MoreHorizontal,
  Link as LinkIcon,
  Mail,
  Phone,
} from "lucide-react";
import { getLoginUrl } from "@/const";
import { useState } from "react";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const userId = parseInt(id || "0");
  const isOwnProfile = currentUser?.id === userId;

  const { data: profile, isLoading } = trpc.user.getProfile.useQuery(
    { userId },
    { enabled: userId > 0 }
  );

  const { data: services } = trpc.service.getByUser.useQuery(
    { userId },
    { enabled: userId > 0 }
  );

  const { data: portfolio } = trpc.portfolio.byUser.useQuery(
    { userId },
    { enabled: userId > 0 }
  );

  const { data: certifications } = trpc.certification.byUser.useQuery(
    { userId },
    { enabled: userId > 0 }
  );

  const { data: reviews } = trpc.mutualReview.forUser.useQuery(
    { userId },
    { enabled: userId > 0 }
  );

  const createConversation = trpc.conversation.getOrCreate.useMutation();

  const handleContact = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    try {
      const conversation = await createConversation.mutateAsync({ otherUserId: userId });
      setLocation(`/messages/${conversation?.id}`);
    } catch {
      toast.error("Erreur lors de la création de la conversation");
    }
  };

  const skills = profile?.skills ? JSON.parse(profile.skills) : [];
  const languages = profile?.languages ? JSON.parse(profile.languages) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <h2 className="font-heading text-xl font-semibold mb-2">Profil non trouvé</h2>
            <p className="text-muted-foreground mb-4">
              Cet utilisateur n'existe pas ou a été supprimé.
            </p>
            <Link href="/">
              <Button>Retour à l'accueil</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const rating = profile.rating ? parseFloat(profile.rating).toFixed(1) : "0.0";
  const ratingNum = parseFloat(rating);

  // Calculate rating distribution (mock data for now)
  const ratingDistribution = {
    5: 70,
    4: 20,
    3: 7,
    2: 2,
    1: 1,
  };

  // Calculate average ratings from reviews
  const avgCommunication = reviews?.length 
    ? (reviews.reduce((sum: number, r: any) => sum + (r.communicationRating || r.rating), 0) / reviews.length).toFixed(1)
    : "0.0";
  const avgQuality = reviews?.length
    ? (reviews.reduce((sum: number, r: any) => sum + (r.qualityRating || r.rating), 0) / reviews.length).toFixed(1)
    : "0.0";
  const avgTimeliness = reviews?.length
    ? (reviews.reduce((sum: number, r: any) => sum + (r.timelinessRating || r.rating), 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar />

      <main className="flex-1">
        {/* Cover Image */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-primary via-primary/80 to-accent relative">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        </div>

        <div className="container relative">
          {/* Profile Header Card */}
          <Card className="-mt-24 mb-6 overflow-visible">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="relative -mt-20 md:-mt-24">
                  <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl">
                    <AvatarImage src={profile.avatar || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-4xl md:text-5xl">
                      {profile.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {profile.kycStatus === "verified" && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 pt-2">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="font-heading text-2xl md:text-3xl font-bold">
                          {profile.name || "Utilisateur"}
                        </h1>
                        {profile.kycStatus === "verified" && (
                          <Badge variant="success" className="gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Vérifié
                          </Badge>
                        )}
                      </div>
                      
                      {profile.isSeller && (
                        <p className="text-lg text-muted-foreground mb-3">
                          {profile.bio?.split('.')[0] || "Freelance professionnel"}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        {profile.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {profile.city}, {profile.country || "Bénin"}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Membre depuis {new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </div>
                        {profile.responseTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Répond en {profile.responseTime}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {isOwnProfile ? (
                        <Link href="/dashboard/settings">
                          <Button variant="outline">
                            <Settings className="h-4 w-4 mr-2" />
                            Modifier le profil
                          </Button>
                        </Link>
                      ) : (
                        <>
                          <Button onClick={handleContact} disabled={createConversation.isPending} className="btn-benin">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contacter
                          </Button>
                          <Button variant="outline" size="icon">
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stats Row */}
                  {profile.isSeller && (
                    <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          {rating}
                        </div>
                        <p className="text-sm text-muted-foreground">{profile.totalReviews || 0} avis</p>
                      </div>
                      <Separator orientation="vertical" className="h-12" />
                      <div className="text-center">
                        <p className="text-2xl font-bold">{profile.completedOrders || 0}</p>
                        <p className="text-sm text-muted-foreground">Commandes</p>
                      </div>
                      <Separator orientation="vertical" className="h-12" />
                      <div className="text-center">
                        <p className="text-2xl font-bold">{services?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Services</p>
                      </div>
                      <Separator orientation="vertical" className="h-12" />
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">98%</p>
                        <p className="text-sm text-muted-foreground">Satisfaction</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
            {/* Left Sidebar */}
            <div className="space-y-6">
              {/* About Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">À propos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.bio && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    {profile.city && (
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile.city}, {profile.country || "Bénin"}</span>
                      </div>
                    )}
                    {languages.length > 0 && (
                      <div className="flex items-center gap-3">
                        <Languages className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{languages.join(", ")}</span>
                      </div>
                    )}
                    {profile.responseTime && (
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Temps de réponse: {profile.responseTime}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Skills Card */}
              {skills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compétences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Certifications Card */}
              {certifications && certifications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {certifications.map((cert: any) => (
                      <div key={cert.id} className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{cert.name}</p>
                          <p className="text-xs text-muted-foreground">{cert.issuingOrganization}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(cert.issueDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                          </p>
                          {cert.credentialUrl && (
                            <a 
                              href={cert.credentialUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Voir le certificat
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Badges Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {profile.kycStatus === "verified" && (
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-1">
                          <ShieldCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-xs">Vérifié</p>
                      </div>
                    )}
                    {(profile.completedOrders || 0) >= 10 && (
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-1">
                          <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                        <p className="text-xs">Top Seller</p>
                      </div>
                    )}
                    {ratingNum >= 4.5 && (
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-1">
                          <Star className="h-6 w-6 text-yellow-600" />
                        </div>
                        <p className="text-xs">Top Rated</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="services" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="services">
                    Services ({services?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="portfolio">
                    Portfolio ({portfolio?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="reviews">
                    Avis ({reviews?.length || 0})
                  </TabsTrigger>
                </TabsList>

                {/* Services Tab */}
                <TabsContent value="services" className="mt-6">
                  {services && services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {services.map((service) => (
                        <ServiceCard 
                          key={service.id} 
                          service={service}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="p-12 text-center">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="font-heading font-semibold text-lg mb-2">
                        {isOwnProfile ? "Vous n'avez pas encore de services" : "Aucun service disponible"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {isOwnProfile 
                          ? "Commencez à proposer vos services pour attirer des clients."
                          : "Cet utilisateur n'a pas encore publié de services."
                        }
                      </p>
                      {isOwnProfile && profile.isSeller && (
                        <Link href="/dashboard/services/new">
                          <Button className="btn-benin">Créer un service</Button>
                        </Link>
                      )}
                    </Card>
                  )}
                </TabsContent>

                {/* Portfolio Tab */}
                <TabsContent value="portfolio" className="mt-6">
                  {portfolio && portfolio.length > 0 ? (
                    <div className="space-y-6">
                      {/* Portfolio Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {portfolio.map((item: any, index: number) => (
                          <Card 
                            key={item.id} 
                            className="overflow-hidden cursor-pointer group"
                            onClick={() => setActiveImageIndex(index)}
                          >
                            <div className="aspect-video relative overflow-hidden">
                              <img 
                                src={item.imageUrl} 
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="text-white text-center p-4">
                                  <p className="font-medium truncate">{item.title}</p>
                                  {item.category && (
                                    <Badge variant="secondary" className="mt-2">{item.category}</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>

                      {/* Selected Portfolio Item */}
                      {portfolio[activeImageIndex] && (
                        <Card>
                          <CardContent className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="aspect-video rounded-lg overflow-hidden">
                                <img 
                                  src={portfolio[activeImageIndex].imageUrl}
                                  alt={portfolio[activeImageIndex].title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="font-heading text-xl font-bold mb-2">
                                  {portfolio[activeImageIndex].title}
                                </h3>
                                {portfolio[activeImageIndex].category && (
                                  <Badge variant="secondary" className="mb-3">
                                    {portfolio[activeImageIndex].category}
                                  </Badge>
                                )}
                                {portfolio[activeImageIndex].description && (
                                  <p className="text-muted-foreground text-sm mb-4">
                                    {portfolio[activeImageIndex].description}
                                  </p>
                                )}
                                {portfolio[activeImageIndex].clientName && (
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">Client:</span>{" "}
                                    {portfolio[activeImageIndex].clientName}
                                  </p>
                                )}
                                {portfolio[activeImageIndex].projectUrl && (
                                  <a 
                                    href={portfolio[activeImageIndex].projectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-primary hover:underline mt-4"
                                  >
                                    <LinkIcon className="h-4 w-4" />
                                    Voir le projet
                                  </a>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <Card className="p-12 text-center">
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="font-heading font-semibold text-lg mb-2">
                        {isOwnProfile ? "Votre portfolio est vide" : "Aucun projet dans le portfolio"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {isOwnProfile 
                          ? "Ajoutez vos meilleurs travaux pour impressionner les clients."
                          : "Cet utilisateur n'a pas encore ajouté de projets."
                        }
                      </p>
                      {isOwnProfile && (
                        <Link href="/dashboard/settings">
                          <Button className="btn-benin">Ajouter un projet</Button>
                        </Link>
                      )}
                    </Card>
                  )}
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="mt-6">
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-6">
                      {/* Rating Summary */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="grid md:grid-cols-2 gap-8">
                            {/* Overall Rating */}
                            <div className="text-center md:text-left">
                              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                                <span className="text-5xl font-bold">{rating}</span>
                                <div>
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star 
                                        key={star}
                                        className={`h-5 w-5 ${star <= ratingNum ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                      />
                                    ))}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {profile.totalReviews || 0} avis
                                  </p>
                                </div>
                              </div>

                              {/* Rating Distribution */}
                              <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((stars) => (
                                  <div key={stars} className="flex items-center gap-2">
                                    <span className="text-sm w-8">{stars} ★</span>
                                    <Progress value={ratingDistribution[stars as keyof typeof ratingDistribution]} className="h-2 flex-1" />
                                    <span className="text-sm text-muted-foreground w-8">
                                      {ratingDistribution[stars as keyof typeof ratingDistribution]}%
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Category Ratings */}
                            <div className="space-y-4">
                              <h4 className="font-medium">Évaluations détaillées</h4>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Communication</span>
                                  <div className="flex items-center gap-2">
                                    <Progress value={parseFloat(avgCommunication) * 20} className="h-2 w-24" />
                                    <span className="text-sm font-medium">{avgCommunication}</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Qualité du travail</span>
                                  <div className="flex items-center gap-2">
                                    <Progress value={parseFloat(avgQuality) * 20} className="h-2 w-24" />
                                    <span className="text-sm font-medium">{avgQuality}</span>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Respect des délais</span>
                                  <div className="flex items-center gap-2">
                                    <Progress value={parseFloat(avgTimeliness) * 20} className="h-2 w-24" />
                                    <span className="text-sm font-medium">{avgTimeliness}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Individual Reviews */}
                      <div className="space-y-4">
                        {reviews.map((review: any) => (
                          <Card key={review.id}>
                            <CardContent className="p-6">
                              <div className="flex gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={review.reviewer?.avatar} />
                                  <AvatarFallback>
                                    {review.reviewer?.name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className="font-medium">{review.reviewer?.name || "Utilisateur"}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="flex">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <Star 
                                              key={star}
                                              className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                          {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                        </span>
                                      </div>
                                    </div>
                                    <Badge variant="outline">
                                      {review.reviewerType === 'client' ? 'Client' : 'Freelance'}
                                    </Badge>
                                  </div>
                                  {review.comment && (
                                    <p className="mt-3 text-muted-foreground">
                                      {review.comment}
                                    </p>
                                  )}
                                  {review.response && (
                                    <div className="mt-4 pl-4 border-l-2 border-primary/20">
                                      <p className="text-sm font-medium mb-1">Réponse du freelance</p>
                                      <p className="text-sm text-muted-foreground">{review.response}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Card className="p-12 text-center">
                      <Quote className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="font-heading font-semibold text-lg mb-2">
                        Aucun avis pour le moment
                      </h3>
                      <p className="text-muted-foreground">
                        Les avis apparaîtront ici après les premières collaborations.
                      </p>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
