// ============================================================
//  components/Layout/ResponsiveContainer.jsx
//  Layout adattivo con griglia desktop
// ============================================================
import React from 'react';
import { useIsMobile, useIsDesktop } from '../../hooks/useMediaQuery';

export default function ResponsiveContainer({ children, className = '' }) {
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();

  return (
    <div
      className={`
        w-full mx-auto transition-all duration-300
        ${isMobile ? 'px-3 py-2 max-w-full' : ''}
        ${!isMobile && !isDesktop ? 'px-4 py-3 max-w-2xl' : ''}
        ${isDesktop ? 'px-6 py-4 max-w-5xl' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}