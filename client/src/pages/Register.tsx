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
  User,
  Briefcase,
  Users,
  Check
} from "lucide-react";

type UserType = "client" | "freelance";

export default function Register() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<1 | 2>(1);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const registerMutation = trpc.auth.registerWithEmail.useMutation({
    onSuccess: () => {
      toast.success("Compte créé avec succès ! Vérifiez votre email.");
      setLocation("/login");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'inscription");
    },
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    
    if (!acceptTerms) {
      toast.error("Veuillez accepter les conditions d'utilisation");
      return;
    }

    setIsLoading(true);
    try {
      await registerMutation.mutateAsync({
        name,
        email,
        password,
        userType: userType || "client",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
    const appId = import.meta.env.VITE_APP_ID;
    
    if (!oauthPortalUrl || !appId) {
      toast.info("Inscription Google non configurée. Utilisez l'email.");
      return;
    }
    
    const redirectUri = `${window.location.origin}/api/oauth/callback`;
    const state = btoa(JSON.stringify({ redirectUri, userType }));
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signUp");
    
    window.location.href = url.toString();
  };

  const userTypeOptions = [
    {
      type: "client" as UserType,
      icon: Briefcase,
      title: "Je suis Client",
      description: "Je cherche des freelances pour mes projets",
      features: ["Publier des projets", "Commander des services", "Gérer mes commandes"]
    },
    {
      type: "freelance" as UserType,
      icon: Users,
      title: "Je suis Freelance",
      description: "Je propose mes services et compétences",
      features: ["Créer des services", "Postuler aux projets", "Gérer mes revenus"]
    }
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#FAF7F2' }}>
      {/* Left Side - Branding with cream/terracotta theme */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FAF7F2 0%, #E8E2D9 100%)' }}>
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: 'rgba(199, 91, 57, 0.08)' }} />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full blur-[80px]" style={{ background: 'rgba(92, 107, 74, 0.06)' }} />
        </div>
        
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
              Rejoignez la
              <br />
              <span style={{ color: '#C75B39', fontStyle: 'italic' }}>
                communauté
              </span>
            </h1>
            <p className="text-lg max-w-md" style={{ color: '#6B6560', lineHeight: 1.8 }}>
              Créez votre compte et commencez à collaborer avec les meilleurs talents du Bénin.
            </p>
          </motion.div>
          
          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 space-y-4"
          >
            {[
              "Inscription 100% gratuite",
              "Paiements sécurisés via Mobile Money",
              "Support client 24/7",
              "Communauté active de professionnels"
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(92, 107, 74, 0.15)' }}>
                  <Check className="w-4 h-4" style={{ color: '#5C6B4A' }} />
                </div>
                <span style={{ color: '#3D3833' }}>{benefit}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto" style={{ background: '#FAF7F2' }}>
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
            {/* Step 1: Choose User Type */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm mb-4" style={{ background: 'rgba(199, 91, 57, 0.08)', border: '1px solid rgba(199, 91, 57, 0.15)' }}>
                    <Sparkles className="w-4 h-4" style={{ color: '#C75B39' }} />
                    <span className="text-sm font-medium" style={{ color: '#C75B39' }}>Étape 1/2</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>
                    Qui êtes-vous ?
                  </h2>
                  <p style={{ color: '#6B6560' }}>
                    Choisissez votre profil pour personnaliser votre expérience
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  {userTypeOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => setUserType(option.type)}
                      className="w-full p-4 rounded-sm text-left transition-all"
                      style={{
                        background: userType === option.type ? 'rgba(199, 91, 57, 0.05)' : '#FFFDFB',
                        border: userType === option.type ? '2px solid #C75B39' : '1px solid #E8E2D9'
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-sm flex items-center justify-center" style={{
                          background: userType === option.type ? 'rgba(199, 91, 57, 0.1)' : '#E8E2D9'
                        }}>
                          <option.icon className="w-6 h-6" style={{
                            color: userType === option.type ? '#C75B39' : '#6B6560'
                          }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1" style={{
                            color: userType === option.type ? '#C75B39' : '#1A1714'
                          }}>
                            {option.title}
                          </h3>
                          <p className="text-sm mb-2" style={{ color: '#6B6560' }}>{option.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {option.features.map((feature, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-sm"
                                style={{ background: '#E8E2D9', color: '#6B6560' }}
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        {userType === option.type && (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#C75B39' }}>
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={() => userType && setStep(2)}
                  disabled={!userType}
                  className="w-full h-12 font-medium disabled:opacity-50"
                  style={{ background: '#C75B39', color: '#FFFDFB' }}
                >
                  Continuer
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <p className="text-center mt-6" style={{ color: '#6B6560' }}>
                  Déjà un compte ?{" "}
                  <Link href="/login" className="font-medium" style={{ color: '#C75B39' }}>
                    Se connecter
                  </Link>
                </p>
              </motion.div>
            )}

            {/* Step 2: Account Details */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm mb-4" style={{ background: 'rgba(199, 91, 57, 0.08)', border: '1px solid rgba(199, 91, 57, 0.15)' }}>
                    <Sparkles className="w-4 h-4" style={{ color: '#C75B39' }} />
                    <span className="text-sm font-medium" style={{ color: '#C75B39' }}>Étape 2/2</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>
                    Créez votre compte
                  </h2>
                  <p style={{ color: '#6B6560' }}>
                    {userType === "client" ? "Compte Client" : "Compte Freelance"}
                  </p>
                </div>

                {/* Google Register */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 mb-6 flex items-center justify-center gap-3"
                  style={{ background: '#FFFDFB', border: '1px solid #E8E2D9', color: '#3D3833' }}
                  onClick={handleGoogleRegister}
                >
                  <img src="/google.png" alt="Google" className="w-5 h-5 object-contain" />
                  <span>S'inscrire avec Google</span>
                </Button>

                <div className="relative mb-6">
                  <Separator style={{ background: '#E8E2D9' }} />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 text-sm" style={{ background: '#FFFDFB', color: '#9A948D' }}>
                    ou
                  </span>
                </div>

                {/* Email Register Form */}
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" style={{ color: '#3D3833' }}>Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9A948D' }} />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Jean Dupont"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-11 h-12"
                        style={{ background: '#FFFDFB', border: '1px solid #E8E2D9', color: '#1A1714' }}
                      />
                    </div>
                  </div>

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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" style={{ color: '#3D3833' }}>Confirmer le mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#9A948D' }} />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-11 h-12"
                        style={{ background: '#FFFDFB', border: '1px solid #E8E2D9', color: '#1A1714' }}
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="mt-1 rounded"
                      style={{ borderColor: '#E8E2D9', accentColor: '#C75B39' }}
                    />
                    <span className="text-sm" style={{ color: '#6B6560' }}>
                      J'accepte les{" "}
                      <Link href="/terms" style={{ color: '#C75B39' }}>
                        conditions d'utilisation
                      </Link>{" "}
                      et la{" "}
                      <Link href="/privacy" style={{ color: '#C75B39' }}>
                        politique de confidentialité
                      </Link>
                    </span>
                  </label>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="h-12 px-6"
                      style={{ background: '#FFFDFB', border: '1px solid #E8E2D9', color: '#3D3833' }}
                    >
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 h-12 font-medium"
                      style={{ background: '#C75B39', color: '#FFFDFB' }}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Créer mon compte
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <p className="text-center mt-6" style={{ color: '#6B6560' }}>
                  Déjà un compte ?{" "}
                  <Link href="/login" className="font-medium" style={{ color: '#C75B39' }}>
                    Se connecter
                  </Link>
                </p>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
