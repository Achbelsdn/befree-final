import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link, useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import {
  Briefcase,
  Clock,
  DollarSign,
  MapPin,
  Heart,
  MessageCircle,
  Bookmark,
  Eye,
  Users,
  ArrowLeft,
  Send,
  Calendar,
  CheckCircle2,
  Star,
  Share2,
  Flag,
  Loader2,
  FileText,
  Link as LinkIcon,
  ThumbsUp
} from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedBudget, setProposedBudget] = useState("");
  const [proposedDuration, setProposedDuration] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const projectId = parseInt(id || "0");

  const { data: project, isLoading, refetch } = trpc.project.getById.useQuery(
    { id: projectId },
    { enabled: projectId > 0 }
  );

  const { data: comments } = trpc.project.getComments.useQuery(
    { projectId },
    { enabled: projectId > 0 }
  );

  const applyMutation = trpc.project.submitApplication.useMutation({
    onSuccess: () => {
      toast.success("Candidature envoyée avec succès !");
      setIsApplyModalOpen(false);
      setCoverLetter("");
      setProposedBudget("");
      setProposedDuration("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'envoi de la candidature");
    },
  });

  const likeMutation = trpc.project.toggleLike.useMutation({
    onSuccess: () => refetch(),
  });

  const saveMutation = trpc.project.toggleSave.useMutation({
    onSuccess: () => refetch(),
  });

  const commentMutation = trpc.project.addComment.useMutation({
    onSuccess: () => {
      toast.success("Commentaire ajouté !");
      setComment("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'ajout du commentaire");
    },
  });

  const handleApply = async () => {
    if (!coverLetter.trim()) {
      toast.error("Veuillez rédiger une lettre de motivation");
      return;
    }
    setIsSubmitting(true);
    try {
      await applyMutation.mutateAsync({
        projectId,
        coverLetter,
        proposedBudget: proposedBudget || undefined,
        proposedDuration: proposedDuration || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour aimer ce projet");
      return;
    }
    likeMutation.mutate({ projectId });
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour sauvegarder ce projet");
      return;
    }
    saveMutation.mutate({ projectId });
  };

  const handleComment = () => {
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour commenter");
      return;
    }
    if (!comment.trim()) return;
    commentMutation.mutate({ projectId, content: comment });
  };

  const getBudgetDisplay = (min?: string | null, max?: string | null) => {
    if (!min && !max) return "Budget à négocier";
    if (min && max) return `${parseInt(min).toLocaleString()} - ${parseInt(max).toLocaleString()} XOF`;
    if (min) return `À partir de ${parseInt(min).toLocaleString()} XOF`;
    if (max) return `Jusqu'à ${parseInt(max).toLocaleString()} XOF`;
    return "Budget à négocier";
  };

  const getExperienceBadge = (level?: string | null) => {
    switch (level) {
      case "entry":
        return { label: "Débutant accepté", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
      case "intermediate":
        return { label: "Intermédiaire", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
      case "expert":
        return { label: "Expert requis", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
      default:
        return { label: "Tous niveaux", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Projet non trouvé</h2>
            <p className="text-white/50 mb-6">Ce projet n'existe pas ou a été supprimé.</p>
            <Link href="/projects">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux projets
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const expBadge = getExperienceBadge(project.experienceLevel);
  const skills = project.skills ? JSON.parse(project.skills) : [];
  const canApply = isAuthenticated && user?.userType === "freelance" && project.status === "open";
  const isOwner = isAuthenticated && user?.id === project.clientId;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container">
          {/* Back Button */}
          <Link href="/projects">
            <Button variant="ghost" className="text-white/60 hover:text-white mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux projets
            </Button>
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white/[0.03] border-white/[0.08] p-8">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={expBadge.color}>{expBadge.label}</Badge>
                        <Badge className={`${project.status === "open" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                          {project.status === "open" ? "Ouvert" : project.status === "in_progress" ? "En cours" : "Fermé"}
                        </Badge>
                      </div>
                      <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
                      <div className="flex items-center gap-4 text-white/50 text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Publié {project.createdAt && formatDistanceToNow(new Date(project.createdAt), { addSuffix: true, locale: fr })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {project.viewCount || 0} vues
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleLike}
                        className={`p-2 rounded-lg transition-colors ${project.isLiked ? "bg-rose-500/20 text-rose-400" : "bg-white/[0.05] text-white/40 hover:text-rose-400"}`}
                      >
                        <Heart className={`w-5 h-5 ${project.isLiked ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={handleSave}
                        className={`p-2 rounded-lg transition-colors ${project.isSaved ? "bg-amber-500/20 text-amber-400" : "bg-white/[0.05] text-white/40 hover:text-amber-400"}`}
                      >
                        <Bookmark className={`w-5 h-5 ${project.isSaved ? "fill-current" : ""}`} />
                      </button>
                      <button className="p-2 rounded-lg bg-white/[0.05] text-white/40 hover:text-white transition-colors">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="prose prose-invert max-w-none mb-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Description du projet</h3>
                    <p className="text-white/70 whitespace-pre-wrap">{project.description}</p>
                  </div>

                  {/* Requirements */}
                  {project.requirements && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">Exigences</h3>
                      <p className="text-white/70 whitespace-pre-wrap">{project.requirements}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Compétences requises</h3>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 text-sm rounded-full bg-white/[0.05] text-white/70 border border-white/[0.08]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* Comments Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="bg-white/[0.03] border-white/[0.08] p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Commentaires ({project.commentCount || 0})
                  </h3>

                  {/* Add Comment */}
                  {isAuthenticated && (
                    <div className="flex gap-3 mb-6">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user?.avatar || ""} />
                        <AvatarFallback className="bg-emerald-500/20 text-emerald-400">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="Ajouter un commentaire..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30 resize-none mb-2"
                          rows={2}
                        />
                        <Button
                          onClick={handleComment}
                          disabled={!comment.trim() || commentMutation.isPending}
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          {commentMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Commenter
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments && comments.length > 0 ? (
                      comments.map((c: any) => (
                        <div key={c.id} className="flex gap-3 p-4 rounded-lg bg-white/[0.02]">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={c.user?.avatar || ""} />
                            <AvatarFallback className="bg-white/[0.1] text-white/60">
                              {c.user?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-white">{c.user?.name || "Utilisateur"}</span>
                              <span className="text-white/40 text-sm">
                                {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: fr })}
                              </span>
                            </div>
                            <p className="text-white/70">{c.content}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <button className="text-white/40 hover:text-white text-sm flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" />
                                {c.likeCount || 0}
                              </button>
                              <button className="text-white/40 hover:text-white text-sm">
                                Répondre
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-white/40 py-8">
                        Aucun commentaire pour le moment. Soyez le premier à commenter !
                      </p>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Budget Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="bg-white/[0.03] border-white/[0.08] p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-emerald-400 mb-1">
                      {getBudgetDisplay(project.budgetMin, project.budgetMax)}
                    </div>
                    <div className="text-white/50 text-sm">
                      {project.budgetType === "fixed" ? "Prix fixe" : project.budgetType === "hourly" ? "Taux horaire" : "Négociable"}
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {project.deadline && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date limite
                        </span>
                        <span className="text-white">{format(new Date(project.deadline), "dd MMM yyyy", { locale: fr })}</span>
                      </div>
                    )}
                    {project.duration && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/50 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Durée estimée
                        </span>
                        <span className="text-white">{project.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Candidatures
                      </span>
                      <span className="text-white">{project.applicationCount || 0}</span>
                    </div>
                  </div>

                  {canApply && (
                    <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium">
                          <Send className="w-4 h-4 mr-2" />
                          Postuler maintenant
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#1a1a2e] border-white/[0.1] text-white max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Postuler à ce projet</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <Label className="text-white/70">Lettre de motivation *</Label>
                            <Textarea
                              placeholder="Présentez-vous et expliquez pourquoi vous êtes le candidat idéal..."
                              value={coverLetter}
                              onChange={(e) => setCoverLetter(e.target.value)}
                              className="mt-2 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30 min-h-[150px]"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-white/70">Budget proposé (XOF)</Label>
                              <Input
                                type="number"
                                placeholder="Ex: 150000"
                                value={proposedBudget}
                                onChange={(e) => setProposedBudget(e.target.value)}
                                className="mt-2 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30"
                              />
                            </div>
                            <div>
                              <Label className="text-white/70">Durée proposée</Label>
                              <Input
                                placeholder="Ex: 2 semaines"
                                value={proposedDuration}
                                onChange={(e) => setProposedDuration(e.target.value)}
                                className="mt-2 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30"
                              />
                            </div>
                          </div>
                          <Button
                            onClick={handleApply}
                            disabled={isSubmitting || !coverLetter.trim()}
                            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Envoyer ma candidature
                              </>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}

                  {!isAuthenticated && (
                    <Link href="/login">
                      <Button className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium">
                        Connectez-vous pour postuler
                      </Button>
                    </Link>
                  )}

                  {isOwner && (
                    <Link href={`/dashboard/projects/${project.id}`}>
                      <Button className="w-full h-12 bg-white/[0.1] hover:bg-white/[0.15] text-white">
                        Gérer ce projet
                      </Button>
                    </Link>
                  )}
                </Card>
              </motion.div>

              {/* Client Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-white/[0.03] border-white/[0.08] p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">À propos du client</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={project.client?.avatar || ""} />
                      <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-lg">
                        {project.client?.name?.charAt(0) || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-white">{project.client?.name || "Client"}</div>
                      <div className="text-white/50 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {project.client?.city || "Bénin"}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-white/50">Membre depuis</span>
                      <span className="text-white">
                        {project.client?.createdAt && format(new Date(project.client.createdAt), "MMM yyyy", { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/50">Projets publiés</span>
                      <span className="text-white">{project.client?.projectCount || 1}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="bg-white/[0.03] border-white/[0.08] p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Engagement</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{project.likeCount || 0}</div>
                      <div className="text-white/50 text-sm">Likes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{project.commentCount || 0}</div>
                      <div className="text-white/50 text-sm">Commentaires</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{project.saveCount || 0}</div>
                      <div className="text-white/50 text-sm">Sauvegardés</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
