import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Search,
  User,
  CreditCard,
  ShieldCheck,
  MessageCircle,
  FileText,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Briefcase,
  Star,
} from "lucide-react";
import { useState } from "react";

const helpCategories = [
  {
    icon: User,
    title: "Compte & Profil",
    description: "Gérer votre compte, modifier votre profil, paramètres de sécurité",
    articles: 12,
    href: "/help/account",
  },
  {
    icon: Briefcase,
    title: "Freelances",
    description: "Créer des services, gérer les commandes, optimiser votre profil",
    articles: 18,
    href: "/help/freelancers",
  },
  {
    icon: FileText,
    title: "Projets & Commandes",
    description: "Publier un projet, passer commande, suivi des livraisons",
    articles: 15,
    href: "/help/projects",
  },
  {
    icon: CreditCard,
    title: "Paiements",
    description: "Mobile money, retraits, facturation, remboursements",
    articles: 10,
    href: "/help/payments",
  },
  {
    icon: ShieldCheck,
    title: "Sécurité & KYC",
    description: "Vérification d'identité, protection du compte, escrow",
    articles: 8,
    href: "/help/security",
  },
  {
    icon: MessageCircle,
    title: "Messages",
    description: "Communication avec les clients/freelances, notifications",
    articles: 6,
    href: "/help/messages",
  },
];

const popularArticles = [
  { title: "Comment créer mon premier service ?", href: "/help/create-service" },
  { title: "Comment fonctionne le système de paiement escrow ?", href: "/help/escrow" },
  { title: "Comment vérifier mon identité (KYC) ?", href: "/help/kyc" },
  { title: "Comment retirer mes gains ?", href: "/help/withdraw" },
  { title: "Que faire en cas de litige ?", href: "/help/disputes" },
  { title: "Comment optimiser mon profil freelance ?", href: "/help/optimize-profile" },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 scroll-mt-32">
                Centre d'Aide
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Comment pouvons-nous vous aider aujourd'hui ?
              </p>
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher dans l'aide..."
                  className="pl-12 h-14 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container">
            <h2 className="font-heading text-2xl font-bold mb-8">Parcourir par catégorie</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helpCategories.map((category) => (
                <Link key={category.title} href={category.href}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="flex items-center justify-between">
                        {category.title}
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{category.articles} articles</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="flex items-center gap-3 mb-8">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="font-heading text-2xl font-bold">Articles populaires</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {popularArticles.map((article) => (
                <Link key={article.title} href={article.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                        <span className="group-hover:text-primary transition-colors">{article.title}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="py-16">
          <div className="container">
            <Card className="max-w-2xl mx-auto text-center">
              <CardContent className="pt-8 pb-8">
                <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="font-heading text-2xl font-bold mb-2">
                  Vous n'avez pas trouvé votre réponse ?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Notre équipe support est disponible pour vous aider du lundi au vendredi, de 8h à 18h.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild className="btn-benin">
                    <Link href="/contact">Nous contacter</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/faq">Consulter la FAQ</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
