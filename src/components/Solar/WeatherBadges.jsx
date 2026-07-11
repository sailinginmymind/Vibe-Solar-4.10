// ============================================================
//  components/Solar/WeatherBadges.jsx
// ============================================================
import React, { useMemo } from 'react';

export default function WeatherBadges({ weatherData, time }) {
  const values = useMemo(() => {
    if (!weatherData?.hourly || !time) {
      return { wind: '--', humidity: '--', temp: '--' };
    }

    const [h] = time.split(':').map(Number);
    const idx = Math.min(h, 23);
    const hourly = weatherData.hourly;

    return {
      wind: Math.round(hourly.wind_speed_10m?.[idx] || 0) + ' km/h',
      humidity: (hourly.relative_humidity_2m?.[idx] || 0) + '%',
      temp: Math.round(hourly.temperature_2m?.[idx] || 0) + '°C',
    };
  }, [weatherData, time]);

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="glass rounded-xl py-3 px-2 text-center">
        <div className="text-[9px] font-bold uppercase tracking-wider text-[#38bdf8]">Vento</div>
        <div className="text-lg font-bold text-white">{values.wind}</div>
      </div>
      <div className="glass rounded-xl py-3 px-2 text-center">
        <div className="text-[9px] font-bold uppercase tracking-wider text-[#38bdf8]">Umidità</div>
        <div className="text-lg font-bold text-white">{values.humidity}</div>
      </div>
      <div className="glass rounded-xl py-3 px-2 text-center">
        <div className="text-[9px] font-bold uppercase tracking-wider text-[#38bdf8]">Temp.</div>
        <div className="text-lg font-bold text-white">{values.temp}</div>
      </div>
    </div>
  );
}