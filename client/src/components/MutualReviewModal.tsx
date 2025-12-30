import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Star, Loader2, ThumbsUp, MessageSquare, Clock, Briefcase } from "lucide-react";

interface MutualReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: number;
  revieweeId: number;
  revieweeName: string;
  revieweeAvatar?: string;
  reviewerType: "client" | "freelancer";
  onSuccess?: () => void;
}

interface RatingCategory {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const clientCategories: RatingCategory[] = [
  {
    key: "communication",
    label: "Communication",
    icon: <MessageSquare className="h-4 w-4" />,
    description: "Réactivité et clarté des échanges",
  },
  {
    key: "quality",
    label: "Qualité du travail",
    icon: <ThumbsUp className="h-4 w-4" />,
    description: "Qualité des livrables fournis",
  },
  {
    key: "timeliness",
    label: "Respect des délais",
    icon: <Clock className="h-4 w-4" />,
    description: "Livraison dans les temps convenus",
  },
  {
    key: "professionalism",
    label: "Professionnalisme",
    icon: <Briefcase className="h-4 w-4" />,
    description: "Attitude professionnelle générale",
  },
];

const freelancerCategories: RatingCategory[] = [
  {
    key: "communication",
    label: "Communication",
    icon: <MessageSquare className="h-4 w-4" />,
    description: "Clarté des besoins exprimés",
  },
  {
    key: "quality",
    label: "Clarté du brief",
    icon: <ThumbsUp className="h-4 w-4" />,
    description: "Qualité des instructions fournies",
  },
  {
    key: "timeliness",
    label: "Réactivité",
    icon: <Clock className="h-4 w-4" />,
    description: "Rapidité des retours et validations",
  },
  {
    key: "professionalism",
    label: "Professionnalisme",
    icon: <Briefcase className="h-4 w-4" />,
    description: "Respect et attitude professionnelle",
  },
];

export default function MutualReviewModal({
  open,
  onOpenChange,
  orderId,
  revieweeId,
  revieweeName,
  revieweeAvatar,
  reviewerType,
  onSuccess,
}: MutualReviewModalProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Record<string, number>>({
    communication: 0,
    quality: 0,
    timeliness: 0,
    professionalism: 0,
  });
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState<{ category: string; value: number } | null>(null);

  const categories = reviewerType === "client" ? clientCategories : freelancerCategories;

  const createReview = trpc.mutualReview.create.useMutation({
    onSuccess: () => {
      toast.success("Merci pour votre avis !");
      onOpenChange(false);
      resetForm();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Erreur lors de l'envoi de l'avis");
    },
  });

  const resetForm = () => {
    setOverallRating(0);
    setCategoryRatings({
      communication: 0,
      quality: 0,
      timeliness: 0,
      professionalism: 0,
    });
    setComment("");
  };

  const handleSubmit = () => {
    if (overallRating === 0) {
      toast.error("Veuillez donner une note globale");
      return;
    }

    createReview.mutate({
      orderId,
      revieweeId,
      rating: overallRating,
      comment: comment.trim() || undefined,
      communicationRating: categoryRatings.communication || undefined,
      qualityRating: categoryRatings.quality || undefined,
      timelinessRating: categoryRatings.timeliness || undefined,
      professionalismRating: categoryRatings.professionalism || undefined,
    });
  };

  const renderStars = (
    value: number,
    onChange: (value: number) => void,
    category: string = "overall",
    size: "sm" | "lg" = "sm"
  ) => {
    const starSize = size === "lg" ? "h-8 w-8" : "h-5 w-5";
    const hovered = hoveredStar?.category === category ? hoveredStar.value : 0;
    const displayValue = hovered || value;

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onMouseEnter={() => setHoveredStar({ category, value: star })}
            onMouseLeave={() => setHoveredStar(null)}
            onClick={() => onChange(star)}
          >
            <Star
              className={`${starSize} ${
                star <= displayValue
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Évaluer {revieweeName}</DialogTitle>
          <DialogDescription>
            Partagez votre expérience pour aider la communauté
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <div className="text-center space-y-3">
            <Label className="text-base font-medium">Note globale</Label>
            <div className="flex justify-center">
              {renderStars(overallRating, setOverallRating, "overall", "lg")}
            </div>
            <p className="text-sm text-muted-foreground">
              {overallRating === 0 && "Cliquez pour noter"}
              {overallRating === 1 && "Très insatisfait"}
              {overallRating === 2 && "Insatisfait"}
              {overallRating === 3 && "Correct"}
              {overallRating === 4 && "Satisfait"}
              {overallRating === 5 && "Très satisfait"}
            </p>
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Évaluations détaillées (optionnel)</Label>
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.key}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {category.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{category.label}</p>
                      <p className="text-xs text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  {renderStars(
                    categoryRatings[category.key],
                    (value) =>
                      setCategoryRatings((prev) => ({ ...prev, [category.key]: value })),
                    category.key
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Commentaire (optionnel)</Label>
            <Textarea
              id="comment"
              placeholder={
                reviewerType === "client"
                  ? "Décrivez votre expérience avec ce freelance..."
                  : "Décrivez votre expérience avec ce client..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/1000 caractères
            </p>
          </div>

          {/* Guidelines */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">Conseils pour un bon avis</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Soyez honnête et constructif</li>
              <li>Mentionnez les points positifs et les axes d'amélioration</li>
              <li>Restez professionnel et respectueux</li>
              <li>Évitez les informations personnelles</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={overallRating === 0 || createReview.isPending}
            className="btn-benin"
          >
            {createReview.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Publier l'avis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
