import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useLocation } from "wouter";
import Logo from "@/components/Logo";
import {
  Search,
  Menu,
  Settings,
  LogOut,
  LayoutDashboard,
  Heart,
  MessageCircle,
  ShoppingBag,
  Wallet,
  Bell,
  ChevronDown,
  Briefcase,
  Plus,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [, setLocation2] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation2(`/services?search=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation2("/");
  };

  const isHomePage = location === "/";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled || !isHomePage
        ? "bg-[#FAF7F2]/95 backdrop-blur-xl border-b border-[#E8E2D9]"
        : "bg-transparent"
    }`}>
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9A948D] transition-colors group-focus-within:text-[#C75B39]" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-10 h-10 bg-[#FFFDFB] border-[#E8E2D9] focus:bg-white focus:border-[#C75B39] rounded-sm transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/services">
              <Button variant="ghost" size="sm" className="font-medium text-[#3D3833] hover:text-[#C75B39] hover:bg-[#C75B39]/5 min-h-[44px] rounded-sm transition-all duration-300">
                Freelances
              </Button>
            </Link>
            
            <Link href="/projects">
              <Button variant="ghost" size="sm" className="font-medium text-[#3D3833] hover:text-[#C75B39] hover:bg-[#C75B39]/5 min-h-[44px] rounded-sm transition-all duration-300">
                Projets
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <>
                {!user?.isSeller && (
                  <Link href="/become-seller">
                    <Button variant="ghost" size="sm" className="font-medium text-[#5C6B4A] hover:text-[#4A5A3C] hover:bg-[#5C6B4A]/5 min-h-[44px] rounded-sm transition-all duration-300">
                      Devenir Freelance
                    </Button>
                  </Link>
                )}

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-[#3D3833] hover:text-[#C75B39] hover:bg-[#C75B39]/5 min-h-[44px] min-w-[44px] rounded-sm transition-all duration-300">
                  <Bell className="h-5 w-5" />
                </Button>

                {/* Messages */}
                <Link href="/dashboard/messages">
                  <Button variant="ghost" size="icon" className="text-[#3D3833] hover:text-[#C75B39] hover:bg-[#C75B39]/5 min-h-[44px] min-w-[44px] rounded-sm transition-all duration-300">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="ml-2 gap-2 min-h-[44px] text-[#3D3833] hover:text-[#C75B39] hover:bg-[#C75B39]/5 rounded-sm transition-all duration-300">
                      <Avatar className="h-8 w-8 border-2 border-[#E8E2D9]">
                        <AvatarImage src={user?.avatar || undefined} />
                        <AvatarFallback className="bg-[#C75B39]/10 text-[#C75B39] text-sm font-semibold">
                          {user?.name?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden xl:inline font-medium">{user?.name?.split(' ')[0]}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#FFFDFB] border-[#E8E2D9] rounded-sm">
                    <div className="px-3 py-2">
                      <p className="font-medium text-[#1A1714]">{user?.name || "Utilisateur"}</p>
                      <p className="text-xs text-[#9A948D]">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-[#E8E2D9]" />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer text-[#3D3833] hover:text-[#C75B39] hover:bg-[#C75B39]/5">
                        <LayoutDashboard className="h-4 w-4" />
                        Tableau de bord
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2 cursor-pointer text-[#3D3833] hover:text-[#C75B39] hover:bg-[#C75B39]/5">
                        <User className="h-4 w-4" />
                        Mon profil
                      </Link>
                    </DropdownMenuItem>
                    {user?.isSeller && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/services" className="flex items-center gap-2 cursor-pointer text-[#3D3833] hover:text-[#C75B39] hover:bg-[#C75B39]/5">
                            <Briefcase className="h-4 w-4" />
                            Mes Services
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/services/new" className="flex items-center gap-2 cursor-pointer text-[#3D3833] hover:text-[#C75B39] hover:bg-[#C75B39]/5">
                            <Plus className="h-4 w-4" />
                            Créer un Service
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/orders" className="flex items-center gap-2 cursor-pointer text-[#3D3833] hover:text-[#C75B39] hover:bg-[#C75B39]/5">
                        <ShoppingBag className="h-4 w-4" />
                        Mes commandes
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/wallet" className="flex items-center gap-2 cursor-pointer text-[#3D3833] hover:text-[#C75B39] hover:bg-[#C75B39]/5">
                        <Wallet className="h-4 w-4" />
                        Portefeuille
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites" className="flex items-center gap-2 cursor-pointer text-[#3D3833] hover:text-[#C75B39] hover:bg-[#C75B39]/5">
                        <Heart className="h-4 w-4" />
                        Favoris
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#E8E2D9]" />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer text-[#3D3833] hover:text-[#C75B39] hover:bg-[#C75B39]/5">
                        <Settings className="h-4 w-4" />
                        Paramètres
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#E8E2D9]" />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="text-[#B54A4A] focus:text-[#B54A4A] cursor-pointer hover:bg-[#B54A4A]/5"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-medium text-[#3D3833] hover:text-[#C75B39] hover:bg-[#C75B39]/5 min-h-[44px] rounded-sm transition-all duration-300">
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="font-medium bg-[#C75B39] hover:bg-[#A84832] text-white min-h-[44px] rounded-sm transition-all duration-300 hover:-translate-y-0.5">
                    S'inscrire
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden min-h-[44px] min-w-[44px] text-[#3D3833] hover:text-[#C75B39]">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80 bg-[#FFFDFB]">
              <SheetHeader className="border-b border-[#E8E2D9] pb-4">
                <SheetTitle className="text-left">
                  <Logo size="md" />
                </SheetTitle>
              </SheetHeader>
              
              <div className="py-6">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9A948D]" />
                    <Input
                      type="search"
                      placeholder="Rechercher..."
                      className="pl-10 h-12 bg-[#FAF7F2] border-[#E8E2D9] rounded-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>

                {/* Mobile Navigation Links */}
                <nav className="space-y-1">
                  <Link href="/services" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-3 rounded-sm text-[#3D3833] hover:bg-[#C75B39]/5 hover:text-[#C75B39] cursor-pointer transition-colors">
                      <Search className="h-5 w-5" />
                      Trouver un freelance
                    </div>
                  </Link>
                  
                  <Link href="/projects" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-3 px-3 py-3 rounded-sm text-[#3D3833] hover:bg-[#C75B39]/5 hover:text-[#C75B39] cursor-pointer transition-colors">
                      <Briefcase className="h-5 w-5" />
                      Parcourir les projets
                    </div>
                  </Link>

                  {isAuthenticated ? (
                    <>
                      <div className="border-t border-[#E8E2D9] my-4" />
                      
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-3 py-3 rounded-sm text-[#3D3833] hover:bg-[#C75B39]/5 hover:text-[#C75B39] cursor-pointer transition-colors">
                          <LayoutDashboard className="h-5 w-5" />
                          Tableau de bord
                        </div>
                      </Link>
                      
                      <Link href="/dashboard/messages" onClick={() => setMobileMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-3 py-3 rounded-sm text-[#3D3833] hover:bg-[#C75B39]/5 hover:text-[#C75B39] cursor-pointer transition-colors">
                          <MessageCircle className="h-5 w-5" />
                          Messages
                        </div>
                      </Link>
                      
                      <Link href="/dashboard/orders" onClick={() => setMobileMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-3 py-3 rounded-sm text-[#3D3833] hover:bg-[#C75B39]/5 hover:text-[#C75B39] cursor-pointer transition-colors">
                          <ShoppingBag className="h-5 w-5" />
                          Mes commandes
                        </div>
                      </Link>
                      
                      <Link href="/dashboard/wallet" onClick={() => setMobileMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-3 py-3 rounded-sm text-[#3D3833] hover:bg-[#C75B39]/5 hover:text-[#C75B39] cursor-pointer transition-colors">
                          <Wallet className="h-5 w-5" />
                          Portefeuille
                        </div>
                      </Link>
                      
                      <Link href="/favorites" onClick={() => setMobileMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-3 py-3 rounded-sm text-[#3D3833] hover:bg-[#C75B39]/5 hover:text-[#C75B39] cursor-pointer transition-colors">
                          <Heart className="h-5 w-5" />
                          Favoris
                        </div>
                      </Link>
                      
                      <div className="border-t border-[#E8E2D9] my-4" />
                      
                      <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)}>
                        <div className="flex items-center gap-3 px-3 py-3 rounded-sm text-[#3D3833] hover:bg-[#C75B39]/5 hover:text-[#C75B39] cursor-pointer transition-colors">
                          <Settings className="h-5 w-5" />
                          Paramètres
                        </div>
                      </Link>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-3 rounded-sm text-[#B54A4A] hover:bg-[#B54A4A]/5 cursor-pointer w-full transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="border-t border-[#E8E2D9] my-4" />
                      
                      <div className="space-y-3 px-3">
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full h-12 border-[#C75B39] text-[#C75B39] hover:bg-[#C75B39] hover:text-white rounded-sm transition-all">
                            Connexion
                          </Button>
                        </Link>
                        <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full h-12 bg-[#C75B39] hover:bg-[#A84832] text-white rounded-sm transition-all">
                            S'inscrire
                          </Button>
                        </Link>
                      </div>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
