import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRBAC } from "@/hooks/useRBAC";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowLeft,
  Search,
  Filter,
  MoreHorizontal,
  User,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Star,
  Ban,
  CheckCircle,
  Loader2,
  UserCog,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

interface UserData {
  id: number;
  name: string | null;
  email: string | null;
  avatar?: string | null;
  phone?: string | null;
  city?: string | null;
  role: string;
  userType: string;
  isSeller: boolean;
  kycStatus?: string | null;
  rating?: string | null;
  totalReviews?: number | null;
  completedOrders?: number | null;
  createdAt: string | Date;
  lastSignedIn?: string | Date | null;
}

const roleLabels: Record<string, string> = {
  user: "Utilisateur",
  moderator: "Modérateur",
  admin: "Administrateur",
  superadmin: "Super Admin",
};

const roleColors: Record<string, string> = {
  user: "bg-gray-100 text-gray-800",
  moderator: "bg-blue-100 text-blue-800",
  admin: "bg-purple-100 text-purple-800",
  superadmin: "bg-red-100 text-red-800",
};

const kycStatusLabels: Record<string, string> = {
  none: "Non soumis",
  pending: "En attente",
  verified: "Vérifié",
  rejected: "Rejeté",
};

export default function AdminUsers() {
  const [, setLocation] = useLocation();
  const { isAdmin, canAccessAdminDashboard } = useRBAC();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "moderator" | "admin" | "superadmin">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch users
  const { data: users, isLoading, refetch } = trpc.admin.getUsers.useQuery(
    { role: roleFilter !== "all" ? roleFilter : undefined },
    { enabled: canAccessAdminDashboard() }
  );

  // Mutations
  const updateUserRole = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("Rôle mis à jour avec succès");
      refetch();
      setEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const banUser = trpc.admin.banUser.useMutation({
    onSuccess: () => {
      toast.success("Utilisateur banni");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors du bannissement");
    },
  });

  if (!canAccessAdminDashboard()) {
    setLocation("/");
    return null;
  }

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;
    setIsProcessing(true);
    await updateUserRole.mutateAsync({
      userId: selectedUser.id,
      role: newRole as any,
    });
    setIsProcessing(false);
  };

  const handleBanUser = async (userId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir bannir cet utilisateur ?")) return;
    await banUser.mutateAsync({ userId });
  };

  const openEditDialog = (user: UserData) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setEditDialogOpen(true);
  };

  const filteredUsers = users?.filter((user: UserData) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !user.name?.toLowerCase().includes(query) &&
        !user.email?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (typeFilter !== "all") {
      if (typeFilter === "freelance" && !user.isSeller) return false;
      if (typeFilter === "client" && user.isSeller) return false;
    }
    return true;
  });

  const getKYCBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="success" className="gap-1"><ShieldCheck className="h-3 w-3" /> Vérifié</Badge>;
      case "pending":
        return <Badge variant="warning" className="gap-1"><Shield className="h-3 w-3" /> En attente</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><ShieldAlert className="h-3 w-3" /> Rejeté</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1"><ShieldOff className="h-3 w-3" /> Non soumis</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container flex items-center gap-4 h-16">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="font-heading text-xl font-bold">Gestion des utilisateurs</h1>
            <p className="text-xs text-muted-foreground">Gérer les comptes et les rôles</p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="user">Utilisateurs</SelectItem>
                  <SelectItem value="moderator">Modérateurs</SelectItem>
                  <SelectItem value="admin">Administrateurs</SelectItem>
                  <SelectItem value="superadmin">Super Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="freelance">Freelances</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Total utilisateurs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users?.filter((u: UserData) => u.isSeller).length || 0}</p>
                  <p className="text-xs text-muted-foreground">Freelances</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users?.filter((u: UserData) => u.kycStatus === 'verified').length || 0}</p>
                  <p className="text-xs text-muted-foreground">KYC vérifiés</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <UserCog className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {users?.filter((u: UserData) => ['admin', 'superadmin', 'moderator'].includes(u.role)).length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Staff</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des utilisateurs</CardTitle>
            <CardDescription>
              {filteredUsers?.length || 0} utilisateur(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Stats</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((user: UserData) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar || undefined} />
                            <AvatarFallback>
                              {user.name?.charAt(0).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isSeller ? "default" : "secondary"}>
                          {user.isSeller ? "Freelance" : "Client"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role] || roleColors.user}>
                          {roleLabels[user.role] || user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getKYCBadge(user.kycStatus || 'none')}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.isSeller && (
                            <>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500" />
                                <span>{user.rating || "0.00"}</span>
                                <span className="text-muted-foreground">({user.totalReviews || 0})</span>
                              </div>
                              <p className="text-muted-foreground">
                                {user.completedOrders || 0} commandes
                              </p>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
                          <p className="text-muted-foreground text-xs">
                            Dernière connexion: {user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString('fr-FR') : 'N/A'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/profile/${user.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir le profil
                              </Link>
                            </DropdownMenuItem>
                            {isAdmin() && (
                              <>
                                <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier le rôle
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleBanUser(user.id)}
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Bannir
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
            <DialogDescription>
              Changer le rôle de {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nouveau rôle</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="moderator">Modérateur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="superadmin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateRole} disabled={isProcessing}>
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
