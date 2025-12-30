import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { HelpCircle, MessageCircle } from "lucide-react";
import { useEffect } from "react";

const faqCategories = {
  general: {
    title: "Général",
    questions: [
      {
        question: "Qu'est-ce que Bénin Freelance ?",
        answer: "Bénin Freelance est la première plateforme de mise en relation entre freelances et clients au Bénin. Nous connectons les talents locaux avec des entreprises et particuliers ayant besoin de services professionnels dans divers domaines : développement web, design, marketing, rédaction, et bien plus."
      },
      {
        question: "Comment fonctionne la plateforme ?",
        answer: "C'est simple : les freelances créent leur profil et publient leurs services. Les clients parcourent les services disponibles ou publient leurs projets. Une fois qu'un accord est trouvé, le paiement est sécurisé via notre système escrow jusqu'à la livraison et validation du travail."
      },
      {
        question: "Est-ce que l'inscription est gratuite ?",
        answer: "Oui, l'inscription est totalement gratuite pour les clients et les freelances. Nous prélevons uniquement une commission de 10% sur les transactions réussies."
      },
      {
        question: "Quels types de services puis-je trouver ?",
        answer: "Vous trouverez une large gamme de services : développement web et mobile, design graphique et UI/UX, marketing digital et SEO, rédaction et traduction, comptabilité, assistance virtuelle, et bien d'autres."
      },
    ]
  },
  freelancers: {
    title: "Freelances",
    questions: [
      {
        question: "Comment devenir freelance sur la plateforme ?",
        answer: "Pour devenir freelance : 1) Créez votre compte, 2) Complétez votre profil avec vos compétences et expériences, 3) Passez la vérification KYC (pièce d'identité), 4) Créez votre premier service. Une fois approuvé par notre équipe, vous pourrez recevoir des commandes."
      },
      {
        question: "Qu'est-ce que la vérification KYC ?",
        answer: "La vérification KYC (Know Your Customer) est un processus obligatoire pour les freelances. Vous devez fournir une pièce d'identité valide et un justificatif de domicile. Cela garantit la confiance et la sécurité sur la plateforme."
      },
      {
        question: "Comment fixer mes tarifs ?",
        answer: "Vous êtes libre de fixer vos propres tarifs. Nous vous recommandons d'étudier les prix du marché et de valoriser votre expertise. Vous pouvez proposer différents forfaits (basique, standard, premium) pour chaque service."
      },
      {
        question: "Quand suis-je payé ?",
        answer: "Les fonds sont libérés sur votre portefeuille dès que le client valide la livraison. Vous pouvez ensuite retirer vos gains via Mobile Money (MTN, Moov, Celtiis). Les retraits sont traités sous 24-48h."
      },
      {
        question: "Comment améliorer ma visibilité ?",
        answer: "Pour être plus visible : complétez votre profil à 100%, ajoutez un portfolio de qualité, obtenez des avis positifs, répondez rapidement aux messages, et maintenez un taux de livraison élevé."
      },
    ]
  },
  clients: {
    title: "Clients",
    questions: [
      {
        question: "Comment trouver le bon freelance ?",
        answer: "Utilisez nos filtres de recherche pour trouver des freelances par compétence, tarif, note et délai de livraison. Consultez les profils, portfolios et avis des autres clients avant de faire votre choix."
      },
      {
        question: "Comment passer une commande ?",
        answer: "Trouvez un service qui vous convient, cliquez sur 'Commander', décrivez vos besoins spécifiques, puis procédez au paiement. Le freelance recevra votre commande et commencera le travail."
      },
      {
        question: "Comment publier un projet ?",
        answer: "Allez dans 'Publier un projet', décrivez votre besoin en détail, définissez votre budget et délai. Les freelances intéressés vous enverront leurs propositions. Vous pouvez ensuite choisir celui qui vous convient le mieux."
      },
      {
        question: "Que faire si je ne suis pas satisfait ?",
        answer: "Communiquez d'abord avec le freelance pour demander des modifications. Si le problème persiste, vous pouvez ouvrir un litige. Notre équipe de médiation interviendra pour trouver une solution équitable."
      },
    ]
  },
  payments: {
    title: "Paiements",
    questions: [
      {
        question: "Quels moyens de paiement sont acceptés ?",
        answer: "Nous acceptons les paiements via Mobile Money : MTN Mobile Money, Moov Money, et Celtiis. Les paiements sont sécurisés et traités par notre partenaire FedaPay."
      },
      {
        question: "Comment fonctionne le système escrow ?",
        answer: "Lorsque vous passez commande, votre paiement est sécurisé sur notre plateforme (escrow). Les fonds ne sont libérés au freelance qu'après votre validation de la livraison. Cela protège les deux parties."
      },
      {
        question: "Quels sont les frais de la plateforme ?",
        answer: "Nous prélevons une commission de 10% sur chaque transaction. Cette commission couvre les frais de paiement, l'hébergement, le support client et le développement de la plateforme."
      },
      {
        question: "Comment demander un remboursement ?",
        answer: "Si le travail n'a pas commencé, vous pouvez annuler et être remboursé intégralement. Si un litige survient après livraison, notre équipe évaluera la situation et pourra ordonner un remboursement partiel ou total."
      },
      {
        question: "Combien de temps prend un retrait ?",
        answer: "Les retraits vers Mobile Money sont généralement traités sous 24 à 48 heures ouvrées. Le montant minimum de retrait est de 1000 FCFA."
      },
    ]
  },
  security: {
    title: "Sécurité",
    questions: [
      {
        question: "Mes données sont-elles sécurisées ?",
        answer: "Oui, nous utilisons le chiffrement SSL/TLS pour toutes les communications. Vos données personnelles sont stockées de manière sécurisée et ne sont jamais vendues à des tiers."
      },
      {
        question: "Comment protéger mon compte ?",
        answer: "Utilisez un mot de passe fort et unique, ne partagez jamais vos identifiants, et méfiez-vous des tentatives de phishing. Ne communiquez jamais en dehors de la plateforme pour les transactions."
      },
      {
        question: "Que faire si je suspecte une fraude ?",
        answer: "Signalez immédiatement tout comportement suspect à notre équipe via le bouton 'Signaler' ou contactez-nous à security@beninfreelance.com. N'effectuez jamais de paiement en dehors de la plateforme."
      },
    ]
  },
};

