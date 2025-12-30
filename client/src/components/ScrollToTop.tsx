import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * ScrollToTop Component
 * Automatically scrolls to the top of the page when the route changes.
 * This fixes the issue where clicking links at the bottom of the page
 * doesn't scroll the view to the top.
 */
export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top with smooth behavior
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" // Use instant for immediate scroll on navigation
    });
  }, [location]);

  return null;
}
