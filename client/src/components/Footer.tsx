import { Link, useLocation } from "wouter";
import Logo from "@/components/Logo";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  ArrowUpRight,
  ChevronUp
} from "lucide-react";
import { useCallback } from "react";

const footerLinks = {
  platform: {
    title: "Plateforme",
    links: [
      { label: "Comment ça marche", href: "/how-it-works" },
      { label: "Trouver un freelance", href: "/services" },
      { label: "Parcourir les projets", href: "/projects" },
      { label: "Devenir freelance", href: "/become-seller" },
    ],
  },
  categories: {
    title: "Catégories",
    links: [
      { label: "Développement web", href: "/services?category=developpement-it" },
      { label: "Design graphique", href: "/services?category=design-creatif" },
      { label: "Marketing digital", href: "/services?category=marketing-digital" },
      { label: "Rédaction", href: "/services?category=redaction-traduction" },
    ],
  },
  support: {
    title: "Support",
    links: [
      { label: "Centre d'aide", href: "/help" },
      { label: "FAQ", href: "/faq" },
      { label: "Nous contacter", href: "/contact" },
    ],
  },
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/beninfreelance", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com/beninfreelance", label: "Twitter" },
  { icon: Linkedin, href: "https://linkedin.com/company/beninfreelance", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com/beninfreelance", label: "Instagram" },
];

// Custom Link component that scrolls to top on click
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // Navigate first, then scroll to top
    setLocation(href);
    
    // Use requestAnimationFrame to ensure DOM is updated before scrolling
    requestAnimationFrame(() => {
      window.scrollTo({ 
        top: 0, 
        left: 0,
        behavior: "auto" // Use auto instead of instant for better compatibility
      });
    });
  }, [href, setLocation]);

  return (
    <a 
      href={href} 
      onClick={handleClick}
      className="text-[#9A948D] hover:text-[#E8A090] transition-colors cursor-pointer block"
    >
      {children}
    </a>
  );
}

export default function Footer() {
  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#1A1714] text-[#FAF7F2]">
      <div className="container">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <Logo variant="light" size="md" />
              <p className="text-[#9A948D] mt-6 mb-8 text-base leading-relaxed max-w-sm">
                La plateforme qui connecte les talents béninois aux projets qui comptent. 
                Pas de blabla, juste du concret.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-4">
                <a 
                  href="https://wa.me/22960000000" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[#9A948D] hover:text-[#8A9A76] transition-colors group"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                  <ArrowUpRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </a>
                <a 
                  href="tel:+22960000000"
                  className="flex items-center gap-3 text-[#9A948D] hover:text-[#FAF7F2] transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  +229 60 00 00 00
                </a>
                <a 
                  href="mailto:contact@beninfreelance.com"
                  className="flex items-center gap-3 text-[#9A948D] hover:text-[#FAF7F2] transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  contact@beninfreelance.com
                </a>
                <div className="flex items-center gap-3 text-[#9A948D]">
                  <MapPin className="w-5 h-5" />
                  Cotonou, Bénin
                </div>
              </div>
              
              {/* Social Links */}
              <div className="flex gap-3 mt-8">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-sm bg-[#2A2520] hover:bg-[#C75B39] flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="text-[#FAF7F2] font-semibold mb-6 text-sm uppercase tracking-wider">{footerLinks.platform.title}</h4>
              <ul className="space-y-4">
                {footerLinks.platform.links.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>
                      {link.label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[#FAF7F2] font-semibold mb-6 text-sm uppercase tracking-wider">{footerLinks.categories.title}</h4>
              <ul className="space-y-4">
                {footerLinks.categories.links.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>
                      {link.label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[#FAF7F2] font-semibold mb-6 text-sm uppercase tracking-wider">{footerLinks.support.title}</h4>
              <ul className="space-y-4">
                {footerLinks.support.links.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>
                      {link.label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Methods - Only Mobile Money */}
        <div className="py-8 border-t border-[#2A2520]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 flex-wrap justify-center">
              <span className="text-[#6B6560] text-sm">Moyens de paiement acceptés :</span>
              <div className="flex items-center gap-4">
                {/* MTN Logo */}
                <div className="h-10 w-auto bg-white rounded-md p-1.5 flex items-center justify-center">
                  <img src="/mtn.png" alt="MTN Mobile Money" className="h-7 w-auto object-contain" draggable={false} />
                </div>
                {/* Moov Logo */}
                <div className="h-10 w-auto bg-white rounded-md p-1.5 flex items-center justify-center">
                  <img src="/moov.png" alt="Moov Africa Money" className="h-7 w-auto object-contain" draggable={false} />
                </div>
                {/* Celtiis Logo */}
                <div className="h-10 w-auto bg-white rounded-md p-1.5 flex items-center justify-center">
                  <img src="/celtiis.png" alt="Celtiis" className="h-7 w-auto object-contain" draggable={false} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#6B6560] text-sm">
              <span>Propulsé par</span>
              <span className="text-[#5C6B4A] font-semibold">FedaPay</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-[#2A2520]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#6B6560] text-sm">
              © {new Date().getFullYear()} Bénin Freelance. Fait avec soin à Cotonou.
            </p>
            <div className="flex items-center gap-8">
              <FooterLink href="/terms">
                <span className="text-[#6B6560] hover:text-[#E8A090] text-sm transition-colors">
                  Conditions
                </span>
              </FooterLink>
              <FooterLink href="/privacy">
                <span className="text-[#6B6560] hover:text-[#E8A090] text-sm transition-colors">
                  Confidentialité
                </span>
              </FooterLink>
              <FooterLink href="/cookies">
                <span className="text-[#6B6560] hover:text-[#E8A090] text-sm transition-colors">
                  Cookies
                </span>
              </FooterLink>
              
              {/* Scroll to top button */}
              <button
                onClick={scrollToTop}
                className="w-10 h-10 rounded-sm bg-[#2A2520] hover:bg-[#C75B39] flex items-center justify-center transition-all duration-300 hover:-translate-y-1 ml-4"
                aria-label="Retour en haut"
                title="Retour en haut"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
