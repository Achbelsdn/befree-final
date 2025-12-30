import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Loader2,
  CheckCircle
} from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Veuillez entrer votre adresse email");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success("Instructions envoyées par email !");
    }, 1500);
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
                Récupération
              </span>
            </div>
            
            <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714', letterSpacing: '-0.02em' }}>
              Mot de passe
              <br />
              <span style={{ color: '#C75B39', fontStyle: 'italic' }}>
                oublié ?
              </span>
            </h1>
            <p className="text-lg max-w-md" style={{ color: '#6B6560', lineHeight: 1.8 }}>
              Pas de panique ! Entrez votre adresse email et nous vous enverrons les instructions pour réinitialiser votre mot de passe.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
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
            {!isSubmitted ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm mb-4" style={{ background: 'rgba(199, 91, 57, 0.08)', border: '1px solid rgba(199, 91, 57, 0.15)' }}>
                    <Sparkles className="w-4 h-4" style={{ color: '#C75B39' }} />
                    <span className="text-sm font-medium" style={{ color: '#C75B39' }}>Récupération</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>
                    Réinitialiser le mot de passe
                  </h2>
                  <p style={{ color: '#6B6560' }}>
                    Entrez votre email pour recevoir les instructions
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" style={{ color: '#3D3833' }}>Adresse email</Label>
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
                        Envoyer les instructions
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: '#C75B39' }}>
                    <ArrowLeft className="w-4 h-4" />
                    Retour à la connexion
                  </Link>
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(92, 107, 74, 0.1)' }}>
                  <CheckCircle className="w-8 h-8" style={{ color: '#5C6B4A' }} />
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>
                  Email envoyé !
                </h2>
                <p className="mb-6" style={{ color: '#6B6560' }}>
                  Vérifiez votre boîte de réception à l'adresse <strong style={{ color: '#1A1714' }}>{email}</strong>. 
                  Suivez les instructions pour réinitialiser votre mot de passe.
                </p>
                <p className="text-sm mb-6" style={{ color: '#9A948D' }}>
                  Vous n'avez pas reçu l'email ? Vérifiez vos spams ou{" "}
                  <button 
                    onClick={() => setIsSubmitted(false)} 
                    className="font-medium underline"
                    style={{ color: '#C75B39' }}
                  >
                    réessayez
                  </button>
                </p>
                <Link href="/login">
                  <Button
                    className="h-12 px-8 font-medium"
                    style={{ background: '#C75B39', color: '#FFFDFB' }}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Retour à la connexion
                  </Button>
                </Link>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
