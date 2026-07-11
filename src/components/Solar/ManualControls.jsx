import React from 'react';
import { useApp } from '../../context/AppContext';
import { WeatherAPI } from '../../utils/weatherAPI';

export default function ManualControls() {
  const {
    state,
    setSelectedTime,
    setSelectedDate,
    setLat,
    setLng,
    setCityName,
    setWeatherData,
    setLoading,
  } = useApp();

  const { lat, lng, selectedDate, selectedTime, cityName } = state;

  const handleCitySearch = async (e) => {
    const query = e.target.value.trim();
    if (query.length < 3) return;

    setLoading(true);
    try {
      const result = await WeatherAPI.searchCity(query);
      if (result) {
        setLat(result.lat.toFixed(4));
        setLng(result.lng.toFixed(4));
        setCityName(query.toUpperCase());
        const dateStr = selectedDate.toISOString().split('T')[0];
        const data = await WeatherAPI.fetchForecast(result.lat, result.lng, dateStr);
        if (data) setWeatherData(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          type="time"
          value={selectedTime || ''}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="glass rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#38bdf8]/50"
        />
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => {
            if (e.target.value) {
              setSelectedDate(new Date(e.target.value));
            }
          }}
          className="glass rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#38bdf8]/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          placeholder="Lat"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          step="0.01"
          className="glass rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#38bdf8]/50"
        />
        <input
          type="number"
          placeholder="Lng"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          step="0.01"
          className="glass rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#38bdf8]/50"
        />
      </div>

      <div className="text-center">
        <input
          type="text"
          placeholder="Cerca città..."
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          onBlur={handleCitySearch}
          className="glass rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#38bdf8]/50 w-full text-center uppercase font-bold"
        />
      </div>
    </div>
  );
}