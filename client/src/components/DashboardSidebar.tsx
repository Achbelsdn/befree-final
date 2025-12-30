import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import Logo from "@/components/Logo";
import {
  LayoutDashboard,
  Store,
  FolderKanban,
  ShoppingBag,
  MessageSquare,
  Wallet,
  User,
  Settings,
  LogOut,
  X,
  ChevronRight,
  Plus,
  Sparkles,
  Shield,
} from "lucide-react";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const sellerNavItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/services", label: "Services", icon: Store },
  { href: "/dashboard/projects", label: "Projets", icon: FolderKanban },
  { href: "/dashboard/orders", label: "Commandes", icon: ShoppingBag },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/wallet", label: "Portefeuille", icon: Wallet },
];

const buyerNavItems = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Mes Projets", icon: FolderKanban },
  { href: "/dashboard/orders", label: "Commandes", icon: ShoppingBag },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/wallet", label: "Portefeuille", icon: Wallet },
];

export default function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  
  const { data: unreadCount } = trpc.notification.unreadCount.useQuery(undefined, {
    enabled: !!user,
  });

  const navItems = user?.isSeller ? sellerNavItems : buyerNavItems;
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'moderator';

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ background: '#FFFDFB', borderRight: '1px solid #E8E2D9' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid #E8E2D9' }}>
            <Logo size="md" />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden min-h-[44px] min-w-[44px]"
              style={{ color: '#6B6560' }}
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Card */}
          <div className="p-4 mx-4 mt-4 rounded-sm" style={{ background: '#FAF7F2', border: '1px solid #E8E2D9' }}>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10" style={{ border: '2px solid rgba(199, 91, 57, 0.2)' }}>
                <AvatarImage src={user?.avatar || undefined} />
                <AvatarFallback style={{ background: 'rgba(199, 91, 57, 0.1)', color: '#C75B39' }}>
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: '#1A1714' }}>{user?.name || "Utilisateur"}</p>
                <p className="text-xs truncate" style={{ color: '#6B6560' }}>{user?.email}</p>
              </div>
            </div>
            {user?.isSeller && (
              <Badge className="mt-3 w-full justify-center text-xs rounded-sm" style={{ background: 'rgba(92, 107, 74, 0.1)', color: '#5C6B4A', border: '1px solid rgba(92, 107, 74, 0.2)' }}>
                <Sparkles className="h-3 w-3 mr-1" />
                Freelance Pro
              </Badge>
            )}
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-4 space-y-1">
              {navItems.map((item) => {
                const isActive = location === item.href || 
                  (item.href !== "/dashboard" && location.startsWith(item.href));
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-12 rounded-sm transition-all"
                      )}
                      style={isActive ? {
                        background: 'rgba(199, 91, 57, 0.08)',
                        color: '#C75B39'
                      } : {
                        color: '#6B6560'
                      }}
                      onClick={onClose}
                    >
                      <item.icon className="h-5 w-5" style={isActive ? { color: '#C75B39' } : undefined} />
                      {item.label}
                      {item.label === "Messages" && unreadCount && unreadCount > 0 && (
                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#C75B39', color: '#FFFDFB' }}>
                          {unreadCount}
                        </span>
                      )}
                      {isActive && <ChevronRight className="h-4 w-4 ml-auto" style={{ color: '#C75B39' }} />}
                    </Button>
                  </Link>
                );
              })}
              
              {/* Admin Link */}
              {isAdmin && (
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 h-12 rounded-sm transition-all"
                    )}
                    style={location === '/admin' ? {
                      background: 'rgba(139, 69, 19, 0.08)',
                      color: '#8B4513'
                    } : {
                      color: '#6B6560'
                    }}
                    onClick={onClose}
                  >
                    <Shield className="h-5 w-5" style={location === '/admin' ? { color: '#8B4513' } : undefined} />
                    Administration
                    {location === '/admin' && <ChevronRight className="h-4 w-4 ml-auto" style={{ color: '#8B4513' }} />}
                  </Button>
                </Link>
              )}
            </nav>

            {/* Quick Actions */}
            {user?.isSeller && (
              <div className="px-4 mt-6">
                <Link href="/dashboard/services/new">
                  <Button 
                    className="w-full gap-2 rounded-sm h-12"
                    style={{ background: '#C75B39', color: '#FFFDFB' }}
                    onClick={onClose}
                  >
                    <Plus className="h-4 w-4" />
                    Créer un service
                  </Button>
                </Link>
              </div>
            )}

            {!user?.isSeller && (
              <div className="px-4 mt-6">
                <Link href="/become-seller">
                  <Button 
                    className="w-full gap-2 rounded-sm h-12"
                    style={{ background: '#5C6B4A', color: '#FFFDFB' }}
                    onClick={onClose}
                  >
                    <Sparkles className="h-4 w-4" />
                    Devenir Freelance
                  </Button>
                </Link>
              </div>
            )}
          </ScrollArea>

          {/* Bottom Section */}
          <div className="p-4 space-y-1" style={{ borderTop: '1px solid #E8E2D9' }}>
            <Link href={`/profile/${user?.id}`}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-11 rounded-sm"
                style={{ color: '#6B6560' }}
                onClick={onClose}
              >
                <User className="h-5 w-5" />
                Mon Profil
              </Button>
            </Link>
            
            <Link href="/dashboard/settings">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 h-11 rounded-sm"
                )}
                style={location === "/dashboard/settings" ? {
                  background: '#FAF7F2',
                  color: '#1A1714'
                } : {
                  color: '#6B6560'
                }}
                onClick={onClose}
              >
                <Settings className="h-5 w-5" />
                Paramètres
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-11 rounded-sm"
              style={{ color: '#C75B39' }}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Déconnexion
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
