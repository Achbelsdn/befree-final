import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Home,
  Plus,
} from "lucide-react";
import { useState } from "react";

interface DashboardHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function DashboardHeader({ onMenuClick, title }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: notifications } = trpc.notification.list.useQuery({ limit: 5 }, {
    enabled: !!user,
  });
  
  const { data: unreadCount } = trpc.notification.unreadCount.useQuery(undefined, {
    enabled: !!user,
  });

  const markAllAsRead = trpc.notification.markAllAsRead.useMutation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/services?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl h-16 flex items-center px-4 lg:px-6" style={{ background: 'rgba(255, 253, 251, 0.95)', borderBottom: '1px solid #E8E2D9' }}>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden mr-2 min-h-[48px] min-w-[48px]"
        style={{ color: '#6B6560' }}
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Title or Search */}
      <div className="flex-1 flex items-center gap-4">
        {title && (
          <h1 className="font-semibold text-lg hidden sm:block" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>{title}</h1>
        )}
        
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#9A948D' }} />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-10 h-10 rounded-sm"
              style={{ background: '#FAF7F2', border: '1px solid #E8E2D9', color: '#1A1714' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Create Service Button */}
        {user?.isSeller && (
          <Link href="/dashboard/services/new">
            <Button size="sm" className="hidden sm:flex rounded-sm min-h-[44px]" style={{ background: '#C75B39', color: '#FFFDFB' }}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau
            </Button>
          </Link>
        )}

        {/* Home Link */}
        <Link href="/">
          <Button variant="ghost" size="icon" className="hidden sm:flex rounded-sm min-h-[44px] min-w-[44px]" style={{ color: '#6B6560' }}>
            <Home className="h-5 w-5" />
          </Button>
        </Link>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-sm min-h-[44px] min-w-[44px]" style={{ color: '#6B6560' }}>
              <Bell className="h-5 w-5" />
              {unreadCount && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium" style={{ background: '#C75B39', color: '#FFFDFB' }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80" style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
            <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid #E8E2D9' }}>
              <span className="font-medium" style={{ color: '#1A1714' }}>Notifications</span>
              {unreadCount && unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-auto py-1"
                  style={{ color: '#C75B39' }}
                  onClick={() => markAllAsRead.mutate()}
                >
                  Tout marquer lu
                </Button>
              )}
            </div>
            {notifications && notifications.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <DropdownMenuItem key={notif.id} asChild>
                    <Link 
                      href={notif.link || "#"} 
                      className="flex flex-col gap-1 p-3 cursor-pointer"
                      style={{ background: !notif.isRead ? 'rgba(199, 91, 57, 0.05)' : 'transparent' }}
                    >
                      <span className="font-medium text-sm" style={{ color: '#1A1714' }}>{notif.title}</span>
                      {notif.content && (
                        <span className="text-xs line-clamp-2" style={{ color: '#6B6560' }}>{notif.content}</span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm" style={{ color: '#6B6560' }}>
                Aucune notification
              </div>
            )}
            <DropdownMenuSeparator style={{ background: '#E8E2D9' }} />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/notifications" className="w-full text-center text-sm" style={{ color: '#C75B39' }}>
                Voir toutes les notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 rounded-sm min-h-[44px]" style={{ color: '#3D3833' }}>
              <Avatar className="h-8 w-8" style={{ border: '2px solid rgba(199, 91, 57, 0.2)' }}>
                <AvatarImage src={user?.avatar || undefined} />
                <AvatarFallback className="text-sm" style={{ background: 'rgba(199, 91, 57, 0.1)', color: '#C75B39' }}>
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56" style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
            <div className="px-3 py-2">
              <p className="font-medium" style={{ color: '#1A1714' }}>{user?.name || "Utilisateur"}</p>
              <p className="text-sm" style={{ color: '#6B6560' }}>{user?.email}</p>
            </div>
            <DropdownMenuSeparator style={{ background: '#E8E2D9' }} />
            <DropdownMenuItem asChild>
              <Link href={`/profile/${user?.id}`} className="flex items-center gap-2 cursor-pointer" style={{ color: '#3D3833' }}>
                <User className="h-4 w-4" />
                Mon Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer" style={{ color: '#3D3833' }}>
                <Settings className="h-4 w-4" />
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ background: '#E8E2D9' }} />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="flex items-center gap-2 cursor-pointer"
              style={{ color: '#C75B39' }}
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
