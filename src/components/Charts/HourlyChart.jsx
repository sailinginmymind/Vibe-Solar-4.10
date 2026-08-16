// ============================================================
//  components/Charts/HourlyChart.jsx — VERSIONE DEFINITIVA
//  Barre visibili con classe dedicata per evitare conflitti CSS
// ============================================================
import React from 'react';

export default function HourlyChart({ data, onBarClick }) {
  // Se non ci sono dati, mostra messaggio
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-white/30 text-sm">
        ⏳ Nessun dato disponibile
      </div>
    );
  }

  // Calcola il massimo per la scala
  const maxPower = Math.max(...data.map(d => d.power), 1);
  const currentHour = new Date().getHours();

  return (
    <div className="flex items-end justify-between h-[200px] gap-1 px-1 py-2 bg-white/5 rounded-lg overflow-visible">
      {data.map((item) => {
        // Altezza percentuale (minimo 8% per visibilità)
        let heightPercent = (item.power / maxPower) * 100;
        const minHeightPercent = 8; // 16px su 200px
        const finalHeight = item.power > 0 
          ? Math.max(minHeightPercent, heightPercent) 
          : 2;

        const isCurrent = item.hour === currentHour;
        const barColor = isCurrent
          ? 'linear-gradient(to top, #38bdf8, #60a5fa)'
          : 'linear-gradient(to top, #fbbf24, #f59e0b)';

        return (
          <div
            key={item.hour}
            className="flex-1 flex flex-col items-center group cursor-pointer touch-manipulation"
            onClick={() => onBarClick?.(item.hour, item.power, item.radiation)}
            title={`${item.hour}:00 - ${Math.round(item.power)} W`}
          >
            {/* Barra con classe dedicata per evitare conflitti con il CSS globale */}
            <div
              className="w-full rounded-t transition-all duration-300 group-hover:scale-y-105 group-hover:brightness-125 chart-bar"
              style={{
                height: `${finalHeight}%`,
                minHeight: '4px',
                background: barColor,
                boxShadow: isCurrent
                  ? '0 0 20px rgba(56,189,248,0.6)'
                  : '0 0 10px rgba(251,191,36,0.3)',
              }}
            />
            {/* Etichetta ora */}
            <div className="text-[7px] md:text-[8px] font-bold text-white/30 mt-0.5">
              {String(item.hour).padStart(2, '0')}
            </div>
            {/* Valore potenza (visibile solo su hover) */}
            <div className="text-[6px] font-bold text-white/20 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
              {Math.round(item.power)}W
            </div>
          </div>
        );
      })}
    </div>
  );
}