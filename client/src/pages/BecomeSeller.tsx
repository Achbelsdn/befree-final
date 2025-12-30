import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CheckCircle2,
  Briefcase,
  DollarSign,
  Users,
  Clock,
  Award,
  Loader2,
  ArrowRight,
  Star
} from "lucide-react";
import { useState } from "react";

const benefits = [
  {
    icon: DollarSign,
    title: "Gagnez de l'argent",
    description: "Fixez vos propres tarifs et gagnez de l'argent en faisant ce que vous aimez."
  },
  {
    icon: Clock,
    title: "Travaillez à votre rythme",
    description: "Choisissez vos horaires et travaillez d'où vous voulez."
  },
  {
    icon: Users,
    title: "Développez votre réseau",
    description: "Connectez-vous avec des clients du Bénin et d'ailleurs."
  },
  {
    icon: Award,
    title: "Construisez votre réputation",
    description: "Obtenez des avis positifs et devenez un freelance reconnu."
  },
];

const steps = [
  {
    number: "01",
    title: "Créez votre profil",
    description: "Ajoutez vos compétences, votre expérience et une photo professionnelle."
  },
  {
    number: "02",
    title: "Proposez vos services",
    description: "Créez des offres détaillées avec des prix et délais clairs."
  },
  {
    number: "03",
    title: "Recevez des commandes",
    description: "Les clients vous contactent et passent commande directement."
  },
  {
    number: "04",
    title: "Livrez et soyez payé",
    description: "Effectuez le travail, livrez et recevez votre paiement."
  },
];

export default function BecomeSeller() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    bio: "",
    phone: "",
    city: "",
    skills: "",
  });

  const becomeSeller = trpc.user.becomeSeller.useMutation();
  const updateProfile = trpc.user.updateProfile.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    try {
      // Update profile first
      await updateProfile.mutateAsync({
        bio: formData.bio,
        phone: formData.phone,
        city: formData.city,
        skills: JSON.stringify(formData.skills.split(",").map(s => s.trim()).filter(Boolean)),
      });

      // Then become seller
      await becomeSeller.mutateAsync();

      toast.success("Félicitations ! Vous êtes maintenant freelance sur BeninTalent !");
      setLocation("/services/new");
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

  // If already a seller, redirect to create service
  if (user?.isSeller) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <div className="container py-16">
            <Card className="max-w-lg mx-auto text-center p-8">
              <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="font-heading text-2xl font-bold mb-2">
                Vous êtes déjà freelance !
              </h2>
              <p className="text-muted-foreground mb-6">
                Commencez à proposer vos services sur BeninTalent.
              </p>
              <Button onClick={() => setLocation("/services/new")} className="btn-benin">
                Créer un service
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 lg:py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6">
                Devenez freelance sur{" "}
                <span className="text-gradient-benin">BeninTalent</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Rejoignez la communauté de freelances béninois et commencez à gagner de l'argent 
                en proposant vos services à des clients du monde entier.
              </p>
              {!isAuthenticated && (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="btn-benin">
                    Commencer maintenant
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 lg:py-24">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold mb-4">
                Pourquoi devenir freelance ?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Découvrez les avantages de rejoindre notre communauté de talents
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="p-6 text-center card-hover">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold mb-4">
                Comment ça marche ?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Quatre étapes simples pour commencer à gagner de l'argent
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="text-5xl font-bold text-primary/20 mb-4">{step.number}</div>
                  <h3 className="font-heading font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Registration Form */}
        {isAuthenticated && (
          <section className="py-16 lg:py-24">
            <div className="container">
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="font-heading text-2xl">
                      Complétez votre profil freelance
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Quelques informations pour commencer
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="bio">Présentez-vous</Label>
                        <Textarea
                          id="bio"
                          placeholder="Décrivez votre expérience, vos compétences et ce qui vous rend unique..."
                          rows={4}
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          required
                        />
                      </div>

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
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="skills">Compétences (séparées par des virgules)</Label>
                        <Input
                          id="skills"
                          placeholder="Design graphique, WordPress, Marketing digital..."
                          value={formData.skills}
                          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full btn-benin"
                        size="lg"
                        disabled={becomeSeller.isPending || updateProfile.isPending}
                      >
                        {(becomeSeller.isPending || updateProfile.isPending) ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Briefcase className="h-4 w-4 mr-2" />
                        )}
                        Devenir Freelance
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {!isAuthenticated && (
          <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
            <div className="container text-center">
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Prêt à commencer ?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Créez votre compte gratuitement et commencez à proposer vos services dès aujourd'hui.
              </p>
              <a href={getLoginUrl()}>
                <Button size="lg" variant="secondary">
                  Créer mon compte
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
