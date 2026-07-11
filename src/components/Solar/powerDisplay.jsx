// ============================================================
//  components/Solar/PowerDisplay.jsx
// ============================================================
import React from 'react';

export default function PowerDisplay({ total, services, ps }) {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      {/* Left: Services */}
      <div className="flex-1 text-center">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#fbbf24]">Fisso</div>
        <div className="text-2xl font-extrabold text-[#fbbf24]">{Math.round(services)} W</div>
      </div>

      {/* Center: Total */}
      <div className="flex flex-col items-center px-2">
        <div className="text-4xl font-black text-[#38bdf8] drop-shadow-[0_0_20px_rgba(56,189,248,0.3)]">
          {Math.round(total)}
        </div>
        <div className="text-[9px] font-bold uppercase tracking-[2px] text-white/30">Totale W</div>
      </div>

      {/* Right: Power Station */}
      <div className="flex-1 text-center">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[#fbbf24]">Power Station</div>
        <div className="text-2xl font-extrabold text-[#fbbf24]">{Math.round(ps)} W</div>
      </div>
    </div>
  );
}