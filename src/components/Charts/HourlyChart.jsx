// ============================================================
//  components/Charts/HourlyChart.jsx
// ============================================================
import React from 'react';

export default function HourlyChart({ data, onBarClick }) {
  const maxPower = data.length > 0 ? Math.max(...data.map(d => d.power), 1) : 1;
  const currentHour = new Date().getHours();

  return (
    <div className="flex items-end justify-between h-[200px] gap-0.5 px-1 py-2">
      {data.map((item) => {
        const height = item.power > 0 ? Math.max(4, (item.power / maxPower) * 100) : 2;
        const isCurrent = item.hour === currentHour;

        return (
          <div
            key={item.hour}
            className="flex-1 flex flex-col items-center group cursor-pointer"
            onClick={() => onBarClick?.(item.hour, item.power, item.radiation)}
          >
            <div
              className="w-full rounded-t transition-all duration-300 group-hover:scale-y-105"
              style={{
                height: `${height}%`,
                minHeight: '2px',
                background: isCurrent
                  ? 'linear-gradient(to top, #38bdf8, #60a5fa)'
                  : 'linear-gradient(to top, #fbbf24, #f59e0b)',
                boxShadow: isCurrent
                  ? '0 0 20px rgba(56,189,248,0.4)'
                  : 'none',
              }}
            />
            <div className="text-[8px] font-bold text-white/30 mt-1">
              {String(item.hour).padStart(2, '0')}
            </div>
          </div>
        );
      })}
    </div>
  );
}