// ============================================================
//  components/Views/GarageView.jsx — Vibe Solar v3.2
//  Mobile-first · Glass-morphism · Inline editing
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function GarageView() {
  const {
    state,
    setCamperName,
    setBattAh,
    setPsWh,
    setPanelWp,
    setPanelPsWp,
    salvaConfigurazioneSuCloud,
    sincronizzaDatiGarage,
    logout,
  } = useApp();

  const {
    user,
    camperName,
    battAh,
    psWh,
    panelWp,
    panelPsWp,
  } = state;

  // --- State per editing inline ---
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // 'idle' | 'syncing' | 'success' | 'error'
  const [nameInput, setNameInput] = useState(camperName || '');
  const inputRef = useRef(null);

  // Focus input quando si attiva l'editing
  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingField]);

  // --- Handlers ---
  const handleSaveName = async () => {
    const trimmed = nameInput.trim().toUpperCase();
    if (!trimmed) return;
    setCamperName(trimmed);
    await handleCloudSave();
  };

  const handleCloudSave = async () => {
    setIsSaving(true);
    setSyncStatus('syncing');
    try {
      const success = await salvaConfigurazioneSuCloud();
      setSyncStatus(success ? 'success' : 'error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (field, currentValue) => {
    setEditingField(field);
    setEditValue(String(currentValue));
  };

  const saveEdit = (field) => {
    const num = parseFloat(editValue);
    if (isNaN(num) || num < 0) return;

    switch (field) {
      case 'batt': setBattAh(num); break;
      case 'ps': setPsWh(num); break;
      case 'pan': setPanelWp(num); break;
      case 'panPs': setPanelPsWp(num); break;
      default: break;
    }
    setEditingField(null);
    // Salvataggio automatico in cloud dopo modifica
    setTimeout(() => handleCloudSave(), 300);
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') saveEdit(field);
    if (e.key === 'Escape') setEditingField(null);
  };

  const handleLogout = () => {
    if (confirm('Vuoi uscire dal Garage di Vibe Solar?')) {
      logout();
    }
  };

  // --- Sync status indicator ---
  const SyncIndicator = () => {
    if (syncStatus === 'idle' || !syncStatus) return null;
    const config = {
      syncing: { icon: '🔄', label: 'Salvataggio...', color: 'text-[#38bdf8]' },
      success: { icon: '✅', label: 'Salvato!', color: 'text-[#10b981]' },
      error: { icon: '❌', label: 'Errore', color: 'text-[#f43f5e]' },
    };
    const { icon, label, color } = config[syncStatus];
    return (
      <div className={`flex items-center gap-2 text-xs font-bold ${color} animate-fade-slide-up`}>
        <span>{icon}</span>
        <span>{label}</span>
      </div>
    );
  };

  // --- Editable field component ---
  const EditableField = ({ field, label, value, unit, subValue, subUnit, color, onEdit }) => {
    const isEditing = editingField === field;

    return (
      <div
        className="glass rounded-2xl p-4 text-center transition-all duration-200 hover:bg-white/10 hover:scale-[1.02] cursor-pointer border border-white/5 hover:border-white/20 group"
        onClick={() => !isEditing && startEdit(field, value)}
      >
        {/* Label */}
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
          {label}
        </div>

        {/* Value - Editing or Display */}
        {isEditing ? (
          <div className="flex items-center justify-center gap-2">
            <input
              ref={inputRef}
              type="number"
              step="1"
              min="0"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, field)}
              onBlur={() => saveEdit(field)}
              className="w-24 bg-[#0b1121]/80 border border-[#38bdf8]/40 rounded-lg px-3 py-1.5 text-white text-center text-lg font-black outline-none focus:border-[#38bdf8]"
              autoFocus
            />
            <span className="text-sm font-bold text-white/50">{unit}</span>
          </div>
        ) : (
          <div className="text-2xl font-black text-white">
            {value} <span className="text-sm font-bold text-white/40">{unit}</span>
          </div>
        )}

        {/* Sub value (conversion) */}
        {subValue !== undefined && !isEditing && (
          <div className="text-[11px] font-bold mt-1" style={{ color }}>
            {subValue} {subUnit}
          </div>
        )}

        {/* Edit hint */}
        {!isEditing && (
          <div className="text-[8px] font-bold uppercase tracking-wider text-white/20 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            ✎ Tocca per modificare
          </div>
        )}
      </div>
    );
  };

  // --- Hardware Section Component ---
  const HardwareSection = ({ title, icon, color, children }) => (
    <div
      className="glass rounded-2xl p-5 transition-all duration-300"
      style={{ borderColor: `${color}20` }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xl">{icon}</span>
        <h4 className="text-[11px] font-black uppercase tracking-[2px] text-white/40">
          {title}
        </h4>
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-2">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 pb-4 max-w-3xl mx-auto">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-wider text-white">
            <span className="text-[#38bdf8] drop-shadow-[0_0_20px_rgba(56,189,248,0.2)]">Garage</span>
            <span className="text-white/30 text-base font-normal ml-2">⚡</span>
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-white/20 mt-0.5">
            Configura il tuo impianto solare
          </p>
        </div>
        <SyncIndicator />
      </div>

      {/* --- PROFILO UTENTE --- */}
      <div className="glass-strong rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/5">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#38bdf8] to-[#1d4ed8] flex items-center justify-center text-[#0b1121] font-black text-2xl shadow-lg shadow-[#38bdf8]/20">
              {user?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#10b981] border-2 border-[#0b1121] animate-pulse" />
          </div>
          <div>
            <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/30">Proprietario</div>
            <div className="text-lg font-bold text-white">{user || 'Camperista'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleCloudSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all border border-white/5 disabled:opacity-50 flex items-center gap-2"
          >
            <span>☁️</span>
            <span className="hidden sm:inline">Sincronizza</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#f43f5e]/10 text-[#f43f5e] hover:bg-[#f43f5e]/20 transition-all border border-[#f43f5e]/20 flex items-center gap-2"
          >
            <span>🚪</span>
            <span className="hidden sm:inline">Esci</span>
          </button>
        </div>
      </div>

      {/* --- NOME CAMPER --- */}
      <div className="glass rounded-2xl p-5 border border-white/5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <label className="text-[9px] font-bold uppercase tracking-[2px] text-white/30 block mb-1">
              Nome del tuo Camper
            </label>
            <input
              type="text"
              placeholder="ES: VIBE VAN"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value.toUpperCase())}
              className="w-full glass rounded-xl px-4 py-3 text-white text-base font-black uppercase placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/40 transition-all"
              maxLength={20}
            />
          </div>
          <button
            onClick={handleSaveName}
            disabled={isSaving || !nameInput.trim()}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-[#38bdf8] to-[#1d4ed8] text-[#0b1121] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#38bdf8]/20 flex items-center justify-center gap-2 min-w-[100px]"
          >
            {isSaving ? '⏳' : '💾 Salva'}
          </button>
        </div>
        <div className="mt-2 text-[9px] text-white/20 text-center tracking-wider">
          {camperName ? `📍 ${camperName}` : 'Inserisci un nome per il tuo camper'}
        </div>
      </div>

      {/* --- CONFIGURAZIONE HARDWARE --- */}
      <div className="grid grid-cols-1 gap-4">
        {/* Impianto Fisso Camper */}
        <HardwareSection title="Impianto Fisso Camper" icon="🚐" color="#38bdf8">
          <EditableField
            field="batt"
            label="🔋 Batteria Servizi"
            value={battAh}
            unit="Ah"
            subValue={Math.round(battAh * 12.8)}
            subUnit="Wh"
            color="#38bdf8"
          />
          <EditableField
            field="pan"
            label="☀️ Pannelli Fissi"
            value={panelWp}
            unit="W"
            color="#38bdf8"
          />
        </HardwareSection>

        {/* Unità Portatile */}
        <HardwareSection title="Unità Portatile / PS" icon="🔌" color="#fbbf24">
          <EditableField
            field="ps"
            label="🔌 Power Station"
            value={psWh}
            unit="Wh"
            subValue={Math.round(psWh / 12.8)}
            subUnit="Ah"
            color="#fbbf24"
          />
          <EditableField
            field="panPs"
            label="☀️ Pannelli PS"
            value={panelPsWp}
            unit="W"
            color="#fbbf24"
          />
        </HardwareSection>
      </div>

      {/* --- RIEPILOGO TOTALE --- */}
      <div className="glass-strong rounded-2xl p-5 border border-white/5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-[8px] font-bold uppercase tracking-[1px] text-white/30">Totale Pannelli</div>
            <div className="text-xl font-black text-white">{panelWp + panelPsWp} <span className="text-xs text-white/30">W</span></div>
          </div>
          <div>
            <div className="text-[8px] font-bold uppercase tracking-[1px] text-white/30">Capacità Batterie</div>
            <div className="text-xl font-black text-white">{battAh + Math.round(psWh / 12.8)} <span className="text-xs text-white/30">Ah</span></div>
          </div>
          <div>
            <div className="text-[8px] font-bold uppercase tracking-[1px] text-white/30">Energia Totale</div>
            <div className="text-xl font-black text-white">{Math.round(battAh * 12.8 + psWh)} <span className="text-xs text-white/30">Wh</span></div>
          </div>
          <div>
            <div className="text-[8px] font-bold uppercase tracking-[1px] text-white/30">Stato</div>
            <div className="text-xl font-black text-[#10b981]">● <span className="text-xs text-white/30">Online</span></div>
          </div>
        </div>
      </div>

      {/* --- TASTO SALVATAGGIO GLOBALE --- */}
      <button
        onClick={handleCloudSave}
        disabled={isSaving}
        className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#38bdf8]/10 to-[#1d4ed8]/10 text-white/60 hover:text-white hover:from-[#38bdf8]/20 hover:to-[#1d4ed8]/20 transition-all border border-white/5 disabled:opacity-50 flex items-center justify-center gap-3"
      >
        <span>☁️</span>
        {isSaving ? 'Salvataggio in corso...' : 'Sincronizza tutto con il Cloud'}
        <span className="text-[10px] text-white/20">↗</span>
      </button>

      {/* --- FOOTER --- */}
      <div className="text-center text-[8px] font-bold uppercase tracking-[2px] text-white/10 pt-2">
        Vibe Solar v3.2 · I tuoi dati sono al sicuro nel cloud
      </div>
    </div>
  );
}