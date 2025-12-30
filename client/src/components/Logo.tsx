import { Link } from "wouter";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = "md", variant = "default", showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: "w-7 h-7", text: "text-lg", gap: "gap-2" },
    md: { icon: "w-9 h-9", text: "text-xl", gap: "gap-2.5" },
    lg: { icon: "w-11 h-11", text: "text-2xl", gap: "gap-3" },
  };

  const colors = {
    default: {
      primary: "#C75B39",
      secondary: "#5C6B4A",
      text: "text-[#1A1714]",
      accent: "text-[#C75B39]",
    },
    light: {
      primary: "#E8A090",
      secondary: "#8A9A76",
      text: "text-[#FAF7F2]",
      accent: "text-[#E8A090]",
    },
  };

  return (
    <Link href="/">
      <div 
        data-logo-container
        className={`flex items-center ${sizes[size].gap} cursor-pointer group select-none ${className || ''}`}
        style={{
          // Disable all touch interactions that could cause rotation/dragging
          touchAction: "manipulation",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
          // @ts-ignore - WebkitUserDrag is a valid CSS property
          WebkitUserDrag: "none",
        }}
        onDragStart={(e) => e.preventDefault()}
        onTouchStart={(e) => {
          // Prevent any multi-touch gestures that could cause rotation
          if (e.touches.length > 1) {
            e.preventDefault();
          }
        }}
        onGestureStart={(e: any) => e.preventDefault()}
        onGestureChange={(e: any) => e.preventDefault()}
        onGestureEnd={(e: any) => e.preventDefault()}
      >
        {/* Logo Icon - Static, non-interactive */}
        <div 
          className={`${sizes[size].icon} relative`}
          style={{
            // Remove hover rotation effect - keep logo static
            transform: "none",
            transition: "none",
            pointerEvents: "none", // Prevent direct interaction with the icon
          }}
        >
          <svg
            viewBox="0 0 44 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            style={{ 
              pointerEvents: "none",
              // @ts-ignore
              WebkitUserDrag: "none",
            }}
            draggable={false}
          >
            {/* Main shape - Abstract B with terracotta influence */}
            <rect 
              x="2" 
              y="2" 
              width="40" 
              height="40" 
              rx="4" 
              fill={colors[variant].primary}
            />
            
            {/* Letter B - Elegant serif style */}
            <path
              d="M14 11h7c4 0 7 2.5 7 6 0 2.2-1.2 4-3 5.2 2.2 1 4 3.2 4 6.3 0 4-3 6.5-7 6.5H14V11zm7 9c2.2 0 4-1.3 4-3.5S23.2 13 21 13h-4v7h4zm1 10c2.2 0 4-1.3 4-3.5s-1.8-3.5-4-3.5h-5v7h5z"
              fill={variant === "default" ? "#FAF7F2" : "#1A1714"}
            />
            
            {/* Accent element - Olive dot (static, no animation) */}
            <circle 
              cx="36" 
              cy="8" 
              r="5" 
              fill={colors[variant].secondary}
            />
          </svg>
        </div>

        {/* Logo Text - Serif + Sans combination */}
        {showText && (
          <div 
            className={`${sizes[size].text} font-medium tracking-tight`}
            style={{ 
              pointerEvents: "none",
              // @ts-ignore
              WebkitUserDrag: "none",
            }}
          >
            <span className={colors[variant].text} style={{ fontFamily: 'var(--font-serif)' }}>Bénin</span>
            <span className={`${colors[variant].accent} ml-0.5`} style={{ fontFamily: 'var(--font-sans)' }}>Freelance</span>
          </div>
        )}
      </div>
    </Link>
  );
}
