import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Star,
  Clock,
  RefreshCw,
  CheckCircle2,
  Heart,
  Share2,
  MessageSquare,
  ShoppingCart,
  Loader2,
  ArrowLeft,
  MapPin,
  Calendar,
  Award,
  ChevronRight,
  Phone,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";

const paymentMethods = [
  { id: "mtn", name: "MTN Mobile Money", color: "#FFCC00", textColor: "#000" },
  { id: "moov", name: "Moov Money", color: "#0066B3", textColor: "#fff" },
  { id: "celtiis", name: "Celtiis", color: "#E31937", textColor: "#fff" },
];

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<"mtn" | "moov" | "celtiis">("mtn");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [requirements, setRequirements] = useState("");

  const serviceId = parseInt(id || "0");

  const { data: service, isLoading } = trpc.service.getById.useQuery(
    { id: serviceId },
    { enabled: serviceId > 0 }
  );

  const { data: seller } = trpc.user.getProfile.useQuery(
    { userId: service?.userId || 0 },
    { enabled: !!service?.userId }
  );

  const { data: reviews } = trpc.review.byService.useQuery(
    { serviceId },
    { enabled: serviceId > 0 }
  );

  const createOrder = trpc.order.create.useMutation();
  const addFavorite = trpc.favorite.add.useMutation();
  const removeFavorite = trpc.favorite.remove.useMutation();
  const createConversation = trpc.conversation.getOrCreate.useMutation();

  const formatPrice = (price: string, currency: string) => {
    const numPrice = parseFloat(price);
    if (currency === "XOF") {
      return `${numPrice.toLocaleString('fr-FR')} FCFA`;
    }
    return `${numPrice.toLocaleString('fr-FR')} ${currency}`;
  };

  const starCount = service?.starCount ?? 0;
  const totalStars = service?.totalStars ?? 0;
  const rating = starCount > 0 ? (totalStars / starCount).toFixed(1) : "Nouveau";

  const handleOrder = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!phoneNumber || phoneNumber.length < 8) {
      toast.error("Veuillez entrer un numéro de téléphone valide");
      return;
    }

    try {
      const result = await createOrder.mutateAsync({ 
        serviceId,
        paymentMethod: selectedPayment,
        phoneNumber,
        requirements: requirements || undefined,
      });
      toast.success("Commande créée avec succès ! Vous recevrez une demande de paiement.");
      setIsOrderDialogOpen(false);
      setLocation(`/dashboard/orders`);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la commande");
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour ajouter aux favoris");
      return;
    }

    try {
      if (isFavorited) {
        await removeFavorite.mutateAsync({ serviceId });
        setIsFavorited(false);
        toast.success("Retiré des favoris");
      } else {
        await addFavorite.mutateAsync({ serviceId });
        setIsFavorited(true);
        toast.success("Ajouté aux favoris");
      }
    } catch {
      toast.error("Une erreur est survenue");
    }
  };

  const handleContact = async () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!seller) return;

    try {
      const conversation = await createConversation.mutateAsync({ otherUserId: seller.id });
      setLocation(`/dashboard/messages?conversation=${conversation?.id}`);
    } catch {
      toast.error("Erreur lors de la création de la conversation");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Service non trouvé</h1>
            <p className="text-muted-foreground mb-4">Ce service n'existe pas ou a été supprimé.</p>
            <Link href="/services">
              <Button>Voir tous les services</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const features = service.features ? JSON.parse(service.features) : [];
  const images = service.images ? JSON.parse(service.images) : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b">
          <div className="container py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Accueil</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/services" className="hover:text-foreground">Services</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground truncate max-w-[200px]">{service.title}</span>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Actions */}
              <div>
                <h1 className="font-heading text-2xl md:text-3xl font-bold mb-4">
                  {service.title}
                </h1>
                
                {/* Seller Info */}
                {seller && (
                  <div className="flex items-center gap-4 mb-4">
                    <Link href={`/profile/${seller.id}`}>
                      <Avatar className="h-12 w-12 cursor-pointer">
                        <AvatarImage src={seller.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {seller.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div>
                      <Link href={`/profile/${seller.id}`}>
                        <p className="font-medium hover:text-primary cursor-pointer">
                          {seller.name || "Freelance"}
                        </p>
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{rating}</span>
                          {starCount > 0 && <span>({starCount} avis)</span>}
                        </div>
                        {seller.city && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {seller.city}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cover Image */}
              <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                {service.coverImage ? (
                  <img
                    src={service.coverImage}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <span className="text-6xl font-bold text-primary/20">
                      {service.title.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Gallery */}
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((img: string, idx: number) => (
                    <div key={idx} className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Tabs */}
              <Tabs defaultValue="description" className="mt-8">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="reviews">Avis ({starCount})</TabsTrigger>
                  <TabsTrigger value="seller">À propos du vendeur</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{service.description}</p>
                  </div>

                  {features.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">Ce qui est inclus</h3>
                      <ul className="space-y-2">
                        {features.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="reviews" className="mt-6">
                  {reviews && reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review: any) => (
                        <Card key={review.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>U</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${
                                          i < review.rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-muted"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                                {review.comment && (
                                  <p className="text-sm">{review.comment}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Aucun avis pour le moment
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="seller" className="mt-6">
                  {seller && (
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={seller.avatar || undefined} />
                            <AvatarFallback className="text-xl">
                              {seller.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{seller.name}</h3>
                            {seller.bio && (
                              <p className="text-muted-foreground mt-2">{seller.bio}</p>
                            )}
                            <div className="flex flex-wrap gap-4 mt-4 text-sm">
                              {seller.city && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  {seller.city}, {seller.country}
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                Membre depuis {new Date(seller.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                              </div>
                              {seller.completedOrders && seller.completedOrders > 0 && (
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Award className="h-4 w-4" />
                                  {seller.completedOrders} commandes
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <Button variant="outline" className="w-full" onClick={handleContact}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contacter le vendeur
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Order Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl text-primary">
                        {formatPrice(service.price, service.currency)}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={handleFavorite}>
                          <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {service.shortDescription && (
                      <p className="text-sm text-muted-foreground">
                        {service.shortDescription}
                      </p>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Délai de livraison
                        </div>
                        <span className="font-medium">
                          {service.deliveryTime} jour{service.deliveryTime > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <RefreshCw className="h-4 w-4" />
                          Révisions
                        </div>
                        <span className="font-medium">
                          {service.revisions === -1 ? 'Illimitées' : service.revisions}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    {/* Order Dialog */}
                    <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full btn-benin" 
                          size="lg"
                          disabled={service.userId === user?.id}
                        >
                          <ShoppingCart className="h-5 w-5 mr-2" />
                          Commander maintenant
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Passer commande</DialogTitle>
                          <DialogDescription>
                            Choisissez votre mode de paiement Mobile Money
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6 py-4">
                          {/* Order Summary */}
                          <div className="bg-muted/50 rounded-lg p-4">
                            <p className="font-medium text-sm mb-2">{service.title}</p>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Prix</span>
                              <span className="font-bold text-primary">
                                {formatPrice(service.price, service.currency)}
                              </span>
                            </div>
                          </div>

                          {/* Payment Method */}
                          <div className="space-y-3">
                            <Label>Mode de paiement</Label>
                            <RadioGroup 
                              value={selectedPayment} 
                              onValueChange={(v) => setSelectedPayment(v as any)}
                              className="grid grid-cols-1 gap-2"
                            >
                              {paymentMethods.map((method) => (
                                <div key={method.id} className="relative">
                                  <RadioGroupItem
                                    value={method.id}
                                    id={method.id}
                                    className="peer sr-only"
                                  />
                                  <Label
                                    htmlFor={method.id}
                                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                  >
                                    <div 
                                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                                      style={{ backgroundColor: method.color, color: method.textColor }}
                                    >
                                      {method.id.toUpperCase().slice(0, 2)}
                                    </div>
                                    <span className="font-medium">{method.name}</span>
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>

                          {/* Phone Number */}
                          <div className="space-y-2">
                            <Label htmlFor="phone">Numéro de téléphone</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="Ex: 97000000"
                                className="pl-10"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Vous recevrez une demande de paiement sur ce numéro
                            </p>
                          </div>

                          {/* Requirements */}
                          <div className="space-y-2">
                            <Label htmlFor="requirements">Instructions (optionnel)</Label>
                            <Textarea
                              id="requirements"
                              placeholder="Décrivez vos besoins spécifiques..."
                              rows={3}
                              value={requirements}
                              onChange={(e) => setRequirements(e.target.value)}
                            />
                          </div>

                          {/* Submit */}
                          <Button 
                            className="w-full btn-benin" 
                            size="lg"
                            onClick={handleOrder}
                            disabled={createOrder.isPending}
                          >
                            {createOrder.isPending ? (
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : (
                              <Smartphone className="h-5 w-5 mr-2" />
                            )}
                            Payer {formatPrice(service.price, service.currency)}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleContact}
                      disabled={service.userId === user?.id}
                    >
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Contacter le vendeur
                    </Button>

                    {service.userId === user?.id && (
                      <p className="text-xs text-center text-muted-foreground">
                        Vous ne pouvez pas commander votre propre service
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
