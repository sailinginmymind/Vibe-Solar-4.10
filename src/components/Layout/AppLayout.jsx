// ============================================================
//  components/Layout/AppLayout.jsx
// ============================================================
import React from 'react';
import { useApp } from '../../context/AppContext';
import NavBar from './NavBar';
import LiveView from '../Views/LiveView';
import EnergyView from '../Views/EnergyView';
import GarageView from '../Views/GarageView';

export default function AppLayout() {
  const { state } = useApp();
  const { view } = state;

  return (
    <div className="flex-1 max-w-lg mx-auto w-full px-4 pb-28 pt-4 md:pb-32">
      {/* Header with camper name */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black tracking-[0.2em] text-[#38bdf8] drop-shadow-[0_0_12px_rgba(56,189,248,0.2)]">
          {state.camperName.toUpperCase() || 'IL MIO CAMPER'}
        </h2>
      </div>

      {/* Views */}
      <div className="animate-fade-slide-up">
        {view === 'live' && <LiveView />}
        {view === 'energy' && <EnergyView />}
        {view === 'garage' && <GarageView />}
      </div>

      <NavBar />
    </div>
  );
}