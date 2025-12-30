import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-4xl font-bold mb-8 scroll-mt-32">Politique de Confidentialité</h1>
          <p className="text-muted-foreground mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          
          <Card className="mb-8">
            <CardContent className="pt-6 prose prose-neutral dark:prose-invert max-w-none">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="mb-4">
                Chez Bénin Freelance, nous prenons la protection de vos données personnelles très au sérieux. 
                Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et 
                protégeons vos informations personnelles.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">2. Données Collectées</h2>
              <p className="mb-4">Nous collectons les types de données suivants :</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Informations d'identification :</strong> nom, prénom, adresse email, numéro de téléphone</li>
                <li><strong>Informations professionnelles :</strong> compétences, expérience, portfolio</li>
                <li><strong>Documents KYC :</strong> pièce d'identité, justificatif de domicile</li>
                <li><strong>Données de paiement :</strong> informations de mobile money</li>
                <li><strong>Données d'utilisation :</strong> historique de navigation, préférences</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4 mt-8">3. Utilisation des Données</h2>
              <p className="mb-4">Vos données sont utilisées pour :</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Créer et gérer votre compte utilisateur</li>
                <li>Faciliter les transactions entre freelances et clients</li>
                <li>Vérifier votre identité (processus KYC)</li>
                <li>Améliorer nos services et votre expérience utilisateur</li>
                <li>Vous envoyer des communications importantes</li>
                <li>Prévenir la fraude et assurer la sécurité de la plateforme</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4 mt-8">4. Partage des Données</h2>
              <p className="mb-4">
                Nous ne vendons jamais vos données personnelles. Nous pouvons partager certaines informations avec :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Les autres utilisateurs (profil public, avis)</li>
                <li>Nos prestataires de services (paiement, hébergement)</li>
                <li>Les autorités légales si requis par la loi</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4 mt-8">5. Sécurité des Données</h2>
              <p className="mb-4">
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger 
                vos données :
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Chiffrement SSL/TLS pour toutes les communications</li>
                <li>Stockage sécurisé des mots de passe (hachage)</li>
                <li>Accès restreint aux données sensibles</li>
                <li>Surveillance continue des systèmes</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4 mt-8">6. Conservation des Données</h2>
              <p className="mb-4">
                Nous conservons vos données aussi longtemps que votre compte est actif ou que nécessaire pour 
                vous fournir nos services. Après suppression de votre compte, certaines données peuvent être 
                conservées pour des raisons légales ou comptables.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">7. Vos Droits</h2>
              <p className="mb-4">Conformément à la réglementation, vous disposez des droits suivants :</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
                <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4 mt-8">8. Cookies</h2>
              <p className="mb-4">
                Nous utilisons des cookies pour améliorer votre expérience. Pour plus d'informations, consultez 
                notre <a href="/cookies" className="text-primary hover:underline">Politique de Cookies</a>.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">9. Modifications</h2>
              <p className="mb-4">
                Nous pouvons mettre à jour cette politique de confidentialité. Les modifications importantes 
                vous seront notifiées par email ou sur la plateforme.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">10. Contact</h2>
              <p className="mb-4">
                Pour toute question concernant vos données personnelles, contactez notre Délégué à la Protection 
                des Données :
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
