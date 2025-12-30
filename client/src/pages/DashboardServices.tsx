import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Pause,
  Play,
  Star,
  Clock,
  Store,
} from "lucide-react";
import { useState } from "react";

export default function DashboardServices() {
  const { user } = useAuth();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: services, isLoading } = trpc.service.myServices.useQuery();
  const deleteService = trpc.service.delete.useMutation();
  const updateService = trpc.service.update.useMutation();
  const utils = trpc.useUtils();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteService.mutateAsync({ serviceId: deleteId });
      toast.success("Service supprimé");
      utils.service.myServices.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la suppression");
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleStatus = async (serviceId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await updateService.mutateAsync({ serviceId, status: newStatus });
      toast.success(newStatus === 'active' ? "Service activé" : "Service mis en pause");
      utils.service.myServices.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour");
    }
  };

  const formatPrice = (price: string, currency: string) => {
    const numPrice = parseFloat(price);
    if (currency === "XOF") {
      return `${numPrice.toLocaleString('fr-FR')} FCFA`;
    }
    return `${numPrice.toLocaleString('fr-FR')} ${currency}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Actif</Badge>;
      case 'paused':
        return <Badge variant="outline" className="text-orange-600 border-orange-300">En pause</Badge>;
      case 'draft':
        return <Badge variant="secondary">Brouillon</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!user?.isSeller) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md text-center p-8">
          <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="font-semibold text-lg mb-2">Devenez freelance</h2>
          <p className="text-muted-foreground mb-4">
            Créez votre profil freelance pour proposer vos services
          </p>
          <Link href="/become-seller">
            <Button className="btn-benin">Devenir freelance</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Mes Services</h1>
          <p className="text-muted-foreground">
            Gérez vos services et leurs performances
          </p>
        </div>
        <Link href="/dashboard/services/new">
          <Button className="btn-benin gap-2">
            <Plus className="h-4 w-4" />
            Créer un service
          </Button>
        </Link>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : services && services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: any) => (
            <Card key={service.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {/* Cover Image */}
              <div className="aspect-video bg-muted relative">
                {service.coverImage ? (
                  <img
                    src={service.coverImage}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <span className="text-4xl font-bold text-primary/20">
                      {service.title.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(service.status)}
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold line-clamp-2 flex-1">{service.title}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/service/${service.id}`} className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Voir
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/services/${service.id}/edit`} className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Modifier
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(service.id, service.status)}>
                        {service.status === 'active' ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Mettre en pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Activer
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => setDeleteId(service.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {service.starCount > 0 
                      ? (service.totalStars / service.starCount).toFixed(1)
                      : "Nouveau"
                    }
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.deliveryTime}j
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">À partir de</span>
                  <span className="font-bold text-primary">
                    {formatPrice(service.price, service.currency)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="font-medium">Aucun service</p>
            <p className="text-sm text-muted-foreground mb-4">
              Créez votre premier service pour commencer à vendre
            </p>
            <Link href="/dashboard/services/new">
              <Button className="btn-benin gap-2">
                <Plus className="h-4 w-4" />
                Créer un service
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce service ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le service sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
