// ============================================================
//  components/Common/SOCSlider.jsx
// ============================================================
import React, { useEffect, useRef } from 'react';
import { SolarEngine } from '../../utils/solarEngine';

export default function SOCSlider({
  label,
  value,
  onChange,
  batteryAh,
  currentPower,
  target1 = 80,
  target2 = 90,
  target3 = 100,
  isPs = false,
}) {
  const sliderRef = useRef(null);

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.style.setProperty('--fill', `${value}%`);
    }
  }, [value]);

  const time1 = SolarEngine.estimateChargeTime(value, target1, currentPower, batteryAh);
  const time2 = SolarEngine.estimateChargeTime(value, target2, currentPower, batteryAh);
  const time3 = SolarEngine.estimateChargeTime(value, target3, currentPower, batteryAh);

  const accentColor = isPs ? '#fbbf24' : '#38bdf8';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">
          {label}
        </span>
        <span className="text-2xl font-black" style={{ color: accentColor }}>
          {Math.round(value)}%
        </span>
      </div>

      <input
        ref={sliderRef}
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        style={{ accentColor }}
      />

      <div className="grid grid-cols-3 gap-2 mt-2">
        <div className="glass rounded-lg py-2 text-center">
          <div className="text-[9px] font-bold uppercase text-white/30">A {target1}%</div>
          <div className="text-sm font-bold text-white">{time1}</div>
        </div>
        <div className="glass rounded-lg py-2 text-center">
          <div className="text-[9px] font-bold uppercase text-white/30">A {target2}%</div>
          <div className="text-sm font-bold text-white">{time2}</div>
        </div>
        <div className="glass rounded-lg py-2 text-center">
          <div className="text-[9px] font-bold uppercase text-white/30">A {target3}%</div>
          <div className="text-sm font-bold text-white">{time3}</div>
        </div>
      </div>
    </div>
  );
}