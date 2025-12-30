import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Heart, MapPin, CheckCircle } from "lucide-react";
import { useState } from "react";

export interface ServiceCardProps {
  service: {

    id: number;
    title: string;
    slug: string;
    shortDescription?: string | null;
    price: string;
    currency: string;
    coverImage?: string | null;
    deliveryTime: number;
    totalOrders?: number | null;
    starCount?: number | null;
    totalStars?: number | null;
    user?: {
      id: number;
      name: string | null;
      avatar: string | null;
      city?: string | null;
      rating?: string | null;
      totalReviews?: number;
    };
    category?: {
      name: string;
      slug: string;
    };
  };
  isFavorited?: boolean;
}

export default function ServiceCard({ service, isFavorited = false }: ServiceCardProps) {
  const [isFavorite, setIsFavorite] = useState(isFavorited);
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate rating
  const rating = service.totalStars && service.starCount 
    ? (service.totalStars / service.starCount).toFixed(1) 
    : service.user?.rating || "0.0";
  const reviewCount = service.starCount || service.user?.totalReviews || 0;
  
  // Format price in FCFA
  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat('fr-FR').format(numPrice);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Link href={`/services/${service.slug}`}>
      <Card 
        className="group overflow-hidden border border-transparent bg-[#FFFDFB] hover:border-[#C75B39] transition-all duration-500 cursor-pointer h-full"
        style={{
          boxShadow: isHovered 
            ? '0 8px 24px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.06)' 
            : '0 2px 8px rgba(0,0,0,0.04), 0 8px 16px rgba(0,0,0,0.03)',
          transform: isHovered ? 'translateY(-6px) rotate(-0.5deg)' : 'translateY(0)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#E8E2D9]">
          {service.coverImage ? (
            <img
              src={service.coverImage}
              alt={service.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E8E2D9] to-[#DDD6CC]">
              <span className="text-[#9A948D] text-sm">Pas d'image</span>
            </div>
          )}
          
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1714]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={`absolute top-4 right-4 w-10 h-10 rounded-sm flex items-center justify-center transition-all duration-300 ${
              isFavorite 
                ? "bg-[#C75B39] text-white" 
                : "bg-[#FFFDFB]/90 text-[#6B6560] hover:bg-[#FFFDFB] hover:text-[#C75B39]"
            }`}
            style={{
              transform: isHovered ? 'translateY(0) scale(1)' : 'translateY(-4px) scale(0.9)',
              opacity: isHovered || isFavorite ? 1 : 0.8,
            }}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart className={`w-5 h-5 transition-transform duration-300 ${isFavorite ? "fill-current scale-110" : "group-hover:scale-110"}`} />
          </button>
          
          {/* Category Badge */}
          {service.category && (
            <div className="absolute bottom-4 left-4">
              <span className="px-3 py-1.5 bg-[#FFFDFB]/95 backdrop-blur-sm rounded-sm text-xs font-medium text-[#3D3833] tracking-wide">
                {service.category.name}
              </span>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-5">
          {/* Seller Info */}
          {service.user && (
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-9 h-9 border-2 border-[#E8E2D9]">
                <AvatarImage src={service.user.avatar || undefined} />
                <AvatarFallback className="bg-[#C75B39]/10 text-[#C75B39] text-xs font-semibold">
                  {service.user.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-[#1A1714] truncate">
                    {service.user.name}
                  </span>
                  <CheckCircle className="w-3.5 h-3.5 text-[#5C6B4A] flex-shrink-0" />
                </div>
                {service.user.city && (
                  <div className="flex items-center gap-1 text-xs text-[#9A948D]">
                    <MapPin className="w-3 h-3" />
                    {service.user.city}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Title */}
          <h3 className="font-medium text-[#1A1714] mb-3 line-clamp-2 group-hover:text-[#C75B39] transition-colors duration-300 leading-snug">
            {service.title}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-4">
            <Star className="w-4 h-4 text-[#C9A962] fill-[#C9A962]" />
            <span className="font-medium text-sm text-[#1A1714]">{rating}</span>
            <span className="text-sm text-[#9A948D]">({reviewCount})</span>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E8E2D9]">
            <div className="text-xs text-[#9A948D]">
              {service.deliveryTime} jour{service.deliveryTime > 1 ? 's' : ''}
            </div>
            <div className="text-right">
              <div className="text-xs text-[#9A948D] mb-0.5">À partir de</div>
              <div className="font-semibold text-[#C75B39]">
                {formatPrice(service.price)} <span className="text-xs font-normal">{service.currency}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
