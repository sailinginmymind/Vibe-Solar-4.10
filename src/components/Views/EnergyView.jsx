// ============================================================
//  components/Views/EnergyView.jsx
// ============================================================
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SolarEngine } from '../../utils/solarEngine';
import HourlyChart from '../Charts/HourlyChart';
import SOCSlider from '../Common/SOCSlider';
import TiltControl from '../Common/TiltControl';

export default function EnergyView() {
  const { state } = useApp();
  const {
    weatherData,
    selectedDate,
    selectedTime,
    panelWp,
    panelPsWp,
    panelTilt,
    battAh,
    psWh,
    currentSOC,
    currentPsSOC,
  } = state;

  const [dailyTotal, setDailyTotal] = useState(0);
  const [hourlyData, setHourlyData] = useState([]);
  const [sunrise, setSunrise] = useState('--:--');
  const [sunset, setSunset] = useState('--:--');

  const detailTimer = useRef(null);
  const [detailText, setDetailText] = useState('Tocca una barra per i dettagli');

  // Compute hourly data from weather
  useEffect(() => {
    if (!weatherData?.hourly || !weatherData?.daily) return;

    const hourly = weatherData.hourly;
    const daily = weatherData.daily;

    const sunR = daily.sunrise?.[0]?.split('T')[1]?.substring(0, 5) || '--:--';
    const sunS = daily.sunset?.[0]?.split('T')[1]?.substring(0, 5) || '--:--';
    setSunrise(sunR);
    setSunset(sunS);

    const sunH = SolarEngine.timeToDecimal(sunR);
    const setH = SolarEngine.timeToDecimal(sunS);
    const totalWp = panelWp + panelPsWp;

    const data = [];
    let total = 0;

    for (let h = Math.floor(sunH); h <= Math.ceil(setH); h++) {
      if (h > 23) break;
      let rad = hourly.shortwave_radiation?.[h] || 0;
      let alt = 0;
      if (h >= sunH && h <= setH) {
        const progress = (h - sunH) / (setH - sunH);
        alt = Math.sin(progress * Math.PI) * 65;
      }
      const power = SolarEngine.calculatePowerByRadiation(
        h, sunH, setH, totalWp, rad, panelTilt, alt
      );
      const finalPower = power < 0.1 ? 0 : power;
      data.push({ hour: h, power: finalPower, radiation: rad });
      total += finalPower;
    }

    setHourlyData(data);
    setDailyTotal(total);
  }, [weatherData, panelWp, panelPsWp, panelTilt]);

  const handleBarDetail = (hour, power, radiation) => {
    if (detailTimer.current) clearTimeout(detailTimer.current);
    setDetailText(
      `ORE ${hour}:00 • ${Math.round(power)} W  |  Radiazione: ${Math.round(radiation)} W/m²`
    );
    detailTimer.current = setTimeout(() => {
      setDetailText('Tocca una barra per i dettagli');
      detailTimer.current = null;
    }, 4000);
  };

  // Generate day buttons
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, []);

  return (
    <div className="space-y-5">
      {/* Chart Section */}
      <div className="glass rounded-2xl p-5">
        <div className="text-center text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
          {detailText}
        </div>

        <h3 className="text-center text-sm font-bold uppercase tracking-wider text-[#38bdf8] mb-2">
          Previsione Oraria
        </h3>

        <HourlyChart data={hourlyData} onBarClick={handleBarDetail} />

        <div className="flex items-center justify-between mt-4 glass-strong rounded-xl px-5 py-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Produzione</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Totale</span>
          </div>
          <div className="text-3xl font-black text-[#fbbf24] drop-shadow-[0_0_20px_rgba(251,191,36,0.2)]">
            {Math.round(dailyTotal)} Wh
          </div>
        </div>

        {/* Day selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1">
          {days.map((d, idx) => {
            const isActive = d.toDateString() === selectedDate.toDateString();
            const dayName = d.toLocaleDateString('it-IT', { weekday: 'short' }).charAt(0).toUpperCase();
            return (
              <button
                key={idx}
                onClick={() => {
                  // Reset weather to force refetch
                  // This will be handled by the parent via state change
                }}
                className={`flex-shrink-0 min-w-[56px] px-3 py-2 rounded-xl text-center transition-all ${
                  isActive
                    ? 'glass-accent border-[#38bdf8]/30'
                    : 'glass hover:bg-white/5'
                }`}
              >
                <div className="text-[10px] font-bold uppercase text-white/50">{dayName}</div>
                <div className="text-lg font-black text-white">{d.getDate()}</div>
              </button>
            );
          })}
        </div>
        <div className="scroll-hint">← trascina →</div>
      </div>

      {/* Tilt Control */}
      <TiltControl />

      {/* SOC Sliders */}
      <div className="glass rounded-2xl p-5">
        <h3 className="text-center text-sm font-bold uppercase tracking-wider text-[#38bdf8] mb-4">
          Stato Carica
        </h3>

        <SOCSlider
          label="Batt. Servizio"
          value={currentSOC}
          onChange={(val) => {}}
          batteryAh={battAh}
          currentPower={0} // Will be computed from live view
          target1={80}
          target2={90}
          target3={100}
        />

        <div className="h-4" />

        <SOCSlider
          label="Power Station"
          value={currentPsSOC}
          onChange={(val) => {}}
          batteryAh={psWh / 12.8}
          currentPower={0}
          target1={80}
          target2={90}
          target3={100}
          isPs
        />
      </div>
    </div>
  );
}