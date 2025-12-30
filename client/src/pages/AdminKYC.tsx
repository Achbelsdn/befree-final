import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRBAC } from "@/hooks/useRBAC";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Download,
  ZoomIn,
  Loader2,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface KYCDocument {
  id: number;
  userId: number;
  documentType: string;
  documentUrl: string;
  documentNumber?: string | null;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  user: {
    id: number;
    name: string | null;
    email: string | null;
    avatar?: string | null;
    phone?: string | null;
    city?: string | null;
    createdAt: string | Date;
  };
}

const documentTypeLabels: Record<string, string> = {
  id_card: "Carte d'identité",
  passport: "Passeport",
  driver_license: "Permis de conduire",
  residence_proof: "Justificatif de domicile",
  selfie: "Selfie avec document",
};

export default function AdminKYC() {
  const [, setLocation] = useLocation();
  const { canManageKYC, canAccessAdminDashboard } = useRBAC();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch KYC documents
  const { data: documents, isLoading, refetch } = trpc.admin.getKYCDocuments.useQuery(
    { status: statusFilter as any },
    { enabled: canAccessAdminDashboard() }
  );

  // Mutations
  const approveKYC = trpc.admin.approveKYC.useMutation({
    onSuccess: () => {
      toast.success("Document KYC approuvé avec succès");
      refetch();
      setReviewDialogOpen(false);
      setSelectedDocument(null);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'approbation");
    },
  });

  const rejectKYC = trpc.admin.rejectKYC.useMutation({
    onSuccess: () => {
      toast.success("Document KYC rejeté");
      refetch();
      setReviewDialogOpen(false);
      setSelectedDocument(null);
      setRejectionReason("");
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors du rejet");
    },
  });

  if (!canAccessAdminDashboard()) {
    setLocation("/");
    return null;
  }

  const handleApprove = async () => {
    if (!selectedDocument) return;
    setIsProcessing(true);
    await approveKYC.mutateAsync({ documentId: selectedDocument.id });
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!selectedDocument || !rejectionReason.trim()) {
      toast.error("Veuillez indiquer la raison du rejet");
      return;
    }
    setIsProcessing(true);
    await rejectKYC.mutateAsync({
      documentId: selectedDocument.id,
      reason: rejectionReason,
    });
    setIsProcessing(false);
  };

  const openReviewDialog = (doc: KYCDocument) => {
    setSelectedDocument(doc);
    setRejectionReason("");
    setReviewDialogOpen(true);
  };

  const filteredDocuments = documents?.filter((doc: KYCDocument) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.user?.name?.toLowerCase().includes(query) ||
      doc.user?.email?.toLowerCase().includes(query) ||
      doc.documentNumber?.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" /> En attente</Badge>;
      case "approved":
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" /> Approuvé</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejeté</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50">
        <div className="container flex items-center gap-4 h-16">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="font-heading text-xl font-bold">Validation KYC</h1>
            <p className="text-xs text-muted-foreground">Vérification des documents d'identité</p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email ou numéro de document..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="approved">Approuvés</SelectItem>
                  <SelectItem value="rejected">Rejetés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{documents?.filter((d: KYCDocument) => d.status === 'pending').length || 0}</p>
                  <p className="text-xs text-muted-foreground">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{documents?.filter((d: KYCDocument) => d.status === 'approved').length || 0}</p>
                  <p className="text-xs text-muted-foreground">Approuvés</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{documents?.filter((d: KYCDocument) => d.status === 'rejected').length || 0}</p>
                  <p className="text-xs text-muted-foreground">Rejetés</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{documents?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card>
          <CardHeader>
            <CardTitle>Documents soumis</CardTitle>
            <CardDescription>
              Cliquez sur un document pour le vérifier et prendre une décision
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredDocuments?.length === 0 ? (
              <div className="text-center py-12">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Aucun document à afficher</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments?.map((doc: KYCDocument) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                        {doc.user?.avatar ? (
                          <img src={doc.user.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{doc.user?.name || "Utilisateur"}</p>
                        <p className="text-sm text-muted-foreground">{doc.user?.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {documentTypeLabels[doc.documentType] || doc.documentType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Soumis le {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(doc.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReviewDialog(doc)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Examiner
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vérification du document KYC</DialogTitle>
            <DialogDescription>
              Examinez le document et les informations de l'utilisateur
            </DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="space-y-6">
              {/* User Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Informations utilisateur</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedDocument.user?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedDocument.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedDocument.user?.phone || "Non renseigné"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedDocument.user?.city || "Non renseigné"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Inscrit le {new Date(selectedDocument.user?.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Document soumis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Type de document</p>
                        <p className="font-medium">
                          {documentTypeLabels[selectedDocument.documentType] || selectedDocument.documentType}
                        </p>
                      </div>
                      {selectedDocument.documentNumber && (
                        <div>
                          <p className="text-sm text-muted-foreground">Numéro</p>
                          <p className="font-medium">{selectedDocument.documentNumber}</p>
                        </div>
                      )}
                    </div>

                    {/* Document Preview */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted p-2 flex items-center justify-between">
                        <span className="text-sm font-medium">Aperçu du document</span>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={selectedDocument.documentUrl} target="_blank" rel="noopener noreferrer">
                              <ZoomIn className="h-4 w-4 mr-1" />
                              Agrandir
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={selectedDocument.documentUrl} download>
                              <Download className="h-4 w-4 mr-1" />
                              Télécharger
                            </a>
                          </Button>
                        </div>
                      </div>
                      <div className="aspect-video bg-muted/50 flex items-center justify-center">
                        <img
                          src={selectedDocument.documentUrl}
                          alt="Document"
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Document";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rejection Reason (if rejecting) */}
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Raison du rejet (si applicable)</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Expliquez pourquoi le document est rejeté..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Vérification importante</p>
                  <p className="text-yellow-700 mt-1">
                    Assurez-vous que le document est lisible, authentique et correspond aux informations du profil.
                    Une fois approuvé, l'utilisateur pourra accéder à toutes les fonctionnalités de la plateforme.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
              Rejeter
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
