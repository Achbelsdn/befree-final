import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Cookies() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-4xl font-bold mb-8 scroll-mt-32">Politique de Cookies</h1>
          <p className="text-muted-foreground mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          
          <Card className="mb-8">
            <CardContent className="pt-6 prose prose-neutral dark:prose-invert max-w-none">
              <h2 className="text-2xl font-semibold mb-4">1. Qu'est-ce qu'un Cookie ?</h2>
              <p className="mb-4">
                Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, smartphone, tablette) 
                lorsque vous visitez un site web. Les cookies permettent au site de mémoriser vos actions et 
                préférences pendant une période donnée.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">2. Types de Cookies Utilisés</h2>
              <p className="mb-4">Nous utilisons différents types de cookies sur notre plateforme :</p>
              
              <Table className="mb-6">
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Finalité</TableHead>
                    <TableHead>Durée</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Cookies essentiels</TableCell>
                    <TableCell>Nécessaires au fonctionnement du site (authentification, sécurité)</TableCell>
                    <TableCell>Session / 30 jours</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Cookies de préférences</TableCell>
                    <TableCell>Mémoriser vos choix (langue, thème)</TableCell>
                    <TableCell>1 an</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Cookies analytiques</TableCell>
                    <TableCell>Comprendre l'utilisation du site</TableCell>
                    <TableCell>2 ans</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Cookies de performance</TableCell>
                    <TableCell>Améliorer les performances du site</TableCell>
                    <TableCell>1 an</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <h2 className="text-2xl font-semibold mb-4 mt-8">3. Cookies Essentiels</h2>
              <p className="mb-4">
                Ces cookies sont indispensables au fonctionnement de la plateforme. Ils permettent notamment :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>De maintenir votre session de connexion</li>
                <li>De sécuriser vos transactions</li>
                <li>De mémoriser les articles de votre panier</li>
                <li>D'assurer la sécurité de votre compte</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4 mt-8">4. Cookies Analytiques</h2>
              <p className="mb-4">
                Nous utilisons des cookies analytiques pour comprendre comment les visiteurs interagissent avec 
                notre site. Ces informations nous aident à améliorer notre plateforme. Les données collectées 
                sont anonymisées.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">5. Gestion des Cookies</h2>
              <p className="mb-4">
                Vous pouvez contrôler et gérer les cookies de plusieurs façons :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Paramètres du navigateur :</strong> Vous pouvez configurer votre navigateur pour bloquer ou supprimer les cookies</li>
                <li><strong>Bannière de consentement :</strong> Lors de votre première visite, vous pouvez choisir les cookies à accepter</li>
                <li><strong>Outils tiers :</strong> Des extensions de navigateur permettent de gérer les cookies</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4 mt-8">6. Conséquences du Refus</h2>
              <p className="mb-4">
                Si vous choisissez de désactiver certains cookies, certaines fonctionnalités de la plateforme 
                pourraient ne pas fonctionner correctement :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Impossibilité de rester connecté</li>
                <li>Perte de vos préférences</li>
                <li>Expérience utilisateur dégradée</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4 mt-8">7. Cookies Tiers</h2>
              <p className="mb-4">
                Certains cookies peuvent être déposés par des services tiers intégrés à notre plateforme :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Services de paiement (FedaPay)</li>
                <li>Outils d'analyse (Google Analytics)</li>
                <li>Réseaux sociaux (boutons de partage)</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4 mt-8">8. Mise à Jour</h2>
              <p className="mb-4">
                Cette politique de cookies peut être mise à jour périodiquement. Nous vous informerons de tout 
                changement significatif.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">9. Contact</h2>
              <p className="mb-4">
                Pour toute question concernant notre utilisation des cookies :
                <a href="mailto:privacy@beninfreelance.com" className="text-primary hover:underline ml-1">
                  privacy@beninfreelance.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
