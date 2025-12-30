import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Loader2,
  Users,
  Briefcase,
  Star
} from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginMutation = trpc.auth.loginWithEmail.useMutation({
    onSuccess: () => {
      toast.success("Connexion réussie !");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur de connexion");
    },
  });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync({ email, password });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
    const appId = import.meta.env.VITE_APP_ID;
    
    if (!oauthPortalUrl || !appId) {
      toast.info("Connexion Google non configurée. Utilisez l'email.");
      return;
    }
    
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(redirectUri);
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    
    window.location.href = url.toString();
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#FAF7F2' }}>
      {/* Left Side - Branding with cream/terracotta theme */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FAF7F2 0%, #E8E2D9 100%)' }}>
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: 'rgba(199, 91, 57, 0.08)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full blur-[80px]" style={{ background: 'rgba(92, 107, 74, 0.06)' }} />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link href="/">
            <Logo className="mb-12" />
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block w-8 h-[2px]" style={{ background: '#C75B39' }}></span>
              <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: '#C75B39' }}>
                Plateforme béninoise
              </span>
            </div>
            
            <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714', letterSpacing: '-0.02em' }}>
              Bienvenue sur
              <br />
              <span style={{ color: '#C75B39', fontStyle: 'italic' }}>
                BeninTalent
              </span>
            </h1>
            <p className="text-lg max-w-md" style={{ color: '#6B6560', lineHeight: 1.8 }}>
              Connectez-vous pour accéder à des milliers de freelances talentueux ou proposer vos services.
            </p>
          </motion.div>
          
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 flex gap-12"
          >
            {[
              { value: "500+", label: "Freelances", icon: Users },
              { value: "1000+", label: "Projets", icon: Briefcase },
              { value: "98%", label: "Satisfaction", icon: Star },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col">
                <div className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>{stat.value}</div>
                <div className="text-sm mt-1" style={{ color: '#9A948D' }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: '#FAF7F2' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/">
              <Logo className="inline-block" />
            </Link>
          </div>

          <Card className="p-8" style={{ background: '#FFFDFB', border: '1px solid rgba(0,0,0,0.04)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm mb-4" style={{ background: 'rgba(199, 91, 57, 0.08)', border: '1px solid rgba(199, 91, 57, 0.15)' }}>
                <Sparkles className="w-4 h-4" style={{ color: '#C75B39' }} />
                <span className="text-sm font-medium" style={{ color: '#C75B39' }}>Connexion</span>
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>
                Bon retour parmi nous
              </h2>
              <p style={{ color: '#6B6560' }}>
                Connectez-vous pour continuer
              </p>
            </div>

            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 mb-6 flex items-center justify-center gap-3"
              style={{ background: '#FFFDFB', border: '1px solid #E8E2D9', color: '#3D3833' }}
              onClick={handleGoogleLogin}
            >
              <img src="/google.png" alt="Google" className="w-5 h-5 object-contain" />
              <span>Continuer avec Google</span>
            </Button>

            <div className="relative mb-6">
              <Separator style={{ background: '#E8E2D9' }} />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 text-sm" style={{ background: '#FFFDFB', color: '#9A948D' }}>
                ou
              </span>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: '#3D3833' }}>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9A948D' }} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12"
                    style={{ background: '#FFFDFB', border: '1px solid #E8E2D9', color: '#1A1714' }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: '#3D3833' }}>Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9A948D' }} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12"
                    style={{ background: '#FFFDFB', border: '1px solid #E8E2D9', color: '#1A1714' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#9A948D' }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" style={{ borderColor: '#E8E2D9', accentColor: '#C75B39' }} />
                  <span className="text-sm" style={{ color: '#6B6560' }}>Se souvenir de moi</span>
                </label>
                <Link href="/forgot-password" className="text-sm font-medium" style={{ color: '#C75B39' }}>
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 font-medium"
                style={{ background: '#C75B39', color: '#FFFDFB' }}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Se connecter
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center mt-6" style={{ color: '#6B6560' }}>
              Pas encore de compte ?{" "}
              <Link href="/register" className="font-medium" style={{ color: '#C75B39' }}>
                Créer un compte
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
