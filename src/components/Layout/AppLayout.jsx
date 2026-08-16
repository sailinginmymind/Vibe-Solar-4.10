// ============================================================
//  components/Layout/AppLayout.jsx — con sidebar desktop
// ============================================================
import React from 'react';
import { useApp } from '../../context/AppContext';
import { useIsMobile } from '../../hooks/useMediaQuery';
import Sidebar from './Sidebar';
import NavBar from './NavBar';
import LiveView from '../Views/LiveView';
import EnergyView from '../Views/EnergyView';
import GarageView from '../Views/GarageView';

export default function AppLayout() {
  const { state } = useApp();
  const { view, camperName } = state;
  const isMobile = useIsMobile();

  // Padding per la sidebar desktop (220px)
  const sidebarPadding = !isMobile ? 'pl-[220px]' : '';

  return (
    <div className={`min-h-screen w-full ${sidebarPadding}`}>
      {/* Sidebar (solo desktop/tablet) */}
      <Sidebar />

      {/* Contenuto principale */}
      <div className="max-w-6xl mx-auto px-4 py-4 md:px-6 md:py-6 pb-36 md:pb-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h2
            className={`
              font-black tracking-[0.2em] text-[#38bdf8]
              drop-shadow-[0_0_12px_rgba(56,189,248,0.2)]
              ${isMobile ? 'text-xl' : 'text-3xl'}
            `}
          >
            {camperName.toUpperCase() || 'IL MIO CAMPER'}
          </h2>
          {!isMobile && (
            <p className="text-sm text-white/30 mt-1 font-light tracking-wider">
              ☀️ Energia solare per il tuo viaggio
            </p>
          )}
        </div>

        {/* Views */}
        <div className="animate-fade-slide-up">
          {view === 'live' && <LiveView />}
          {view === 'energy' && <EnergyView />}
          {view === 'garage' && <GarageView />}
        </div>
      </div>

      {/* Navbar mobile */}
      <NavBar />
    </div>
  );
}