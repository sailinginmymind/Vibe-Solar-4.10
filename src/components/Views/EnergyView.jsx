// ============================================================
//  components/Views/EnergyView.jsx
//  Versione con dati di esempio espliciti e log
// ============================================================
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SolarEngine } from '../../utils/solarEngine';
import HourlyChart from '../Charts/HourlyChart';
import SOCSlider from '../Common/SOCSlider';
import TiltControl from '../Common/TiltControl';

// --- Dati di esempio espliciti (valori alti per visibilità) ---
const MOCK_HOURLY = [
  { hour: 6, power: 30, radiation: 120 },
  { hour: 7, power: 80, radiation: 320 },
  { hour: 8, power: 140, radiation: 560 },
  { hour: 9, power: 210, radiation: 840 },
  { hour: 10, power: 270, radiation: 1080 },
  { hour: 11, power: 320, radiation: 1280 },
  { hour: 12, power: 350, radiation: 1400 },
  { hour: 13, power: 340, radiation: 1360 },
  { hour: 14, power: 310, radiation: 1240 },
  { hour: 15, power: 260, radiation: 1040 },
  { hour: 16, power: 200, radiation: 800 },
  { hour: 17, power: 140, radiation: 560 },
  { hour: 18, power: 80, radiation: 320 },
  { hour: 19, power: 40, radiation: 160 },
  { hour: 20, power: 15, radiation: 60 },
];
const MOCK_TOTAL = MOCK_HOURLY.reduce((sum, h) => sum + h.power, 0);

export default function EnergyView() {
  const { state, setSelectedDate } = useApp();  // <--- aggiunto setSelectedDate
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
    isLoading,
  } = state;

  const [dailyTotal, setDailyTotal] = useState(MOCK_TOTAL);
  const [hourlyData, setHourlyData] = useState(MOCK_HOURLY);
  const [sunrise, setSunrise] = useState('06:30');
  const [sunset, setSunset] = useState('20:30');

  const detailTimer = useRef(null);
  const [detailText, setDetailText] = useState('Tocca una barra per i dettagli');

  // ----- Calcola dati reali se disponibili, altrimenti usa mock -----
  useEffect(() => {
    console.log('📊 EnergyView - weatherData:', weatherData ? 'presente' : 'null');
    
    if (weatherData?.hourly && weatherData?.daily) {
      console.log('📊 EnergyView - usando dati reali');
      const hourly = weatherData.hourly;
      const daily = weatherData.daily;

      const sunR = daily.sunrise?.[0]?.split('T')[1]?.substring(0, 5) || '06:30';
      const sunS = daily.sunset?.[0]?.split('T')[1]?.substring(0, 5) || '20:30';
      setSunrise(sunR);
      setSunset(sunS);

      const sunH = SolarEngine.timeToDecimal(sunR);
      const setH = SolarEngine.timeToDecimal(sunS);
      const totalWp = panelWp + panelPsWp;

      const data = [];
      let total = 0;  // <--- FIX: cambiato da const a let

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

      console.log('📊 EnergyView - dati reali calcolati, total:', total);
      
      // Se total > 0, usa dati reali, altrimenti mock
      if (total > 0) {
        setHourlyData(data);
        setDailyTotal(total);
      } else {
        console.log('📊 EnergyView - total=0, uso mock');
        setHourlyData(MOCK_HOURLY);
        setDailyTotal(MOCK_TOTAL);
      }
    } else {
      console.log('📊 EnergyView - nessun weatherData, uso mock');
      setHourlyData(MOCK_HOURLY);
      setDailyTotal(MOCK_TOTAL);
      setSunrise('06:30');
      setSunset('20:30');
    }
  }, [weatherData, panelWp, panelPsWp, panelTilt]);

  // ----- Gestione dettaglio barra -----
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

  // ----- Gestione cambio data (selettore giorni) -----
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    // Opzionale: resetta i dati meteo per forzare il refetch (LiveView lo farà da solo)
  };

  // ----- Genera giorni per il selettore -----
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
      {/* Sezione grafico */}
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

        {/* Selettore giorni */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1">
          {days.map((d, idx) => {
            const isActive = d.toDateString() === selectedDate.toDateString();
            const dayName = d.toLocaleDateString('it-IT', { weekday: 'short' }).charAt(0).toUpperCase();
            return (
              <button
                key={idx}
                onClick={() => handleDateChange(d)}  // <--- FIX: ora cambia la data
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
          batteryAh={battAh}
          currentPower={0}
          target1={80}
          target2={90}
          target3={100}
          isPs={false}
        />

        <div className="h-4" />

        <SOCSlider
          label="Power Station"
          value={currentPsSOC}
          batteryAh={psWh / 12.8}
          currentPower={0}
          target1={80}
          target2={90}
          target3={100}
          isPs={true}
        />
      </div>
    </div>
  );
}