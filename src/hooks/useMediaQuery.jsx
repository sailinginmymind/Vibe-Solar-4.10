// ============================================================
//  hooks/useMediaQuery.js — Responsive breakpoints
// ============================================================
import { useEffect, useState } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

// --- Breakpoint hooks ---
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
export const useIsTabletOrDesktop = () => useMediaQuery('(min-width: 768px)');

// --- Alias per retrocompatibilità ---
export const useIsLargeScreen = useIsDesktop;