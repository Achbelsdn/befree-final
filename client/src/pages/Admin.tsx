import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  ShoppingCart,
  DollarSign,
  Shield,
  Settings,
  Search,
  UserCheck,
  UserX,
  Eye,
  Check,
  X,
  AlertTriangle,
  TrendingUp,
  Activity,
  Crown,
  Star
} from "lucide-react";
import Logo from "@/components/Logo";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Check if user has admin access
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'moderator';
  const isSuperAdmin = user?.role === 'superadmin';

  // Fetch data
  const { data: stats } = trpc.admin.platformStats.useQuery(undefined, { enabled: isAdmin });
  const { data: users } = trpc.admin.listUsers.useQuery({
    search: searchQuery || undefined,
    role: roleFilter !== 'all' ? roleFilter as any : undefined,
    limit: 50
  }, { enabled: isAdmin });
  const { data: services } = trpc.admin.listServicesForModeration.useQuery({ limit: 20 }, { enabled: isAdmin });
  const { data: transactions } = trpc.admin.listTransactions.useQuery({ limit: 20 }, { enabled: isAdmin && (user?.role === 'admin' || user?.role === 'superadmin') });
  const { data: moderators } = trpc.admin.listModerators.useQuery(undefined, { enabled: isSuperAdmin });

  // Mutations
  const updateRoleMutation = trpc.admin.updateUserRole.useMutation();
  const moderateServiceMutation = trpc.admin.moderateService.useMutation();
  const processTransactionMutation = trpc.admin.processTransaction.useMutation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF7F2' }}>
        <Card className="p-8 text-center" style={{ background: '#FFFDFB', border: '1px solid rgba(0,0,0,0.04)' }}>
          <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: '#C75B39' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>
            Accès restreint
          </h2>
          <p className="mb-6" style={{ color: '#6B6560' }}>
            Vous devez être connecté pour accéder à cette page.
          </p>
          <Link href="/login">
            <Button style={{ background: '#C75B39', color: '#FFFDFB' }}>
              Se connecter
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF7F2' }}>
        <Card className="p-8 text-center" style={{ background: '#FFFDFB', border: '1px solid rgba(0,0,0,0.04)' }}>
          <AlertTriangle className="w-16 h-16 mx-auto mb-4" style={{ color: '#C75B39' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>
            Accès non autorisé
          </h2>
          <p className="mb-6" style={{ color: '#6B6560' }}>
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <Link href="/">
            <Button style={{ background: '#C75B39', color: '#FFFDFB' }}>
              Retour à l'accueil
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return { label: 'Super Admin', bg: 'rgba(139, 69, 19, 0.1)', color: '#8B4513', icon: Crown };
      case 'admin':
        return { label: 'Admin', bg: 'rgba(199, 91, 57, 0.1)', color: '#C75B39', icon: Shield };
      case 'moderator':
        return { label: 'Modérateur', bg: 'rgba(92, 107, 74, 0.1)', color: '#5C6B4A', icon: Star };
      default:
        return { label: 'Utilisateur', bg: '#E8E2D9', color: '#6B6560', icon: Users };
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#FAF7F2' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 py-4" style={{ background: '#FFFDFB', borderBottom: '1px solid #E8E2D9' }}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Logo />
            </Link>
            <Badge className="rounded-sm" style={{ background: 'rgba(199, 91, 57, 0.1)', color: '#C75B39' }}>
              <Shield className="w-3 h-3 mr-1" />
              Administration
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm" style={{ color: '#6B6560' }}>
              Connecté en tant que <strong style={{ color: '#1A1714' }}>{user?.name}</strong>
            </span>
            {(() => {
              const badge = getRoleBadge(user?.role || 'user');
              return (
                <Badge className="rounded-sm" style={{ background: badge.bg, color: badge.color }}>
                  <badge.icon className="w-3 h-3 mr-1" />
                  {badge.label}
                </Badge>
              );
            })()}
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 p-1 rounded-sm" style={{ background: '#E8E2D9' }}>
            <TabsTrigger value="dashboard" className="rounded-sm data-[state=active]:bg-white">
              <Activity className="w-4 h-4 mr-2" />
              Tableau de bord
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-sm data-[state=active]:bg-white">
              <Users className="w-4 h-4 mr-2" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="services" className="rounded-sm data-[state=active]:bg-white">
              <Briefcase className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
            {(user?.role === 'admin' || user?.role === 'superadmin') && (
              <TabsTrigger value="transactions" className="rounded-sm data-[state=active]:bg-white">
                <DollarSign className="w-4 h-4 mr-2" />
                Transactions
              </TabsTrigger>
            )}
            {isSuperAdmin && (
              <TabsTrigger value="moderators" className="rounded-sm data-[state=active]:bg-white">
                <Shield className="w-4 h-4 mr-2" />
                Modérateurs
              </TabsTrigger>
            )}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[
                { label: 'Utilisateurs', value: stats?.totalUsers || 0, icon: Users, color: '#C75B39' },
                { label: 'Freelances', value: stats?.totalFreelancers || 0, icon: Briefcase, color: '#5C6B4A' },
                { label: 'Services actifs', value: stats?.totalServices || 0, icon: ShoppingCart, color: '#8B4513' },
                { label: 'Projets ouverts', value: stats?.totalProjects || 0, icon: TrendingUp, color: '#C75B39' },
              ].map((stat, i) => (
                <Card key={i} className="p-6" style={{ background: '#FFFDFB', border: '1px solid rgba(0,0,0,0.04)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-sm flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                      <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                    <TrendingUp className="w-5 h-5" style={{ color: '#5C6B4A' }} />
                  </div>
                  <p className="text-3xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-sm" style={{ color: '#6B6560' }}>{stat.label}</p>
                </Card>
              ))}
            </motion.div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="p-6" style={{ background: '#FFFDFB', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9A948D' }} />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48" style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="user">Utilisateurs</SelectItem>
                    <SelectItem value="moderator">Modérateurs</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E8E2D9' }}>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: '#6B6560' }}>Utilisateur</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: '#6B6560' }}>Email</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: '#6B6560' }}>Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: '#6B6560' }}>Rôle</th>
                      {isSuperAdmin && (
                        <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: '#6B6560' }}>Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((u: any) => {
                      const badge = getRoleBadge(u.role);
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid #E8E2D9' }}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#E8E2D9' }}>
                                {u.avatar ? (
                                  <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <span className="font-semibold" style={{ color: '#6B6560' }}>
                                    {u.name?.charAt(0) || '?'}
                                  </span>
                                )}
                              </div>
                              <span className="font-medium" style={{ color: '#1A1714' }}>{u.name || 'Sans nom'}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4" style={{ color: '#6B6560' }}>{u.email}</td>
                          <td className="py-3 px-4">
                            <Badge className="rounded-sm" style={{ background: '#E8E2D9', color: '#6B6560' }}>
                              {u.userType === 'freelance' ? 'Freelance' : 'Client'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className="rounded-sm" style={{ background: badge.bg, color: badge.color }}>
                              {badge.label}
                            </Badge>
                          </td>
                          {isSuperAdmin && u.role !== 'superadmin' && (
                            <td className="py-3 px-4">
                              <Select
                                value={u.role}
                                onValueChange={(newRole) => {
                                  updateRoleMutation.mutate({ userId: u.id, role: newRole as any });
                                }}
                              >
                                <SelectTrigger className="w-32 h-8" style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
                                  <SelectItem value="user">Utilisateur</SelectItem>
                                  <SelectItem value="moderator">Modérateur</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card className="p-6" style={{ background: '#FFFDFB', border: '1px solid rgba(0,0,0,0.04)' }}>
              <h3 className="text-lg font-semibold mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>
                Services à modérer
              </h3>
              <div className="space-y-4">
                {services?.map((service: any) => (
                  <div key={service.id} className="flex items-center justify-between p-4 rounded-sm" style={{ background: '#FAF7F2', border: '1px solid #E8E2D9' }}>
                    <div className="flex-1">
                      <h4 className="font-medium" style={{ color: '#1A1714' }}>{service.title}</h4>
                      <p className="text-sm" style={{ color: '#6B6560' }}>
                        Par {service.user?.name || 'Inconnu'} • {service.price} FCFA
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="rounded-sm" style={{ 
                        background: service.status === 'active' ? 'rgba(92, 107, 74, 0.1)' : '#E8E2D9',
                        color: service.status === 'active' ? '#5C6B4A' : '#6B6560'
                      }}>
                        {service.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moderateServiceMutation.mutate({ serviceId: service.id, action: 'approve' })}
                        style={{ borderColor: '#5C6B4A', color: '#5C6B4A' }}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moderateServiceMutation.mutate({ serviceId: service.id, action: 'pause' })}
                        style={{ borderColor: '#C75B39', color: '#C75B39' }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!services || services.length === 0) && (
                  <p className="text-center py-8" style={{ color: '#6B6560' }}>Aucun service à modérer</p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="p-6" style={{ background: '#FFFDFB', border: '1px solid rgba(0,0,0,0.04)' }}>
              <h3 className="text-lg font-semibold mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>
                Transactions récentes
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E8E2D9' }}>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: '#6B6560' }}>Référence</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: '#6B6560' }}>Utilisateur</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: '#6B6560' }}>Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: '#6B6560' }}>Montant</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: '#6B6560' }}>Statut</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: '#6B6560' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions?.map((tx: any) => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid #E8E2D9' }}>
                        <td className="py-3 px-4 font-mono text-sm" style={{ color: '#1A1714' }}>{tx.reference}</td>
                        <td className="py-3 px-4" style={{ color: '#6B6560' }}>{tx.user?.name || 'Inconnu'}</td>
                        <td className="py-3 px-4">
                          <Badge className="rounded-sm" style={{ 
                            background: tx.type === 'deposit' ? 'rgba(92, 107, 74, 0.1)' : 'rgba(199, 91, 57, 0.1)',
                            color: tx.type === 'deposit' ? '#5C6B4A' : '#C75B39'
                          }}>
                            {tx.type === 'deposit' ? 'Dépôt' : tx.type === 'withdrawal' ? 'Retrait' : tx.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-semibold" style={{ color: '#1A1714' }}>
                          {parseFloat(tx.amount).toLocaleString()} FCFA
                        </td>
                        <td className="py-3 px-4">
                          <Badge className="rounded-sm" style={{ 
                            background: tx.status === 'completed' ? 'rgba(92, 107, 74, 0.1)' : tx.status === 'pending' ? 'rgba(199, 91, 57, 0.1)' : '#E8E2D9',
                            color: tx.status === 'completed' ? '#5C6B4A' : tx.status === 'pending' ? '#C75B39' : '#6B6560'
                          }}>
                            {tx.status === 'completed' ? 'Complété' : tx.status === 'pending' ? 'En attente' : tx.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {tx.status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => processTransactionMutation.mutate({ transactionId: tx.id, action: 'approve' })}
                                style={{ background: '#5C6B4A', color: '#FFFDFB' }}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => processTransactionMutation.mutate({ transactionId: tx.id, action: 'reject' })}
                                style={{ borderColor: '#C75B39', color: '#C75B39' }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Moderators Tab (SuperAdmin only) */}
          {isSuperAdmin && (
            <TabsContent value="moderators">
              <Card className="p-6" style={{ background: '#FFFDFB', border: '1px solid rgba(0,0,0,0.04)' }}>
                <h3 className="text-lg font-semibold mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>
                  Équipe de modération
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {moderators?.map((mod: any) => {
                    const badge = getRoleBadge(mod.role);
                    return (
                      <Card key={mod.id} className="p-4" style={{ background: '#FAF7F2', border: '1px solid #E8E2D9' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#E8E2D9' }}>
                            {mod.avatar ? (
                              <img src={mod.avatar} alt={mod.name} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              <span className="text-lg font-semibold" style={{ color: '#6B6560' }}>
                                {mod.name?.charAt(0) || '?'}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium" style={{ color: '#1A1714' }}>{mod.name}</h4>
                            <p className="text-sm" style={{ color: '#6B6560' }}>{mod.email}</p>
                            <Badge className="mt-1 rounded-sm" style={{ background: badge.bg, color: badge.color }}>
                              <badge.icon className="w-3 h-3 mr-1" />
                              {badge.label}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