export default function FAQ() {
  // Ensure page starts at top when navigating to FAQ
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Navbar />
      
      {/* Hero Section with proper spacing */}
      <section className="pt-24 pb-12 bg-gradient-to-b from-[#FFFDFB] to-[#FAF7F2] scroll-mt-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            {/* Eyebrow */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="inline-block w-8 h-[2px] bg-[#C75B39]"></span>
              <span className="text-sm font-semibold tracking-widest uppercase text-[#C75B39]">
                Support
              </span>
              <span className="inline-block w-8 h-[2px] bg-[#C75B39]"></span>
            </div>
            
            {/* Title with proper margin-top for visibility */}
            <h1 
              className="text-4xl md:text-5xl font-normal mb-6 scroll-mt-32"
              style={{ fontFamily: 'var(--font-serif)', color: '#1A1714' }}
            >
              Foire Aux Questions
            </h1>
            
            <p className="text-lg text-[#6B6560] max-w-2xl mx-auto">
              Trouvez rapidement des réponses à vos questions les plus fréquentes sur Bénin Freelance
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8 bg-[#FFFDFB] border border-[#E8E2D9] rounded-sm p-1">
              {Object.entries(faqCategories).map(([key, category]) => (
                <TabsTrigger 
                  key={key} 
                  value={key} 
                  className="text-sm rounded-sm data-[state=active]:bg-[#C75B39] data-[state=active]:text-white transition-all"
                >
                  {category.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(faqCategories).map(([key, category]) => (
              <TabsContent key={key} value={key}>
                <Card className="border-[#E8E2D9] bg-[#FFFDFB] rounded-sm shadow-sm">
                  <CardContent className="pt-6">
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, index) => (
                        <AccordionItem 
                          key={index} 
                          value={`item-${index}`}
                          className="border-b border-[#E8E2D9] last:border-b-0"
                        >
                          <AccordionTrigger className="text-left hover:no-underline py-4 text-[#1A1714] hover:text-[#C75B39] transition-colors">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-[#6B6560] pb-4 leading-relaxed">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          {/* Contact Section */}
          <Card className="mt-12 text-center border-[#E8E2D9] bg-[#FFFDFB] rounded-sm shadow-sm">
            <CardContent className="pt-10 pb-10">
              <div className="w-16 h-16 rounded-full bg-[#C75B39]/10 flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="h-8 w-8 text-[#C75B39]" />
              </div>
              <h2 
                className="text-2xl font-normal mb-3"
                style={{ fontFamily: 'var(--font-serif)', color: '#1A1714' }}
              >
                Vous avez d'autres questions ?
              </h2>
              <p className="text-[#6B6560] mb-8 max-w-md mx-auto">
                Notre équipe est disponible pour vous aider du lundi au samedi, de 8h à 20h
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild 
                  className="bg-[#C75B39] hover:bg-[#A84832] text-white rounded-sm px-8 py-6 h-auto"
                >
                  <Link href="/contact">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Nous contacter
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  asChild
                  className="border-[#C75B39] text-[#C75B39] hover:bg-[#C75B39] hover:text-white rounded-sm px-8 py-6 h-auto"
                >
                  <Link href="/help">Centre d'aide</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
