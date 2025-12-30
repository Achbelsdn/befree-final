import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingBag,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  ArrowRight
} from "lucide-react";
import { getLoginUrl } from "@/const";

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  in_progress: { label: "En cours", color: "bg-blue-100 text-blue-800", icon: Package },
  delivered: { label: "Livré", color: "bg-purple-100 text-purple-800", icon: Package },
  completed: { label: "Terminé", color: "bg-green-100 text-green-800", icon: CheckCircle2 },
  cancelled: { label: "Annulé", color: "bg-gray-100 text-gray-800", icon: XCircle },
  disputed: { label: "Litige", color: "bg-red-100 text-red-800", icon: AlertTriangle },
};

export default function Orders() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: buyerOrders, isLoading: loadingBuyer } = trpc.order.myOrders.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: sellerOrders, isLoading: loadingSeller } = trpc.order.sellerOrders.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.isSeller }
  );

  const formatPrice = (price: string, currency: string) => {
    const numPrice = parseFloat(price);
    if (currency === "XOF") {
      return `${numPrice.toLocaleString('fr-FR')} FCFA`;
    }
    return `${numPrice.toLocaleString('fr-FR')} ${currency}`;
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
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="font-heading text-xl font-semibold mb-2">Connexion requise</h2>
            <p className="text-muted-foreground mb-4">
              Connectez-vous pour voir vos commandes.
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

  const OrderCard = ({ order, type }: { order: any; type: 'buyer' | 'seller' }) => {
    const status = statusConfig[order.status] || statusConfig.pending;
    const StatusIcon = status.icon;

    return (
      <Card className="overflow-hidden card-hover">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Image */}
            <div className="sm:w-40 h-32 sm:h-auto bg-muted shrink-0">
              {order.service?.coverImage ? (
                <img
                  src={order.service.coverImage}
                  alt={order.service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                  <ShoppingBag className="h-8 w-8 text-primary/30" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <Link href={`/service/${order.serviceId}`}>
                    <h3 className="font-medium hover:text-primary transition-colors line-clamp-1">
                      {order.service?.title || "Service"}
                    </h3>
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {type === 'buyer' ? 'Vendeur' : 'Acheteur'}: {order[type === 'buyer' ? 'seller' : 'buyer']?.name || 'Utilisateur'}
                  </p>
                </div>
                <Badge className={status.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  <span>Commandé le {new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-primary">
                    {formatPrice(order.price, order.currency)}
                  </span>
                  <Link href={`/orders/${order.id}`}>
                    <Button size="sm" variant="outline">
                      Détails
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <Card className="p-12 text-center">
      <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="font-heading font-semibold text-lg mb-2">Aucune commande</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      <Link href="/services">
        <Button className="btn-benin">Explorer les services</Button>
      </Link>
    </Card>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="container py-8">
          <h1 className="font-heading text-3xl font-bold mb-8">Mes Commandes</h1>

          <Tabs defaultValue="purchases">
            <TabsList className="mb-6">
              <TabsTrigger value="purchases">
                Mes achats ({buyerOrders?.length || 0})
              </TabsTrigger>
              {user?.isSeller && (
                <TabsTrigger value="sales">
                  Commandes reçues ({sellerOrders?.length || 0})
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="purchases">
              {loadingBuyer ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : buyerOrders && buyerOrders.length > 0 ? (
                <div className="space-y-4">
                  {buyerOrders.map((order: any) => (
                    <OrderCard key={order.id} order={order} type="buyer" />
                  ))}
                </div>
              ) : (
                <EmptyState message="Vous n'avez pas encore passé de commande." />
              )}
            </TabsContent>

            {user?.isSeller && (
              <TabsContent value="sales">
                {loadingSeller ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : sellerOrders && sellerOrders.length > 0 ? (
                  <div className="space-y-4">
                    {sellerOrders.map((order: any) => (
                      <OrderCard key={order.id} order={order} type="seller" />
                    ))}
                  </div>
                ) : (
                  <EmptyState message="Vous n'avez pas encore reçu de commande." />
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
