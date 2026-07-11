// ============================================================
//  components/Solar/SunAnimation.jsx
// ============================================================
import React, { useEffect, useRef } from 'react';
import { SolarEngine } from '../../utils/solarEngine';
import { useApp } from '../../context/AppContext';

export default function SunAnimation({
  time,
  sunrise,
  sunset,
  cloudCover,
  radiation,
  showRadiation,
}) {
  const { state, setShowRadiation } = useApp();
  const sunRef = useRef(null);
  const skyRef = useRef(null);
  const starsRef = useRef(null);

  // Compute sun position
  const getSunState = () => {
    if (!time || sunrise === '--:--' || sunset === '--:--') {
      return { visible: false, left: 50, bottom: 20, isNight: true };
    }

    const [h, m] = time.split(':').map(Number);
    const hDec = h + m / 60;
    const sunH = SolarEngine.timeToDecimal(sunrise);
    const setH = SolarEngine.timeToDecimal(sunset);

    if (hDec < sunH || hDec > setH) {
      return { visible: false, left: 50, bottom: 20, isNight: true };
    }

    const progress = (hDec - sunH) / (setH - sunH);
    const left = 15 + progress * 70;
    const bottom = Math.sin(progress * Math.PI) * 35 + 10;
    return { visible: true, left, bottom, isNight: false, progress };
  };

  const sunState = getSunState();

  useEffect(() => {
    if (sunRef.current) {
      sunRef.current.style.left = `${sunState.left}%`;
      sunRef.current.style.bottom = `${sunState.bottom}%`;
      sunRef.current.style.display = sunState.visible ? 'block' : 'none';
    }

    if (skyRef.current) {
      if (sunState.isNight) {
        skyRef.current.style.background =
          'linear-gradient(to bottom, #0b1121, #1a2744)';
      } else if (sunState.progress < 0.2 || sunState.progress > 0.8) {
        skyRef.current.style.background =
          'linear-gradient(to bottom, #f59e0b, #7c2d12)';
      } else {
        skyRef.current.style.background =
          'linear-gradient(to bottom, #38bdf8, #1d4ed8)';
      }
    }

    if (starsRef.current) {
      starsRef.current.style.opacity = sunState.isNight ? '1' : '0';
    }
  }, [sunState]);

  // Generate stars
  useEffect(() => {
    if (starsRef.current) {
      starsRef.current.innerHTML = '';
      for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'absolute rounded-full bg-white animate-twinkle';
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 70}%`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        starsRef.current.appendChild(star);
      }
    }
  }, []);

  const handleCoreClick = () => {
    setShowRadiation(!showRadiation);
  };

  const displayValue = showRadiation
    ? `${Math.round(radiation)} W/m²`
    : `${cloudCover}%`;
  const displayLabel = showRadiation ? 'RADIAZIONE' : 'NUBI';

  return (
    <div
      ref={skyRef}
      className="relative w-full h-[240px] rounded-2xl overflow-hidden transition-colors duration-1000"
      style={{ background: '#1a2744' }}
    >
      {/* Stars */}
      <div ref={starsRef} className="absolute inset-0 transition-opacity duration-1000" />

      {/* Sun */}
      <div
        ref={sunRef}
        className="absolute w-[120px] h-[120px] rounded-full bg-gradient-radial from-[#fbbf24] via-[#f59e0b] to-[#ea580c] shadow-[0_0_60px_rgba(251,191,36,0.5)] transition-all duration-1000 -translate-x-1/2 -translate-y-1/2"
        style={{ display: 'none' }}
      />

      {/* Horizon mask */}
      <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-[#0b1121] border-t-2 border-[#fbbf24]/50 z-10" />

      {/* Horizon data */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-between px-8 z-20">
        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8]">Alba</div>
          <div className="text-xl font-black text-white drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]">
            {sunrise}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#38bdf8]">Tramonto</div>
          <div className="text-xl font-black text-white drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]">
            {sunset}
          </div>
        </div>
      </div>

      {/* Core display (time + cloud/radiation) */}
      <div
        onClick={handleCoreClick}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-[120px] h-[120px] rounded-full bg-[#0b1121]/90 border-2 border-white/10 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer hover:border-[#38bdf8]/30 transition-colors"
      >
        <div className="text-2xl font-black text-[#fbbf24]">{time || '--:--'}</div>
        <div className="text-xl font-black text-[#38bdf8]">{displayValue}</div>
        <div className="text-[9px] font-bold uppercase tracking-wider text-white/40">
          {displayLabel}
        </div>
      </div>
    </div>
  );
}