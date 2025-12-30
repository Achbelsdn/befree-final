import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRBAC } from "@/hooks/useRBAC";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  Users,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Briefcase,
  MessageSquare,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ArrowRight,
  Home,
  LogOut,
} from "lucide-react";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { isAdmin, isModerator, canAccessAdminDashboard } = useRBAC();

  // Redirect if not authorized
  useEffect(() => {
    if (!canAccessAdminDashboard()) {
      setLocation("/");
    }
  }, [canAccessAdminDashboard, setLocation]);

  // Fetch admin stats
  const { data: stats } = trpc.admin.getStats.useQuery(undefined, {
    enabled: canAccessAdminDashboard(),
  });

  // Fetch pending KYC count
  const { data: pendingKYC } = trpc.admin.getPendingKYCCount.useQuery(undefined, {
    enabled: canAccessAdminDashboard(),
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (!canAccessAdminDashboard()) {
    return null;
  }

  const statCards = [
    {
      title: "Utilisateurs",
      value: stats?.totalUsers || 0,
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Freelances",
      value: stats?.totalFreelancers || 0,
      change: "+8%",
      icon: Briefcase,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Projets actifs",
      value: stats?.activeProjects || 0,
      change: "+15%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Revenus (FCFA)",
      value: stats?.totalRevenue?.toLocaleString() || "0",
      change: "+23%",
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  const quickActions = [
    {
      title: "Validation KYC",
      description: `${pendingKYC?.count || 0} demandes en attente`,
      icon: ShieldCheck,
      href: "/admin/kyc",
      badge: pendingKYC?.count || 0,
      badgeVariant: "destructive" as const,
    },
    {
      title: "Gestion utilisateurs",
      description: "Gérer les comptes et rôles",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Litiges",
      description: `${stats?.pendingDisputes || 0} litiges à traiter`,
      icon: AlertTriangle,
      href: "/admin/disputes",
      badge: stats?.pendingDisputes || 0,
      badgeVariant: "warning" as const,
    },
    {
      title: "Transactions",
      description: "Historique des paiements",
      icon: DollarSign,
      href: "/admin/transactions",
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="h-4 w-4" />
                Accueil
              </Button>
            </Link>
            <div className="h-6 w-px bg-border" />
            <h1 className="font-heading text-xl font-bold">Administration</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="font-heading text-3xl font-bold mb-2">
            Bonjour, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-muted-foreground">
            Voici un aperçu de l'activité de la plateforme
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-1">{stat.change} ce mois</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <action.icon className="h-5 w-5 text-primary" />
                    </div>
                    {action.badge !== undefined && action.badge > 0 && (
                      <Badge variant={action.badgeVariant || "secondary"}>
                        {action.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList>
            <TabsTrigger value="recent">Activité récente</TabsTrigger>
            <TabsTrigger value="kyc">KYC en attente</TabsTrigger>
            <TabsTrigger value="reports">Signalements</TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
                <CardDescription>
                  Les dernières actions sur la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { icon: Users, text: "Nouvel utilisateur inscrit: Jean Dupont", time: "Il y a 5 min", color: "text-blue-600" },
                    { icon: ShieldCheck, text: "KYC approuvé pour Marie Kokou", time: "Il y a 15 min", color: "text-green-600" },
                    { icon: Briefcase, text: "Nouveau projet publié: Site e-commerce", time: "Il y a 30 min", color: "text-purple-600" },
                    { icon: DollarSign, text: "Paiement de 150,000 FCFA traité", time: "Il y a 1h", color: "text-yellow-600" },
                    { icon: MessageSquare, text: "Nouveau litige ouvert #1234", time: "Il y a 2h", color: "text-red-600" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50">
                      <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center`}>
                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.text}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Demandes KYC en attente</CardTitle>
                  <CardDescription>
                    Vérifiez et validez les documents d'identité
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href="/admin/kyc">
                    Voir tout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">Utilisateur #{i}</p>
                          <p className="text-sm text-muted-foreground">
                            Soumis il y a {i} jour{i > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                        <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approuver
                        </Button>
                        <Button variant="destructive" size="sm">
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Signalements</CardTitle>
                <CardDescription>
                  Contenus et utilisateurs signalés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun signalement en attente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
