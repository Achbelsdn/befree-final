import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  User,
  Settings as SettingsIcon,
  Loader2,
  Save,
  ArrowLeft
} from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Settings() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    phone: "",
    city: "",
    avatar: "",
    skills: "",
    languages: "",
    responseTime: "",
  });

  const updateProfile = trpc.user.updateProfile.useMutation();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        phone: user.phone || "",
        city: user.city || "",
        avatar: user.avatar || "",
        skills: user.skills ? JSON.parse(user.skills).join(", ") : "",
        languages: user.languages ? JSON.parse(user.languages).join(", ") : "",
        responseTime: user.responseTime || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile.mutateAsync({
        name: formData.name,
        bio: formData.bio,
        phone: formData.phone,
        city: formData.city,
        avatar: formData.avatar,
        skills: JSON.stringify(formData.skills.split(",").map(s => s.trim()).filter(Boolean)),
        languages: JSON.stringify(formData.languages.split(",").map(s => s.trim()).filter(Boolean)),
        responseTime: formData.responseTime,
      });

      toast.success("Profil mis à jour avec succès !");
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
            <SettingsIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-heading text-xl font-semibold mb-2">Connexion requise</h2>
            <p className="text-muted-foreground mb-4">
              Connectez-vous pour accéder aux paramètres.
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="container py-8">
          <Link href={`/profile/${user?.id}`}>
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au profil
            </Button>
          </Link>

          <div className="max-w-2xl mx-auto">
            <h1 className="font-heading text-3xl font-bold mb-8">Paramètres du profil</h1>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>
                  Mettez à jour vos informations de profil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avatar Preview */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={formData.avatar || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {formData.name?.charAt(0) || user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Label htmlFor="avatar">URL de l'avatar</Label>
                      <Input
                        id="avatar"
                        type="url"
                        placeholder="https://exemple.com/avatar.jpg"
                        value={formData.avatar}
                        onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      placeholder="Votre nom"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Parlez de vous, de votre expérience..."
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                  </div>

                  {/* Contact */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+229 90 00 00 00"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Ville</Label>
                      <Input
                        id="city"
                        placeholder="Cotonou"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                  </div>

                  {user?.isSeller && (
                    <>
                      <Separator />
                      
                      <h3 className="font-heading font-semibold">Informations freelance</h3>

                      {/* Skills */}
                      <div className="space-y-2">
                        <Label htmlFor="skills">Compétences (séparées par des virgules)</Label>
                        <Input
                          id="skills"
                          placeholder="Design graphique, WordPress, Marketing..."
                          value={formData.skills}
                          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                        />
                      </div>

                      {/* Languages */}
                      <div className="space-y-2">
                        <Label htmlFor="languages">Langues (séparées par des virgules)</Label>
                        <Input
                          id="languages"
                          placeholder="Français, Anglais, Fon..."
                          value={formData.languages}
                          onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                        />
                      </div>

                      {/* Response Time */}
                      <div className="space-y-2">
                        <Label htmlFor="responseTime">Temps de réponse moyen</Label>
                        <Input
                          id="responseTime"
                          placeholder="Ex: 1 heure, 24 heures..."
                          value={formData.responseTime}
                          onChange={(e) => setFormData({ ...formData, responseTime: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <Separator />

                  <Button
                    type="submit"
                    className="w-full btn-benin"
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Enregistrer les modifications
                  </Button>
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
