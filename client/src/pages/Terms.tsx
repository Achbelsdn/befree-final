import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-heading text-4xl font-bold mb-8 scroll-mt-32">Conditions Générales d'Utilisation</h1>
          <p className="text-muted-foreground mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          
          <Card className="mb-8">
            <CardContent className="pt-6 prose prose-neutral dark:prose-invert max-w-none">
              <h2 className="text-2xl font-semibold mb-4">1. Acceptation des Conditions</h2>
              <p className="mb-4">
                En accédant et en utilisant la plateforme Bénin Freelance, vous acceptez d'être lié par les présentes 
                Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser 
                notre plateforme.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">2. Description du Service</h2>
              <p className="mb-4">
                Bénin Freelance est une plateforme de mise en relation entre freelances et clients au Bénin et en 
                Afrique de l'Ouest. Nous facilitons la connexion entre professionnels indépendants et entreprises 
                ou particuliers ayant besoin de services.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">3. Inscription et Compte</h2>
              <p className="mb-4">
                Pour utiliser certaines fonctionnalités de la plateforme, vous devez créer un compte. Vous êtes 
                responsable de maintenir la confidentialité de vos identifiants de connexion et de toutes les 
                activités effectuées sous votre compte.
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Vous devez fournir des informations exactes et complètes</li>
                <li>Vous devez avoir au moins 18 ans pour créer un compte</li>
                <li>Un seul compte par personne est autorisé</li>
                <li>Vous êtes responsable de la sécurité de votre compte</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4 mt-8">4. Obligations des Freelances</h2>
              <p className="mb-4">En tant que freelance sur notre plateforme, vous vous engagez à :</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Fournir des services de qualité conformes à votre description</li>
                <li>Respecter les délais convenus avec les clients</li>
                <li>Communiquer de manière professionnelle</li>
                <li>Compléter le processus de vérification KYC</li>
                <li>Déclarer vos revenus conformément à la législation béninoise</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4 mt-8">5. Obligations des Clients</h2>
              <p className="mb-4">En tant que client, vous vous engagez à :</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Fournir des descriptions claires de vos projets</li>
                <li>Payer les freelances dans les délais convenus</li>
                <li>Communiquer de manière respectueuse</li>
                <li>Fournir les ressources nécessaires à la réalisation du projet</li>
              </ul>

              <h2 className="text-2xl font-semibold mb-4 mt-8">6. Paiements et Commissions</h2>
              <p className="mb-4">
                Tous les paiements transitent par notre système sécurisé (escrow). Une commission de 10% est 
                prélevée sur chaque transaction. Les fonds sont libérés au freelance uniquement après validation 
                de la livraison par le client.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">7. Propriété Intellectuelle</h2>
              <p className="mb-4">
                Sauf accord contraire, les droits de propriété intellectuelle sur les travaux livrés sont 
                transférés au client après paiement complet. Le freelance conserve le droit d'utiliser le 
                travail dans son portfolio.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">8. Résolution des Litiges</h2>
              <p className="mb-4">
                En cas de litige entre un freelance et un client, notre équipe de médiation interviendra pour 
                trouver une solution équitable. Les décisions de notre équipe sont finales et contraignantes.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">9. Limitation de Responsabilité</h2>
              <p className="mb-4">
                Bénin Freelance agit uniquement en tant qu'intermédiaire. Nous ne sommes pas responsables de la 
                qualité des services fournis par les freelances ni des paiements effectués en dehors de notre 
                plateforme.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">10. Modification des Conditions</h2>
              <p className="mb-4">
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront 
                informés des modifications importantes par email ou notification sur la plateforme.
              </p>

              <h2 className="text-2xl font-semibold mb-4 mt-8">11. Contact</h2>
              <p className="mb-4">
                Pour toute question concernant ces conditions, contactez-nous à : 
                <a href="mailto:legal@beninfreelance.com" className="text-primary hover:underline ml-1">
                  legal@beninfreelance.com
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
