import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { WeatherAPI } from '../../utils/weatherAPI';
import { SolarEngine } from '../../utils/solarEngine';
import SunAnimation from '../Solar/SunAnimation';
import PowerDisplay from '../Solar/PowerDisplay';
import WeatherBadges from '../Solar/WeatherBadges';
import ManualControls from '../Solar/ManualControls';

export default function LiveView() {
  const {
    state,
    setWeatherData,
    setSelectedTime,
    setLat,
    setLng,
    setCityName,
    setGpsSyncing,
    setLoading,
  } = useApp();

  const {
    lat,
    lng,
    weatherData,
    selectedDate,
    selectedTime,
    panelWp,
    panelPsWp,
    panelTilt,
  } = state;

  const [radiation, setRadiation] = useState(0);
  const [cloudCover, setCloudCover] = useState(0);
  const [sunrise, setSunrise] = useState('--:--');
  const [sunset, setSunset] = useState('--:--');
  const [totalPower, setTotalPower] = useState(0);
  const [powerServ, setPowerServ] = useState(0);
  const [powerPS, setPowerPS] = useState(0);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Fetch weather on mount or when lat/lng/date change
  useEffect(() => {
    if (!lat || !lng) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const data = await WeatherAPI.fetchForecast(lat, lng, dateStr);
        if (isMounted.current && data) {
          setWeatherData(data);
          const city = await WeatherAPI.reverseGeocode(lat, lng);
          if (isMounted.current) setCityName(city);
        }
      } catch (err) {
        console.error('LiveView fetch error:', err);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchData();
  }, [lat, lng, selectedDate]);

  // Compute solar data whenever weather or time changes
  useEffect(() => {
    if (!weatherData?.hourly || !selectedTime) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const hDec = hours + minutes / 60;
    const hourIdx = Math.min(hours, 23);

    const hourly = weatherData.hourly;
    const daily = weatherData.daily;

    if (daily?.sunrise?.[0]) {
      setSunrise(daily.sunrise[0].split('T')[1]?.substring(0, 5) || '--:--');
    }
    if (daily?.sunset?.[0]) {
      setSunset(daily.sunset[0].split('T')[1]?.substring(0, 5) || '--:--');
    }

    const radArr = hourly.shortwave_radiation;
    let rad = 0;
    if (radArr) {
      const curr = radArr[hourIdx] ?? 0;
      const next = radArr[Math.min(hourIdx + 1, 23)] ?? curr;
      rad = curr + (next - curr) * (minutes / 60);
    }
    setRadiation(rad);

    const cloudArr = hourly.cloud_cover;
    let clouds = 0;
    if (cloudArr) {
      const cCurr = cloudArr[hourIdx] ?? 0;
      const cNext = cloudArr[Math.min(hourIdx + 1, 23)] ?? cCurr;
      clouds = Math.round(cCurr + (cNext - cCurr) * (minutes / 60));
    }
    setCloudCover(clouds);

    const sunH = SolarEngine.timeToDecimal(sunrise);
    const setH = SolarEngine.timeToDecimal(sunset);
    const progress = (hDec - sunH) / (setH - sunH);
    const sunAltitude = hDec >= sunH && hDec <= setH
      ? Math.sin(progress * Math.PI) * 65
      : 0;

    const pServ = SolarEngine.calculatePowerByRadiation(
      hDec, sunH, setH, panelWp, rad, panelTilt, sunAltitude
    );
    const pPS = SolarEngine.calculatePowerByRadiation(
      hDec, sunH, setH, panelPsWp, rad, panelTilt, sunAltitude
    );
    setPowerServ(pServ);
    setPowerPS(pPS);
    setTotalPower(pServ + pPS);
  }, [weatherData, selectedTime, panelWp, panelPsWp, panelTilt, sunrise, sunset]);

  const handleGpsSync = async () => {
    setGpsSyncing(true);
    try {
      const coords = await WeatherAPI.getUserLocation();
      const now = new Date();
      setLat(coords.latitude.toFixed(4));
      setLng(coords.longitude.toFixed(4));
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setSelectedTime(timeStr);
    } catch {
      // fallback
    } finally {
      setGpsSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleGpsSync}
        disabled={state.isGpsSyncing}
        className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wider bg-[#fbbf24] text-[#0b1121] hover:bg-[#fbbf24]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <span>📡</span>
        {state.isGpsSyncing ? 'Ricerca posizione...' : 'Aggiorna GPS e Ora'}
      </button>

      <SunAnimation
        time={selectedTime}
        sunrise={sunrise}
        sunset={sunset}
        cloudCover={cloudCover}
        radiation={radiation}
        showRadiation={state.showRadiation}
      />

      <PowerDisplay total={totalPower} services={powerServ} ps={powerPS} />

      {weatherData?.hourly && selectedTime && (
        <WeatherBadges
          weatherData={weatherData}
          time={selectedTime}
        />
      )}

      <ManualControls />
    </div>
  );
}