import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation, Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  Plus,
  X,
  Image as ImageIcon
} from "lucide-react";
import { useState } from "react";

const categories = [
  { id: 1, name: "Développement & IT", slug: "developpement-it" },
  { id: 2, name: "Design & Créatif", slug: "design-creatif" },
  { id: 3, name: "Marketing Digital", slug: "marketing-digital" },
  { id: 4, name: "Rédaction & Traduction", slug: "redaction-traduction" },
  { id: 5, name: "Vidéo & Animation", slug: "video-animation" },
  { id: 6, name: "Musique & Audio", slug: "musique-audio" },
  { id: 7, name: "Formation", slug: "formation" },
  { id: 8, name: "Photographie", slug: "photographie" },
];

export default function CreateService() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [features, setFeatures] = useState<string[]>([""]);
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    description: "",
    shortDescription: "",
    price: "",
    deliveryTime: "",
    revisions: "1",
    requirements: "",
    coverImage: "",
  });

  const createService = trpc.service.create.useMutation();

  const handleAddFeature = () => {
    setFeatures([...features, ""]);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!user?.isSeller) {
      toast.error("Vous devez d'abord devenir freelance");
      setLocation("/become-seller");
      return;
    }

    try {
      const result = await createService.mutateAsync({
        title: formData.title,
        categoryId: parseInt(formData.categoryId),
        description: formData.description,
        shortDescription: formData.shortDescription,
        price: formData.price,
        deliveryTime: parseInt(formData.deliveryTime),
        revisions: parseInt(formData.revisions),
        requirements: formData.requirements,
        coverImage: formData.coverImage || undefined,
        features: JSON.stringify(features.filter(f => f.trim())),
      });

      toast.success("Service créé avec succès !");
      setLocation(`/service/${result.serviceId}`);
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    }
  };

  if (loading) {
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <h2 className="font-heading text-xl font-semibold mb-2">Connexion requise</h2>
            <p className="text-muted-foreground mb-4">
              Vous devez être connecté pour créer un service.
            </p>
            <a href={getLoginUrl()}>
              <Button className="btn-benin">Se connecter</Button>
            </a>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user?.isSeller) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <h2 className="font-heading text-xl font-semibold mb-2">Devenez freelance</h2>
            <p className="text-muted-foreground mb-4">
              Vous devez d'abord devenir freelance pour proposer des services.
            </p>
            <Link href="/become-seller">
              <Button className="btn-benin">Devenir Freelance</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="container py-8">
          <Link href="/dashboard/services">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à mes services
            </Button>
          </Link>

          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-2xl">
                  Créer un nouveau service
                </CardTitle>
                <CardDescription>
                  Décrivez votre service de manière détaillée pour attirer les clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre du service *</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Je vais créer votre logo professionnel"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground">
                      Commencez par "Je vais..." pour un meilleur impact
                    </p>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Short Description */}
                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Description courte</Label>
                    <Input
                      id="shortDescription"
                      placeholder="Une phrase qui résume votre service"
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      maxLength={150}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description détaillée *</Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez en détail ce que vous proposez, votre expérience, votre processus de travail..."
                      rows={6}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  {/* Price and Delivery */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Prix (FCFA) *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="5000"
                        min="500"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deliveryTime">Délai (jours) *</Label>
                      <Input
                        id="deliveryTime"
                        type="number"
                        placeholder="3"
                        min="1"
                        max="90"
                        value={formData.deliveryTime}
                        onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="revisions">Révisions</Label>
                      <Input
                        id="revisions"
                        type="number"
                        placeholder="1"
                        min="0"
                        max="10"
                        value={formData.revisions}
                        onChange={(e) => setFormData({ ...formData, revisions: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <Label>Ce qui est inclus</Label>
                    <div className="space-y-2">
                      {features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Ex: Fichier source inclus"
                            value={feature}
                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                          />
                          {features.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveFeature(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddFeature}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Ce dont vous avez besoin du client</Label>
                    <Textarea
                      id="requirements"
                      placeholder="Décrivez les informations ou fichiers que le client doit vous fournir..."
                      rows={3}
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    />
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-2">
                    <Label htmlFor="coverImage">Image de couverture (URL)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="coverImage"
                        type="url"
                        placeholder="https://exemple.com/image.jpg"
                        value={formData.coverImage}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      />
                    </div>
                    {formData.coverImage && (
                      <div className="mt-2 rounded-lg overflow-hidden border aspect-video max-w-xs">
                        <img
                          src={formData.coverImage}
                          alt="Aperçu"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Utilisez une image de haute qualité (recommandé: 1280x720px)
                    </p>
                  </div>

                  {/* Submit */}
                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 btn-benin"
                      size="lg"
                      disabled={createService.isPending}
                    >
                      {createService.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Publier le service
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
