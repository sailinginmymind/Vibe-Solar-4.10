// ============================================================
//  components/Common/TiltControl.jsx
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SolarEngine } from '../../utils/solarEngine';

export default function TiltControl() {
  const { state, setPanelTilt } = useApp();
  const { panelTilt, selectedTime, weatherData } = state;

  const [hintVisible, setHintVisible] = useState(false);
  const [optimumTilt, setOptimumTilt] = useState(0);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (sliderRef.current) {
      const pct = (panelTilt / 90) * 100;
      sliderRef.current.style.setProperty('--fill', `${pct}%`);
    }
  }, [panelTilt]);

  const handleAutoTilt = () => {
    if (!selectedTime || !weatherData?.daily) return;

    const [h, m] = selectedTime.split(':').map(Number);
    const hDec = h + m / 60;

    const sunriseStr = weatherData.daily.sunrise?.[0]?.split('T')[1]?.substring(0, 5) || '--:--';
    const sunsetStr = weatherData.daily.sunset?.[0]?.split('T')[1]?.substring(0, 5) || '--:--';

    const sunH = SolarEngine.timeToDecimal(sunriseStr);
    const setH = SolarEngine.timeToDecimal(sunsetStr);

    if (hDec < sunH || hDec > setH) {
      // Notte
      return;
    }

    const progress = (hDec - sunH) / (setH - sunH);
    const sunAlt = Math.sin(progress * Math.PI) * 65;
    let ideal = Math.max(0, Math.min(90, 90 - sunAlt));
    ideal = Math.round(ideal / 5) * 5;

    setOptimumTilt(ideal);
    setHintVisible(true);
    setPanelTilt(ideal);

    setTimeout(() => {
      setHintVisible(false);
    }, 3000);
  };

  const handleReset = () => {
    setPanelTilt(0);
    setHintVisible(false);
    if (sliderRef.current) {
      sliderRef.current.style.setProperty('--fill', '0%');
    }
  };

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-white/30">
            Ottimizzazione Inclinazione
          </div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-white/20">
            Angolo pannelli
          </div>
        </div>
        <div className="text-3xl font-black text-[#38bdf8] drop-shadow-[0_0_16px_rgba(56,189,248,0.2)]">
          {panelTilt}°
        </div>
      </div>

      <input
        ref={sliderRef}
        type="range"
        min="0"
        max="90"
        step="5"
        value={panelTilt}
        onChange={(e) => setPanelTilt(parseFloat(e.target.value))}
        className="w-full"
      />

      <div className="flex justify-between text-[9px] font-bold text-white/30 mt-0.5">
        <span>Piano (0°)</span>
        <span>Verticale (90°)</span>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleAutoTilt}
          className="flex-2 glass-accent rounded-xl py-2.5 text-sm font-bold text-[#38bdf8] hover:bg-[#38bdf8]/20 transition-colors"
        >
          AUTO ✨
        </button>
        <button
          onClick={handleReset}
          className="flex-1 glass rounded-xl py-2.5 text-sm font-bold text-white/50 hover:bg-white/5 transition-colors"
        >
          0° 📐
        </button>
      </div>

      {hintVisible && (
        <div className="mt-3 p-2.5 glass-gold rounded-lg text-center text-xs font-bold text-[#fbbf24] border border-[#fbbf24]/20 animate-fade-slide-up">
          Angolo ottimale suggerito: {optimumTilt}°
        </div>
      )}
    </div>
  );
}