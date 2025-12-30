import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  FolderKanban,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Wallet,
  Loader2,
  FileText,
  Users,
  Eye,
} from "lucide-react";
import { useState } from "react";

export default function Projects() {
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [requirements, setRequirements] = useState("");

  const { data: myProjects, isLoading: myLoading } = trpc.project.myProjects.useQuery();
  const { data: freelancerProjects, isLoading: freelancerLoading } = trpc.project.freelancerProjects.useQuery(
    undefined,
    { enabled: user?.isSeller }
  );
  const { data: openProjects, isLoading: openLoading } = trpc.project.openProjects.useQuery(
    { limit: 20 },
    { enabled: user?.isSeller }
  );

  const createProject = trpc.project.create.useMutation();
  const utils = trpc.useUtils();

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Veuillez entrer un titre");
      return;
    }
    if (!description.trim()) {
      toast.error("Veuillez entrer une description");
      return;
    }
    if (!budget.trim()) {
      toast.error("Veuillez entrer un budget");
      return;
    }

    try {
      await createProject.mutateAsync({
        title,
        description,
        budgetMin: budget,
        budgetMax: budget,
        budgetType: 'fixed' as const,
        deadline: deadline || undefined,
        requirements: requirements || undefined,
      });
      toast.success("Projet créé avec succès !");
      setIsCreateOpen(false);
      setTitle("");
      setDescription("");
      setBudget("");
      setDeadline("");
      setRequirements("");
      utils.project.myProjects.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Ouvert</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">En cours</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500/10 text-gray-600 hover:bg-gray-500/20">Terminé</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulé</Badge>;
      case 'draft':
        return <Badge variant="outline">Brouillon</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: string) => {
    return `${parseFloat(amount).toLocaleString('fr-FR')} FCFA`;
  };

  const ProjectCard = ({ project, showActions = false }: { project: any; showActions?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(project.status)}
              {project.deadline && new Date(project.deadline) < new Date() && project.status === 'open' && (
                <Badge variant="destructive" className="text-xs">Expiré</Badge>
              )}
            </div>
            <h3 className="font-semibold text-lg truncate">{project.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Wallet className="h-4 w-4" />
                {formatCurrency(project.budget)}
              </div>
              {project.deadline && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(project.deadline).toLocaleDateString('fr-FR')}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(project.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
          {showActions && project.status === 'open' && (
            <Button size="sm" className="btn-benin shrink-0">
              Postuler
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Projets</h1>
          <p className="text-muted-foreground">
            {user?.isSeller 
              ? "Gérez vos projets et trouvez de nouvelles opportunités"
              : "Publiez des projets et trouvez des freelances"
            }
          </p>
        </div>
        
        {!user?.isSeller && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="btn-benin gap-2">
                <Plus className="h-4 w-4" />
                Publier un projet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Publier un projet</DialogTitle>
                <DialogDescription>
                  Décrivez votre projet pour trouver le freelance idéal
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre du projet *</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Création d'un site e-commerce"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre projet en détail..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (FCFA) *</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="Ex: 50000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Date limite</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Exigences spécifiques</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Compétences requises, technologies, etc."
                    rows={2}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                  />
                </div>

                <Button 
                  className="w-full btn-benin" 
                  onClick={handleCreate}
                  disabled={createProject.isPending}
                >
                  {createProject.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Publier le projet
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs for Sellers */}
      {user?.isSeller ? (
        <Tabs defaultValue="opportunities" className="space-y-6">
          <TabsList>
            <TabsTrigger value="opportunities">Opportunités</TabsTrigger>
            <TabsTrigger value="assigned">Mes missions</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="space-y-4">
            {openLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : openProjects && openProjects.length > 0 ? (
              <div className="space-y-4">
                {openProjects.map((project: any) => (
                  <ProjectCard key={project.id} project={project} showActions />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FolderKanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="font-medium">Aucun projet disponible</p>
                  <p className="text-sm text-muted-foreground">
                    Les nouveaux projets apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assigned" className="space-y-4">
            {freelancerLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : freelancerProjects && freelancerProjects.length > 0 ? (
              <div className="space-y-4">
                {freelancerProjects.map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="font-medium">Aucune mission en cours</p>
                  <p className="text-sm text-muted-foreground">
                    Postulez aux projets pour commencer
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        /* Client Projects */
        <div className="space-y-4">
          {myLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : myProjects && myProjects.length > 0 ? (
            <div className="space-y-4">
              {myProjects.map((project: any) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <FolderKanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="font-medium">Aucun projet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Publiez votre premier projet pour trouver des freelances
                </p>
                <Button className="btn-benin gap-2" onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Publier un projet
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
