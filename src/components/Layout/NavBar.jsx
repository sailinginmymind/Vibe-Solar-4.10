// ============================================================
//  components/Layout/NavBar.jsx — solo mobile (navbar in basso)
// ============================================================
import React from 'react';
import { useApp } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useMediaQuery';

const NAV_ITEMS = [
  { key: 'live', icon: '🛰️', label: 'Dashboard' },
  { key: 'energy', icon: '📊', label: 'Report' },
  { key: 'garage', icon: '🚐', label: 'Garage' },
];

export default function NavBar() {
  const { state, setView } = useApp();
  const { view } = state;
  const isMobile = useIsMobile();

  // Solo mobile
  if (!isMobile) return null;

  return (
    <nav className="navbar-glass fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-[64px] px-2 safe-bottom">
      {NAV_ITEMS.map((item) => {
        const isActive = view === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            className={`flex flex-col items-center gap-0.5 transition-all duration-300 touch-manipulation ${
              isActive
                ? 'text-[#38bdf8] scale-105'
                : 'text-white/40 hover:text-white/70'
            }`}
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <span className="text-2xl leading-none">{item.icon}</span>
            <span className="text-[8px] uppercase tracking-[1.2px] font-medium leading-none">
              {item.label}
            </span>
            {isActive && (
              <span className="absolute bottom-1 w-6 h-0.5 bg-[#38bdf8] rounded-full shadow-[0_0_12px_rgba(56,189,248,0.5)]" />
            )}
          </button>
        );
      })}
    </nav>
  );
}