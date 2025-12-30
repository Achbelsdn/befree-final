import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  Users,
  FileText,
  X,
  Plus,
  Loader2,
  CheckCircle2,
  Sparkles,
  Target,
  Lightbulb
} from "lucide-react";

export default function CreateProject() {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [budgetType, setBudgetType] = useState<"fixed" | "hourly" | "negotiable">("fixed");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [deadline, setDeadline] = useState("");
  const [duration, setDuration] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<"entry" | "intermediate" | "expert">("intermediate");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [requirements, setRequirements] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  const { data: categories } = trpc.category.list.useQuery();

  const { data: existingProject } = trpc.project.getById.useQuery(
    { id: parseInt(id || "0") },
    { enabled: isEditing && parseInt(id || "0") > 0 }
  );

  useEffect(() => {
    if (existingProject) {
      setTitle(existingProject.title);
      setDescription(existingProject.description);
      setCategoryId(existingProject.categoryId?.toString() || "");
      setBudgetType(existingProject.budgetType as any);
      setBudgetMin(existingProject.budgetMin || "");
      setBudgetMax(existingProject.budgetMax || "");
      setDeadline(existingProject.deadline ? new Date(existingProject.deadline).toISOString().split('T')[0] : "");
      setDuration(existingProject.duration || "");
      setExperienceLevel(existingProject.experienceLevel as any || "intermediate");
      setSkills(existingProject.skills ? JSON.parse(existingProject.skills) : []);
      setRequirements(existingProject.requirements || "");
      setVisibility(existingProject.visibility as any || "public");
    }
  }, [existingProject]);

  const createMutation = trpc.project.create.useMutation({
    onSuccess: (data) => {
      toast.success("Projet créé avec succès !");
      setLocation(`/projects/${data.projectId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la création du projet");
    },
  });

  const updateMutation = trpc.project.update.useMutation({
    onSuccess: () => {
      toast.success("Projet mis à jour !");
      setLocation(`/projects/${id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Veuillez entrer un titre");
      return;
    }
    if (!description.trim()) {
      toast.error("Veuillez entrer une description");
      return;
    }

    setIsSubmitting(true);
    try {
      const projectData = {
        title,
        description,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        budgetType,
        budgetMin: budgetMin || undefined,
        budgetMax: budgetMax || undefined,
        deadline: deadline || undefined,
        duration: duration || undefined,
        experienceLevel,
        skills: JSON.stringify(skills),
        requirements: requirements || undefined,
        visibility,
      };

      if (isEditing) {
        await updateMutation.mutateAsync({
          projectId: parseInt(id!),
          ...projectData,
        });
      } else {
        await createMutation.mutateAsync(projectData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: "Informations de base", icon: FileText },
    { number: 2, title: "Budget & Délais", icon: DollarSign },
    { number: 3, title: "Compétences requises", icon: Target },
    { number: 4, title: "Finalisation", icon: CheckCircle2 },
  ];

  // Redirect if not authenticated or not a client
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Card className="bg-white/[0.03] border-white/[0.08] p-8 text-center max-w-md">
          <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connexion requise</h2>
          <p className="text-white/50 mb-6">Connectez-vous pour publier un projet.</p>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500">
              Se connecter
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="border-b border-white/[0.08] bg-white/[0.02]">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/projects">
                <Button variant="ghost" className="text-white/60 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {isEditing ? "Modifier le projet" : "Publier un projet"}
                </h1>
                <p className="text-white/50">
                  {isEditing ? "Mettez à jour les informations de votre projet" : "Décrivez votre projet pour attirer les meilleurs freelances"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-12">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      step >= s.number
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                        : "bg-white/[0.05] text-white/40"
                    }`}
                  >
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-sm mt-2 ${step >= s.number ? "text-white" : "text-white/40"}`}>
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-0.5 mx-4 ${step > s.number ? "bg-emerald-500" : "bg-white/[0.1]"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-white/[0.03] border-white/[0.08] p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Informations de base</h2>
                    <p className="text-white/50 text-sm">Décrivez votre projet en détail</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-white/70">Titre du projet *</Label>
                    <Input
                      placeholder="Ex: Création d'un site e-commerce pour ma boutique"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-2 h-12 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30"
                    />
                  </div>

                  <div>
                    <Label className="text-white/70">Description détaillée *</Label>
                    <Textarea
                      placeholder="Décrivez votre projet en détail : objectifs, fonctionnalités souhaitées, contexte..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-2 min-h-[200px] bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30"
                    />
                    <p className="text-white/40 text-sm mt-2">
                      Conseil : Plus votre description est détaillée, plus vous recevrez des candidatures pertinentes.
                    </p>
                  </div>

                  <div>
                    <Label className="text-white/70">Catégorie</Label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger className="mt-2 h-12 bg-white/[0.05] border-white/[0.1] text-white">
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a2e] border-white/[0.1]">
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()} className="text-white">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!title.trim() || !description.trim()}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    Continuer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Budget & Timeline */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-white/[0.03] border-white/[0.08] p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Budget & Délais</h2>
                    <p className="text-white/50 text-sm">Définissez votre budget et vos contraintes de temps</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-white/70">Type de budget</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {[
                        { value: "fixed", label: "Prix fixe", desc: "Montant total défini" },
                        { value: "hourly", label: "Taux horaire", desc: "Paiement à l'heure" },
                        { value: "negotiable", label: "À négocier", desc: "Budget flexible" },
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setBudgetType(type.value as any)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            budgetType === type.value
                              ? "bg-emerald-500/10 border-emerald-500/50"
                              : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]"
                          }`}
                        >
                          <div className={`font-medium ${budgetType === type.value ? "text-emerald-400" : "text-white"}`}>
                            {type.label}
                          </div>
                          <div className="text-white/40 text-sm">{type.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {budgetType !== "negotiable" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/70">Budget minimum (XOF)</Label>
                        <Input
                          type="number"
                          placeholder="Ex: 50000"
                          value={budgetMin}
                          onChange={(e) => setBudgetMin(e.target.value)}
                          className="mt-2 h-12 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30"
                        />
                      </div>
                      <div>
                        <Label className="text-white/70">Budget maximum (XOF)</Label>
                        <Input
                          type="number"
                          placeholder="Ex: 200000"
                          value={budgetMax}
                          onChange={(e) => setBudgetMax(e.target.value)}
                          className="mt-2 h-12 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/70">Date limite</Label>
                      <Input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="mt-2 h-12 bg-white/[0.05] border-white/[0.1] text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white/70">Durée estimée</Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="mt-2 h-12 bg-white/[0.05] border-white/[0.1] text-white">
                          <SelectValue placeholder="Sélectionnez" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a2e] border-white/[0.1]">
                          <SelectItem value="less_than_1_week" className="text-white">Moins d'une semaine</SelectItem>
                          <SelectItem value="1_2_weeks" className="text-white">1-2 semaines</SelectItem>
                          <SelectItem value="2_4_weeks" className="text-white">2-4 semaines</SelectItem>
                          <SelectItem value="1_3_months" className="text-white">1-3 mois</SelectItem>
                          <SelectItem value="3_6_months" className="text-white">3-6 mois</SelectItem>
                          <SelectItem value="more_than_6_months" className="text-white">Plus de 6 mois</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="bg-white/[0.05] border-white/[0.1] text-white hover:bg-white/[0.1]"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    Continuer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Skills */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-white/[0.03] border-white/[0.08] p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Compétences requises</h2>
                    <p className="text-white/50 text-sm">Définissez le profil idéal pour votre projet</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-white/70">Niveau d'expérience requis</Label>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {[
                        { value: "entry", label: "Débutant", desc: "Moins de 2 ans" },
                        { value: "intermediate", label: "Intermédiaire", desc: "2-5 ans" },
                        { value: "expert", label: "Expert", desc: "Plus de 5 ans" },
                      ].map((level) => (
                        <button
                          key={level.value}
                          onClick={() => setExperienceLevel(level.value as any)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            experienceLevel === level.value
                              ? "bg-emerald-500/10 border-emerald-500/50"
                              : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]"
                          }`}
                        >
                          <div className={`font-medium ${experienceLevel === level.value ? "text-emerald-400" : "text-white"}`}>
                            {level.label}
                          </div>
                          <div className="text-white/40 text-sm">{level.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/70">Compétences recherchées</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Ex: React, Node.js, Figma..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                        className="h-12 bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30"
                      />
                      <Button
                        type="button"
                        onClick={handleAddSkill}
                        className="h-12 px-4 bg-white/[0.1] hover:bg-white/[0.15]"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {skills.map((skill) => (
                          <Badge
                            key={skill}
                            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1"
                          >
                            {skill}
                            <button
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-2 hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-white/70">Exigences supplémentaires</Label>
                    <Textarea
                      placeholder="Autres exigences ou informations importantes pour les candidats..."
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      className="mt-2 min-h-[120px] bg-white/[0.05] border-white/[0.1] text-white placeholder:text-white/30"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="bg-white/[0.05] border-white/[0.1] text-white hover:bg-white/[0.1]"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                  <Button
                    onClick={() => setStep(4)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                  >
                    Continuer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Review & Submit */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-white/[0.03] border-white/[0.08] p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Vérification finale</h2>
                    <p className="text-white/50 text-sm">Vérifiez les informations avant de publier</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Summary */}
                  <div className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
                    <p className="text-white/60 mb-4 line-clamp-3">{description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/40">Budget:</span>
                        <span className="text-white ml-2">
                          {budgetType === "negotiable" 
                            ? "À négocier" 
                            : `${budgetMin || "?"} - ${budgetMax || "?"} XOF`}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40">Niveau:</span>
                        <span className="text-white ml-2 capitalize">{experienceLevel}</span>
                      </div>
                      {deadline && (
                        <div>
                          <span className="text-white/40">Deadline:</span>
                          <span className="text-white ml-2">{deadline}</span>
                        </div>
                      )}
                      {duration && (
                        <div>
                          <span className="text-white/40">Durée:</span>
                          <span className="text-white ml-2">{duration.replace(/_/g, " ")}</span>
                        </div>
                      )}
                    </div>

                    {skills.length > 0 && (
                      <div className="mt-4">
                        <span className="text-white/40 text-sm">Compétences:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {skills.map((skill) => (
                            <Badge key={skill} className="bg-white/[0.05] text-white/70">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Visibility */}
                  <div>
                    <Label className="text-white/70">Visibilité du projet</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <button
                        onClick={() => setVisibility("public")}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          visibility === "public"
                            ? "bg-emerald-500/10 border-emerald-500/50"
                            : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className={`font-medium ${visibility === "public" ? "text-emerald-400" : "text-white"}`}>
                          Public
                        </div>
                        <div className="text-white/40 text-sm">Visible par tous les freelances</div>
                      </button>
                      <button
                        onClick={() => setVisibility("private")}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          visibility === "private"
                            ? "bg-emerald-500/10 border-emerald-500/50"
                            : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className={`font-medium ${visibility === "private" ? "text-emerald-400" : "text-white"}`}>
                          Privé
                        </div>
                        <div className="text-white/40 text-sm">Uniquement sur invitation</div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="bg-white/[0.05] border-white/[0.1] text-white hover:bg-white/[0.1]"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-8"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        {isEditing ? "Mettre à jour" : "Publier le projet"}
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
