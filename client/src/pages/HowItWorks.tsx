import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Search,
  MessageSquare,
  CreditCard,
  CheckCircle,
  Star,
  Shield,
  Clock,
  Users,
  ArrowRight,
  Briefcase,
  FileText,
  Wallet,
} from "lucide-react";

const clientSteps = [
  {
    icon: Search,
    title: "1. Trouvez le talent idéal",
    description: "Parcourez notre catalogue de services ou publiez votre projet. Filtrez par compétence, budget et délai pour trouver le freelance parfait.",
  },
  {
    icon: MessageSquare,
    title: "2. Discutez et validez",
    description: "Échangez avec le freelance pour préciser vos besoins. Posez vos questions et assurez-vous que vous êtes sur la même longueur d'onde.",
  },
  {
    icon: CreditCard,
    title: "3. Payez en toute sécurité",
    description: "Effectuez le paiement via Mobile Money. Vos fonds sont sécurisés en escrow jusqu'à la livraison du travail.",
  },
  {
    icon: CheckCircle,
    title: "4. Recevez et validez",
    description: "Le freelance livre son travail. Vérifiez, demandez des modifications si nécessaire, puis validez pour libérer le paiement.",
  },
];

const freelancerSteps = [
  {
    icon: Users,
    title: "1. Créez votre profil",
    description: "Inscrivez-vous gratuitement et complétez votre profil avec vos compétences, expériences et portfolio.",
  },
  {
    icon: Shield,
    title: "2. Vérifiez votre identité",
    description: "Passez la vérification KYC pour gagner la confiance des clients et débloquer toutes les fonctionnalités.",
  },
  {
    icon: Briefcase,
    title: "3. Publiez vos services",
    description: "Créez des offres de services attractives avec des descriptions claires, des tarifs compétitifs et des exemples de travaux.",
  },
  {
    icon: Wallet,
    title: "4. Gagnez et retirez",
    description: "Recevez des commandes, livrez un travail de qualité, et retirez vos gains via Mobile Money.",
  },
];

const features = [
  {
    icon: Shield,
    title: "Paiement sécurisé",
    description: "Système escrow qui protège les deux parties. Les fonds sont libérés uniquement après validation.",
  },
  {
    icon: Clock,
    title: "Support réactif",
    description: "Notre équipe est disponible pour vous aider en cas de question ou de problème.",
  },
  {
    icon: Star,
    title: "Talents vérifiés",
    description: "Tous nos freelances passent par un processus de vérification KYC.",
  },
  {
    icon: FileText,
    title: "Contrats clairs",
    description: "Chaque commande définit clairement les livrables, délais et conditions.",
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 scroll-mt-32">
                Comment ça marche ?
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Bénin Freelance simplifie la collaboration entre clients et freelances. 
                Découvrez comment notre plateforme fonctionne.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="btn-benin">
                  <Link href="/services">Trouver un freelance</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/become-seller">Devenir freelance</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* For Clients */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">Pour les clients</span>
              <h2 className="font-heading text-3xl font-bold mt-2">
                Trouvez le freelance parfait en 4 étapes
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {clientSteps.map((step, index) => (
                <Card key={step.title} className="relative">
                  {index < clientSteps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground z-10" />
                  )}
                  <CardHeader>
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <step.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{step.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* For Freelancers */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">Pour les freelances</span>
              <h2 className="font-heading text-3xl font-bold mt-2">
                Lancez votre activité freelance
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {freelancerSteps.map((step, index) => (
                <Card key={step.title} className="relative">
                  {index < freelancerSteps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground z-10" />
                  )}
                  <CardHeader>
                    <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                      <step.icon className="h-7 w-7 text-green-600" />
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{step.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold">
                Pourquoi choisir Bénin Freelance ?
              </h2>
              <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
                Une plateforme pensée pour les réalités du marché béninois
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Escrow Explanation */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-12 w-12 text-green-600" />
                    </div>
                    <div>
                      <h2 className="font-heading text-2xl font-bold mb-4">
                        Le système Escrow : votre sécurité avant tout
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        Lorsqu'un client passe commande, son paiement est sécurisé sur notre plateforme. 
                        Les fonds ne sont libérés au freelance qu'après validation de la livraison par le client.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Protection contre les non-paiements pour les freelances</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Garantie de livraison pour les clients</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Médiation en cas de litige</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="font-heading text-3xl font-bold mb-4">
                  Prêt à commencer ?
                </h2>
                <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                  Rejoignez des milliers de freelances et clients qui font confiance à Bénin Freelance
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="secondary" size="lg" asChild>
                    <Link href="/register">Créer un compte gratuit</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="bg-transparent border-primary-foreground/20 hover:bg-primary-foreground/10" asChild>
                    <Link href="/services">Explorer les services</Link>
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
