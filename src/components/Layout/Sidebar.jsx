// ============================================================
//  components/Layout/Sidebar.jsx — Desktop/Tablet
//  Sidebar completa con icone e testo
// ============================================================
import React from 'react';
import { useApp } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useMediaQuery';

const NAV_ITEMS = [
  { key: 'live', icon: '🛰️', label: 'Dashboard' },
  { key: 'energy', icon: '📊', label: 'Report' },
  { key: 'garage', icon: '🚐', label: 'Garage' },
];

export default function Sidebar() {
  const { state, setView, logout } = useApp();
  const { view, user } = state;
  const isMobile = useIsMobile();

  // Su mobile non mostriamo la sidebar
  if (isMobile) return null;

  return (
    <aside className="fixed top-0 left-0 z-50 h-full w-[220px] bg-[#0b1121]/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-300">
      
      {/* Logo / Intestazione */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5 flex-shrink-0">
        <span className="text-2xl">🚐</span>
        <div>
          <span className="text-sm font-black tracking-tight text-white">Vibe Solar</span>
          <span className="block text-[9px] font-medium text-white/30 tracking-wider">v4.0</span>
        </div>
      </div>

      {/* Voci di navigazione */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 text-sm font-medium
                ${isActive
                  ? 'bg-[#38bdf8]/10 text-[#38bdf8] shadow-[0_0_20px_rgba(56,189,248,0.05)]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <span className="text-xl leading-none flex-shrink-0">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && (
                <span className="w-1 h-6 rounded-full bg-[#38bdf8] shadow-[0_0_12px_rgba(56,189,248,0.4)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Spazio per future funzionalità (separatore) */}
      <div className="px-3 py-2 border-t border-white/5">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 px-3 py-1">
          Presto disponibile
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/20 text-sm cursor-default">
            <span className="text-xl leading-none flex-shrink-0">⚙️</span>
            <span>Impostazioni</span>
            <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded ml-auto">soon</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/20 text-sm cursor-default">
            <span className="text-xl leading-none flex-shrink-0">📈</span>
            <span>Statistiche</span>
            <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded ml-auto">soon</span>
          </div>
        </div>
      </div>

      {/* Footer: utente e logout */}
      <div className="px-3 py-3 border-t border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#38bdf8] to-[#1d4ed8] flex items-center justify-center text-[#0b1121] font-black text-sm flex-shrink-0">
            {user?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate">{user || 'Camperista'}</div>
            <div className="text-[10px] text-white/30">Proprietario</div>
          </div>
          <button
            onClick={() => {
              if (confirm('Vuoi uscire da Vibe Solar?')) {
                logout();
              }
            }}
            className="text-white/30 hover:text-[#f43f5e] transition-colors text-lg"
            title="Esci"
          >
            🚪
          </button>
        </div>
      </div>
    </aside>
  );
}