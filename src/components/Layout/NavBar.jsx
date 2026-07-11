// ============================================================
//  components/Layout/NavBar.jsx
// ============================================================
import React from 'react';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { key: 'live', icon: '🛰️', label: 'Dashboard' },
  { key: 'energy', icon: '📊', label: 'Report' },
  { key: 'garage', icon: '🚐', label: 'Garage' },
];

export default function NavBar() {
  const { state, setView } = useApp();
  const { view } = state;

  return (
    <nav className="navbar-glass fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-[72px] md:h-[68px] px-2">
      {NAV_ITEMS.map((item) => {
        const isActive = view === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${
              isActive
                ? 'text-[#38bdf8] scale-105'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <span className="text-2xl md:text-3xl">{item.icon}</span>
            <span className="text-[9px] uppercase tracking-[1.5px] font-medium">
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