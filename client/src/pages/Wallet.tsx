import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Phone,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import { useState } from "react";

const paymentMethods = [
  { id: "mtn", name: "MTN Mobile Money", color: "#FFCC00", textColor: "#000", logo: "/mtn.png" },
  { id: "moov", name: "Moov Money", color: "#0066B3", textColor: "#fff", logo: "/moov.png" },
  { id: "celtiis", name: "Celtiis Cash", color: "#1A365D", textColor: "#fff", logo: "/celtiis.png" },
];

export default function Wallet() {
  const { user } = useAuth();
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<"mtn" | "moov" | "celtiis">("mtn");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");

  const { data: wallet, isLoading: walletLoading } = trpc.wallet.get.useQuery();
  const { data: transactions, isLoading: txLoading } = trpc.wallet.transactions.useQuery({ limit: 50 });
  
  const withdrawMutation = trpc.wallet.withdraw.useMutation();
  const depositMutation = trpc.wallet.deposit.useMutation();

  const utils = trpc.useUtils();

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${num.toLocaleString('fr-FR')} F`;
  };

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 1000) {
      toast.error("Le montant minimum de retrait est de 1000 FCFA");
      return;
    }
    if (!phoneNumber || phoneNumber.length < 8) {
      toast.error("Veuillez entrer un numéro de téléphone valide");
      return;
    }

    try {
      await withdrawMutation.mutateAsync({
        amount: numAmount,
        paymentMethod: selectedPayment,
        phoneNumber,
      });
      toast.success("Demande de retrait envoyée ! Vous recevrez l'argent sous 24h.");
      setIsWithdrawOpen(false);
      setAmount("");
      setPhoneNumber("");
      utils.wallet.get.invalidate();
      utils.wallet.transactions.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du retrait");
    }
  };

  const handleDeposit = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 500) {
      toast.error("Le montant minimum de dépôt est de 500 FCFA");
      return;
    }
    if (!phoneNumber || phoneNumber.length < 8) {
      toast.error("Veuillez entrer un numéro de téléphone valide");
      return;
    }

    try {
      await depositMutation.mutateAsync({
        amount: numAmount,
        paymentMethod: selectedPayment,
        phoneNumber,
      });
      toast.success("Demande de dépôt envoyée ! Vous recevrez une demande de paiement.");
      setIsDepositOpen(false);
      setAmount("");
      setPhoneNumber("");
      utils.wallet.transactions.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du dépôt");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="rounded-sm" style={{ background: 'rgba(92, 107, 74, 0.1)', color: '#5C6B4A', border: '1px solid rgba(92, 107, 74, 0.2)' }}>
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Complété
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="rounded-sm" style={{ background: 'rgba(139, 69, 19, 0.1)', color: '#8B4513', border: '1px solid rgba(139, 69, 19, 0.2)' }}>
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="rounded-sm" style={{ background: 'rgba(199, 91, 57, 0.1)', color: '#C75B39', border: '1px solid rgba(199, 91, 57, 0.2)' }}>
            <XCircle className="h-3 w-3 mr-1" />
            Échoué
          </Badge>
        );
      default:
        return <Badge className="rounded-sm" style={{ background: '#E8E2D9', color: '#6B6560' }}>{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return <TrendingUp className="h-4 w-4" style={{ color: '#5C6B4A' }} />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4" style={{ color: '#C75B39' }} />;
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4" style={{ color: '#8B4513' }} />;
      case 'payment':
        return <ArrowUpRight className="h-4 w-4" style={{ color: '#C75B39' }} />;
      default:
        return <WalletIcon className="h-4 w-4" style={{ color: '#9A948D' }} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'earning': return 'Revenu';
      case 'withdrawal': return 'Retrait';
      case 'deposit': return 'Dépôt';
      case 'payment': return 'Paiement';
      default: return type;
    }
  };

  if (walletLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-sm" style={{ background: '#E8E2D9' }} />
        <Skeleton className="h-96 w-full rounded-sm" style={{ background: '#E8E2D9' }} />
      </div>
    );
  }

  const balance = parseFloat(wallet?.balance || "0");
  const pendingBalance = parseFloat(wallet?.pendingBalance || "0");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>Portefeuille</h1>
        <p className="mt-1" style={{ color: '#6B6560' }}>Gérez vos fonds et transactions</p>
      </div>

      {/* Balance Card */}
      <div className="relative p-6 rounded-sm overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A1714 0%, #3D3833 100%)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" style={{ background: '#C75B39' }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" style={{ background: '#5C6B4A' }} />
        </div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm flex items-center gap-2" style={{ color: 'rgba(250, 247, 242, 0.8)' }}>
              <WalletIcon className="h-4 w-4" />
              Solde disponible
            </p>
            <p className="text-4xl font-bold mt-2" style={{ fontFamily: 'Playfair Display, serif', color: '#FAF7F2' }}>{formatCurrency(balance)}</p>
            {pendingBalance > 0 && (
              <p className="text-sm mt-2 flex items-center gap-1" style={{ color: 'rgba(250, 247, 242, 0.6)' }}>
                <Clock className="h-3 w-3" />
                {formatCurrency(pendingBalance)} en attente de libération
              </p>
            )}
          </div>
          <div className="flex gap-3">
            {/* Deposit Dialog */}
            <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-sm backdrop-blur-sm" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#FAF7F2', border: 'none' }}>
                  <ArrowDownLeft className="h-4 w-4 mr-2" />
                  Recharger
                </Button>
              </DialogTrigger>
              <DialogContent style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
                <DialogHeader>
                  <DialogTitle style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>Recharger le portefeuille</DialogTitle>
                  <DialogDescription style={{ color: '#6B6560' }}>
                    Ajoutez des fonds via Mobile Money
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label style={{ color: '#3D3833' }}>Montant (FCFA)</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 5000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="rounded-sm"
                      style={{ background: '#FAF7F2', border: '1px solid #E8E2D9', color: '#1A1714' }}
                    />
                    <p className="text-xs" style={{ color: '#9A948D' }}>Minimum: 500 FCFA</p>
                  </div>

                  <div className="space-y-3">
                    <Label style={{ color: '#3D3833' }}>Mode de paiement</Label>
                    <RadioGroup 
                      value={selectedPayment} 
                      onValueChange={(v) => setSelectedPayment(v as any)}
                    >
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="relative">
                          <RadioGroupItem value={method.id} id={`dep-${method.id}`} className="peer sr-only" />
                          <Label
                            htmlFor={`dep-${method.id}`}
                            className="flex items-center gap-3 p-3 rounded-sm cursor-pointer transition-all"
                            style={{ 
                              background: '#FAF7F2', 
                              border: selectedPayment === method.id ? '2px solid #C75B39' : '1px solid #E8E2D9'
                            }}
                          >
                            <div 
                              className="w-12 h-12 rounded-sm flex items-center justify-center overflow-hidden"
                              style={{ backgroundColor: method.color }}
                            >
                              <img src={method.logo} alt={method.name} className="w-10 h-10 object-contain" />
                            </div>
                            <span className="font-medium" style={{ color: '#1A1714' }}>{method.name}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label style={{ color: '#3D3833' }}>Numéro de téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#9A948D' }} />
                      <Input
                        type="tel"
                        placeholder="Ex: 97000000"
                        className="pl-10 rounded-sm"
                        style={{ background: '#FAF7F2', border: '1px solid #E8E2D9', color: '#1A1714' }}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full rounded-sm" 
                    style={{ background: '#C75B39', color: '#FFFDFB' }}
                    onClick={handleDeposit}
                    disabled={depositMutation.isPending}
                  >
                    {depositMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Recharger {amount && formatCurrency(parseFloat(amount) || 0)}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Withdraw Dialog */}
            <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-sm" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#FAF7F2' }}>
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Retirer
                </Button>
              </DialogTrigger>
              <DialogContent style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
                <DialogHeader>
                  <DialogTitle style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>Retirer des fonds</DialogTitle>
                  <DialogDescription style={{ color: '#6B6560' }}>
                    Transférez votre argent vers Mobile Money
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="p-4 rounded-sm" style={{ background: '#FAF7F2', border: '1px solid #E8E2D9' }}>
                    <p className="text-sm" style={{ color: '#6B6560' }}>Solde disponible</p>
                    <p className="text-2xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>{formatCurrency(balance)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label style={{ color: '#3D3833' }}>Montant à retirer (FCFA)</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 10000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      max={balance}
                      className="rounded-sm"
                      style={{ background: '#FAF7F2', border: '1px solid #E8E2D9', color: '#1A1714' }}
                    />
                    <p className="text-xs" style={{ color: '#9A948D' }}>Minimum: 1000 FCFA</p>
                  </div>

                  <div className="space-y-3">
                    <Label style={{ color: '#3D3833' }}>Recevoir sur</Label>
                    <RadioGroup 
                      value={selectedPayment} 
                      onValueChange={(v) => setSelectedPayment(v as any)}
                    >
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="relative">
                          <RadioGroupItem value={method.id} id={`wd-${method.id}`} className="peer sr-only" />
                          <Label
                            htmlFor={`wd-${method.id}`}
                            className="flex items-center gap-3 p-3 rounded-sm cursor-pointer transition-all"
                            style={{ 
                              background: '#FAF7F2', 
                              border: selectedPayment === method.id ? '2px solid #C75B39' : '1px solid #E8E2D9'
                            }}
                          >
                            <div 
                              className="w-12 h-12 rounded-sm flex items-center justify-center overflow-hidden"
                              style={{ backgroundColor: method.color }}
                            >
                              <img src={method.logo} alt={method.name} className="w-10 h-10 object-contain" />
                            </div>
                            <span className="font-medium" style={{ color: '#1A1714' }}>{method.name}</span>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label style={{ color: '#3D3833' }}>Numéro de téléphone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#9A948D' }} />
                      <Input
                        type="tel"
                        placeholder="Ex: 97000000"
                        className="pl-10 rounded-sm"
                        style={{ background: '#FAF7F2', border: '1px solid #E8E2D9', color: '#1A1714' }}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-sm" style={{ background: 'rgba(139, 69, 19, 0.1)', border: '1px solid rgba(139, 69, 19, 0.2)' }}>
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#8B4513' }} />
                      <p className="text-xs" style={{ color: '#8B4513' }}>
                        Les retraits sont traités sous 24h ouvrées. Des frais de 2% peuvent s'appliquer.
                      </p>
                    </div>
                  </div>

                  <Button 
                    className="w-full rounded-sm" 
                    style={{ background: '#C75B39', color: '#FFFDFB' }}
                    onClick={handleWithdraw}
                    disabled={withdrawMutation.isPending || parseFloat(amount || "0") > balance}
                  >
                    {withdrawMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Retirer {amount && formatCurrency(parseFloat(amount) || 0)}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="p-6 rounded-sm" style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>Méthodes de paiement acceptées</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {paymentMethods.map((method) => (
            <div 
              key={method.id}
              className="p-4 rounded-sm flex items-center gap-3"
              style={{ background: '#FAF7F2', border: '1px solid #E8E2D9' }}
            >
              <div 
                className="w-12 h-12 rounded-sm flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: method.color }}
              >
                <img src={method.logo} alt={method.name} className="w-10 h-10 object-contain" />
              </div>
              <div>
                <p className="font-medium" style={{ color: '#1A1714' }}>{method.name}</p>
                <p className="text-xs" style={{ color: '#9A948D' }}>Mobile Money</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="p-6 rounded-sm" style={{ background: '#FFFDFB', border: '1px solid #E8E2D9' }}>
        <h2 className="text-lg font-semibold mb-6" style={{ fontFamily: 'Playfair Display, serif', color: '#1A1714' }}>Historique des transactions</h2>
        
        {txLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-sm" style={{ background: '#E8E2D9' }} />
            ))}
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx: any) => (
              <div 
                key={tx.id} 
                className="flex items-center justify-between p-4 rounded-sm transition-colors"
                style={{ background: '#FAF7F2' }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-sm" style={{ 
                    background: tx.type === 'earning' ? 'rgba(92, 107, 74, 0.1)' :
                      tx.type === 'withdrawal' ? 'rgba(199, 91, 57, 0.1)' :
                      tx.type === 'deposit' ? 'rgba(139, 69, 19, 0.1)' :
                      'rgba(199, 91, 57, 0.1)'
                  }}>
                    {getTypeIcon(tx.type)}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: '#1A1714' }}>{getTypeLabel(tx.type)}</p>
                    <p className="text-sm" style={{ color: '#9A948D' }}>
                      {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(tx.status)}
                  <span className="font-semibold" style={{ 
                    color: tx.type === 'earning' || tx.type === 'deposit' ? '#5C6B4A' : '#C75B39'
                  }}>
                    {tx.type === 'earning' || tx.type === 'deposit' ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-sm flex items-center justify-center mx-auto mb-4" style={{ background: '#E8E2D9' }}>
              <WalletIcon className="h-8 w-8" style={{ color: '#9A948D' }} />
            </div>
            <p style={{ color: '#6B6560' }}>Aucune transaction pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
}
