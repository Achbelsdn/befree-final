import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Store,
  ShoppingBag,
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  FolderKanban,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: activity } = trpc.dashboard.recentActivity.useQuery({ limit: 5 }) as { data: { orders: any[]; transactions: any[] } | undefined };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} F`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded-sm" style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
              <Skeleton className="h-4 w-24 mb-2" style={{ background: '#E8E2D9' }} />
              <Skeleton className="h-8 w-16" style={{ background: '#E8E2D9' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const sellerStats = user?.isSeller ? [
    {
      title: "Services actifs",
      value: stats?.activeServices || 0,
      icon: Store,
      color: '#C75B39',
      bgColor: 'rgba(199, 91, 57, 0.1)',
      href: "/dashboard/services",
    },
    {
      title: "Commandes en cours",
      value: stats?.inProgressOrders || 0,
      icon: Clock,
      color: '#8B4513',
      bgColor: 'rgba(139, 69, 19, 0.1)',
      href: "/dashboard/orders",
    },
    {
      title: "Commandes terminées",
      value: stats?.completedOrders || 0,
      icon: CheckCircle2,
      color: '#5C6B4A',
      bgColor: 'rgba(92, 107, 74, 0.1)',
      href: "/dashboard/orders",
    },
    {
      title: "Revenus totaux",
      value: formatCurrency(stats?.totalEarnings || 0),
      icon: TrendingUp,
      color: '#C75B39',
      bgColor: 'rgba(199, 91, 57, 0.1)',
      href: "/dashboard/wallet",
    },
  ] : [
    {
      title: "Mes projets",
      value: stats?.totalProjects || 0,
      icon: FolderKanban,
      color: '#C75B39',
      bgColor: 'rgba(199, 91, 57, 0.1)',
      href: "/dashboard/projects",
    },
    {
      title: "Commandes actives",
      value: stats?.activeOrders || 0,
      icon: Clock,
      color: '#8B4513',
      bgColor: 'rgba(139, 69, 19, 0.1)',
      href: "/dashboard/orders",
    },
    {
      title: "Commandes terminées",
      value: stats?.completedOrders || 0,
      icon: CheckCircle2,
      color: '#5C6B4A',
      bgColor: 'rgba(92, 107, 74, 0.1)',
      href: "/dashboard/orders",
    },
    {
      title: "Total dépensé",
      value: formatCurrency(stats?.totalSpent || 0),
      icon: ShoppingBag,
      color: '#C75B39',
      bgColor: 'rgba(199, 91, 57, 0.1)',
      href: "/dashboard/orders",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>
            Bienvenue, {user?.name?.split(' ')[0] || 'Utilisateur'} 👋
          </h1>
          <p className="mt-1" style={{ color: '#6B6560' }}>
            Voici un aperçu de votre activité
          </p>
        </div>
        {user?.isSeller ? (
          <Link href="/dashboard/services/new">
            <Button className="rounded-sm min-h-[48px]" style={{ background: '#C75B39', color: '#FFFDFB' }}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un service
            </Button>
          </Link>
        ) : (
          <Link href="/dashboard/projects/new">
            <Button className="rounded-sm min-h-[48px]" style={{ background: '#C75B39', color: '#FFFDFB' }}>
              <Plus className="h-4 w-4 mr-2" />
              Publier un projet
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sellerStats.map((stat, idx) => (
          <Link key={idx} href={stat.href}>
            <div className="group relative p-6 rounded-sm transition-all cursor-pointer overflow-hidden" style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: '#6B6560' }}>{stat.title}</p>
                  <p className="text-2xl font-bold mt-1" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>{stat.value}</p>
                </div>
                <div className="p-3 rounded-sm" style={{ background: stat.bgColor }}>
                  <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Wallet Card */}
      <div className="relative p-6 rounded-sm overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A1714 0%, #3D3833 100%)' }}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" style={{ background: '#C75B39' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" style={{ background: '#5C6B4A' }} />
        </div>
        
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm flex items-center gap-2" style={{ color: 'rgba(250, 247, 242, 0.8)' }}>
              <Wallet className="h-4 w-4" />
              Solde disponible
            </p>
            <p className="text-4xl font-bold mt-2" style={{ fontFamily: 'Playfair Display, serif', color: '#FAF7F2' }}>
              {formatCurrency(stats?.balance || 0)}
            </p>
            {user?.isSeller && stats?.pendingBalance && stats.pendingBalance > 0 && (
              <p className="text-sm mt-2 flex items-center gap-1" style={{ color: 'rgba(250, 247, 242, 0.6)' }}>
                <Clock className="h-3 w-3" />
                + {formatCurrency(stats.pendingBalance)} en attente
              </p>
            )}
          </div>
          <Link href="/dashboard/wallet">
            <Button variant="secondary" className="rounded-sm backdrop-blur-sm min-h-[48px]" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#FAF7F2', border: 'none' }}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Voir le portefeuille
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="p-6 rounded-sm" style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>Commandes récentes</h2>
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="sm" className="gap-1 min-h-[44px]" style={{ color: '#6B6560' }}>
                Voir tout <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {activity?.orders && Array.isArray(activity.orders) && activity.orders.length > 0 ? (
            <div className="space-y-4">
              {activity.orders.slice(0, 5).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-sm transition-colors" style={{ background: '#FAF7F2' }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-sm" style={{ 
                      background: order.status === 'completed' ? 'rgba(92, 107, 74, 0.1)' :
                        order.status === 'in_progress' ? 'rgba(199, 91, 57, 0.1)' :
                        order.status === 'pending' ? 'rgba(139, 69, 19, 0.1)' :
                        '#E8E2D9'
                    }}>
                      {order.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4" style={{ color: '#5C6B4A' }} />
                      ) : order.status === 'in_progress' ? (
                        <Clock className="h-4 w-4" style={{ color: '#C75B39' }} />
                      ) : (
                        <AlertCircle className="h-4 w-4" style={{ color: '#8B4513' }} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm truncate max-w-[200px]" style={{ color: '#1A1714' }}>
                        {order.title}
                      </p>
                      <p className="text-xs" style={{ color: '#9A948D' }}>
                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium text-sm" style={{ color: '#1A1714' }}>
                    {parseFloat(order.price).toLocaleString('fr-FR')} F
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-sm flex items-center justify-center mx-auto mb-4" style={{ background: '#E8E2D9' }}>
                <ShoppingBag className="h-8 w-8" style={{ color: '#9A948D' }} />
              </div>
              <p style={{ color: '#6B6560' }}>Aucune commande récente</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="p-6 rounded-sm" style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>Transactions récentes</h2>
            <Link href="/dashboard/wallet">
              <Button variant="ghost" size="sm" className="gap-1 min-h-[44px]" style={{ color: '#6B6560' }}>
                Voir tout <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {activity?.transactions && Array.isArray(activity.transactions) && activity.transactions.length > 0 ? (
            <div className="space-y-4">
              {activity.transactions.slice(0, 5).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-sm transition-colors" style={{ background: '#FAF7F2' }}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-sm" style={{ 
                      background: tx.type === 'earning' ? 'rgba(92, 107, 74, 0.1)' :
                        tx.type === 'withdrawal' ? 'rgba(199, 91, 57, 0.1)' :
                        'rgba(139, 69, 19, 0.1)'
                    }}>
                      {tx.type === 'earning' ? (
                        <ArrowUpRight className="h-4 w-4" style={{ color: '#5C6B4A' }} />
                      ) : tx.type === 'withdrawal' ? (
                        <ArrowDownRight className="h-4 w-4" style={{ color: '#C75B39' }} />
                      ) : (
                        <ShoppingBag className="h-4 w-4" style={{ color: '#8B4513' }} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: '#1A1714' }}>
                        {tx.type === 'earning' ? 'Revenu' :
                         tx.type === 'withdrawal' ? 'Retrait' :
                         tx.type === 'deposit' ? 'Dépôt' : 'Paiement'}
                      </p>
                      <p className="text-xs" style={{ color: '#9A948D' }}>
                        {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <span className="font-medium text-sm" style={{ 
                    color: tx.type === 'earning' || tx.type === 'deposit' ? '#5C6B4A' : '#C75B39'
                  }}>
                    {tx.type === 'earning' || tx.type === 'deposit' ? '+' : '-'}
                    {parseFloat(tx.amount).toLocaleString('fr-FR')} F
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-sm flex items-center justify-center mx-auto mb-4" style={{ background: '#E8E2D9' }}>
                <Wallet className="h-8 w-8" style={{ color: '#9A948D' }} />
              </div>
              <p style={{ color: '#6B6560' }}>Aucune transaction récente</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions for non-sellers */}
      {!user?.isSeller && (
        <div className="relative p-6 rounded-sm overflow-hidden" style={{ background: 'rgba(92, 107, 74, 0.08)', border: '1px dashed rgba(92, 107, 74, 0.3)' }}>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="p-4 rounded-sm" style={{ background: '#5C6B4A' }}>
              <Sparkles className="h-8 w-8" style={{ color: '#FFFDFB' }} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-lg" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>Devenez freelance sur BéninFreelance</h3>
              <p className="text-sm mt-1" style={{ color: '#6B6560' }}>
                Proposez vos services et commencez à gagner de l'argent dès aujourd'hui
              </p>
            </div>
            <Link href="/become-seller">
              <Button className="rounded-sm min-h-[48px]" style={{ background: '#5C6B4A', color: '#FFFDFB' }}>
                Devenir freelance
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
