import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { WeatherAPI } from '../../utils/weatherAPI';
import { SolarEngine } from '../../utils/solarEngine';
import { useIsDesktop, useIsTabletOrDesktop } from '../../hooks/useMediaQuery';
import SunAnimation from '../Solar/SunAnimation';
import WeatherBadges from '../Solar/WeatherBadges';
import ManualControls from '../Solar/ManualControls';
import PowerDisplay from '../Solar/PowerDisplay';   // <--- AGGIUNGI QUESTA RIGA

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
    view,
  } = state;

  const isDesktop = useIsDesktop();
  const isTabletOrDesktop = useIsTabletOrDesktop();

  // Stati individuali
  const [radiation, setRadiation] = useState(0);
  const [cloudCover, setCloudCover] = useState(0);
  const [sunrise, setSunrise] = useState('--:--');
  const [sunset, setSunset] = useState('--:--');
  const [totalPower, setTotalPower] = useState(0);
  const [powerServ, setPowerServ] = useState(0);
  const [powerPS, setPowerPS] = useState(0);

  const gpsButtonRef = useRef(null);
  const isMounted = useRef(true);
  const refreshTimeout = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // ----- AGGIORNAMENTO AUTOMATICO QUANDO ENTRI IN DASHBOARD -----
  useEffect(() => {
    if (view === 'live' && !state.isGpsSyncing) {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
      refreshTimeout.current = setTimeout(() => {
        console.log('🔄 Aggiornamento automatico Dashboard...');
        handleGpsSync();
      }, 300);
    }
    return () => {
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, [view]);

  // ----- CARICA METEO -----
  useEffect(() => {
    if (!lat || !lng) {
      console.log('⏳ In attesa di coordinate GPS...');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        console.log(`📡 Fetch meteo per ${lat}, ${lng} - ${dateStr}`);
        const data = await WeatherAPI.fetchForecast(lat, lng, dateStr);
        if (isMounted.current && data) {
          setWeatherData(data);
          const city = await WeatherAPI.reverseGeocode(lat, lng);
          if (isMounted.current) setCityName(city);
          console.log('✅ Meteo caricato');
        } else {
          console.warn('⚠️ Nessun dato meteo ricevuto');
        }
      } catch (err) {
        console.error('❌ Errore fetch meteo:', err);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchData();
  }, [lat, lng, selectedDate]);

  // ----- CALCOLA TUTTI I DATI SOLARI -----
  useEffect(() => {
    if (!weatherData?.hourly || !selectedTime) {
      setRadiation(0);
      setCloudCover(0);
      setSunrise('--:--');
      setSunset('--:--');
      setTotalPower(0);
      setPowerServ(0);
      setPowerPS(0);
      return;
    }

    console.log('🔄 Ricalcolo potenza...');

    const hourly = weatherData.hourly;
    const daily = weatherData.daily;

    const sunriseStr = daily?.sunrise?.[0]?.split('T')[1]?.substring(0, 5) || '--:--';
    const sunsetStr = daily?.sunset?.[0]?.split('T')[1]?.substring(0, 5) || '--:--';

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const hDec = hours + minutes / 60;
    const hourIdx = Math.min(hours, 23);

    const radArr = hourly.shortwave_radiation;
    let rad = 0;
    if (radArr) {
      const curr = radArr[hourIdx] ?? 0;
      const next = radArr[Math.min(hourIdx + 1, 23)] ?? curr;
      rad = curr + (next - curr) * (minutes / 60);
    }

    const cloudArr = hourly.cloud_cover;
    let clouds = 0;
    if (cloudArr) {
      const cCurr = cloudArr[hourIdx] ?? 0;
      const cNext = cloudArr[Math.min(hourIdx + 1, 23)] ?? cCurr;
      clouds = Math.round(cCurr + (cNext - cCurr) * (minutes / 60));
    }

    const sunH = SolarEngine.timeToDecimal(sunriseStr);
    const setH = SolarEngine.timeToDecimal(sunsetStr);
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

    setRadiation(rad);
    setCloudCover(clouds);
    setSunrise(sunriseStr);
    setSunset(sunsetStr);
    setPowerServ(pServ);
    setPowerPS(pPS);
    setTotalPower(pServ + pPS);

    console.log(`⚡ Potenza: Servizi=${Math.round(pServ)}W, PS=${Math.round(pPS)}W, Totale=${Math.round(pServ + pPS)}W`);
  }, [weatherData, selectedTime, panelWp, panelPsWp, panelTilt]);

  // ----- HANDLE GPS SYNC -----
  const handleGpsSync = async () => {
    if (state.isGpsSyncing) return;

    console.log('📡 Avvio sincronizzazione GPS...');
    setGpsSyncing(true);

    if (gpsButtonRef.current) {
      gpsButtonRef.current.classList.add('glow-green');
    }

    try {
      const coords = await WeatherAPI.getUserLocation();
      const now = new Date();
      setLat(coords.latitude.toFixed(4));
      setLng(coords.longitude.toFixed(4));
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setSelectedTime(timeStr);
      console.log('✅ GPS sincronizzato');

      if (gpsButtonRef.current) {
        gpsButtonRef.current.style.background = '#22c55e';
        gpsButtonRef.current.innerText = '✅ Sincronizzato!';
      }

      setTimeout(() => {
        if (gpsButtonRef.current) {
          gpsButtonRef.current.classList.remove('glow-green');
          gpsButtonRef.current.style.background = '';
          gpsButtonRef.current.innerText = '📡 Aggiorna GPS e Ora';
        }
      }, 2000);

    } catch (err) {
      console.error('❌ Errore GPS:', err);
      setLat('41.9028');
      setLng('12.4964');
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setSelectedTime(timeStr);

      if (gpsButtonRef.current) {
        gpsButtonRef.current.style.background = '#ef4444';
        gpsButtonRef.current.innerText = '❌ Errore GPS';
        setTimeout(() => {
          if (gpsButtonRef.current) {
            gpsButtonRef.current.classList.remove('glow-green');
            gpsButtonRef.current.style.background = '';
            gpsButtonRef.current.innerText = '📡 Aggiorna GPS e Ora';
          }
        }, 2000);
      }
    } finally {
      setGpsSyncing(false);
    }
  };

  // ----- Inizializza con coordinate di default -----
  useEffect(() => {
    if (!lat || !lng) {
      console.log('🌍 Nessuna posizione, uso coordinate di default (Roma)');
      setLat('41.9028');
      setLng('12.4964');
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setSelectedTime(timeStr);
    }
  }, []);

  // ============================================================
  // RENDER
  // ============================================================

  const GpsButton = () => (
    <button
      ref={gpsButtonRef}
      onClick={handleGpsSync}
      disabled={state.isGpsSyncing}
      className="w-full py-3.5 md:py-4 rounded-xl font-bold text-sm tracking-wider bg-[#fbbf24] text-[#0b1121] hover:bg-[#fbbf24]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 touch-manipulation glow-green"
    >
      <span>📡</span>
      {state.isGpsSyncing ? 'Ricerca posizione...' : 'Aggiorna GPS e Ora'}
    </button>
  );

  const SunSection = () => (
    <SunAnimation
      time={selectedTime}
      sunrise={sunrise}
      sunset={sunset}
      cloudCover={cloudCover}
      radiation={radiation}
      showRadiation={state.showRadiation}
    />
  );

  // === QUI USA PowerDisplay (ora importato correttamente) ===
  const PowerSection = () => (
    <PowerDisplay total={totalPower} services={powerServ} ps={powerPS} />
  );

  const WeatherSection = () => (
    weatherData?.hourly && selectedTime && (
      <WeatherBadges weatherData={weatherData} time={selectedTime} />
    )
  );

  const ControlsSection = () => <ManualControls />;

  // ----- LAYOUT DESKTOP / TABLET -----
  if (isTabletOrDesktop) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🌄</span>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Panoramica Solare
              </h3>
              <p className="text-sm text-white/30 font-light tracking-wide">
                Monitoraggio in tempo reale
              </p>
            </div>
          </div>
          <button
            ref={gpsButtonRef}
            onClick={handleGpsSync}
            disabled={state.isGpsSyncing}
            className="px-5 py-2.5 rounded-xl font-medium text-sm bg-[#fbbf24] text-[#0b1121] hover:bg-[#fbbf24]/90 transition-all disabled:opacity-50 flex items-center gap-2 glow-green"
          >
            <span>📡</span>
            {state.isGpsSyncing ? 'Ricerca...' : 'Sincronizza posizione'}
          </button>
        </div>

        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3">
            <SunSection />
          </div>
          <div className="col-span-2 space-y-4">
            <PowerSection />
            <WeatherSection />
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm">⚙️</span>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/30">
              Controlli avanzati
            </span>
          </div>
          <ControlsSection />
        </div>

        <div className="flex items-center justify-between text-xs text-white/20 border-t border-white/5 pt-3">
          <span>☀️ Radiazione: {Math.round(radiation)} W/m²</span>
          <span>☁️ Copertura nuvolosa: {cloudCover}%</span>
          <span>📍 {state.cityName || 'Posizione non impostata'}</span>
        </div>
      </div>
    );
  }

  // ----- LAYOUT MOBILE -----
  return (
    <div className="space-y-4">
      <GpsButton />
      <SunSection />
      <PowerSection />
      <WeatherSection />
      <ControlsSection />
    </div>
  );
}