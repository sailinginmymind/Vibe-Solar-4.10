import { useMemo } from 'react';
import { SolarEngine } from '../utils/solarEngine';

export function useSolar(panelWp, panelPsWp, tilt, weatherData, time, sunrise, sunset) {
  // Calcola potenza istantanea
  const instantPower = useMemo(() => {
    if (!weatherData?.hourly || !time) return { total: 0, services: 0, ps: 0 };

    const [h, m] = time.split(':').map(Number);
    const hDec = h + m / 60;
    const hourIdx = Math.min(h, 23);
    const rad = weatherData.hourly.shortwave_radiation?.[hourIdx] || 0;

    const sunH = SolarEngine.timeToDecimal(sunrise);
    const setH = SolarEngine.timeToDecimal(sunset);
    const progress = (hDec - sunH) / (setH - sunH);
    const sunAlt = (hDec >= sunH && hDec <= setH) ? Math.sin(progress * Math.PI) * 65 : 0;

    const pServ = SolarEngine.calculatePowerByRadiation(hDec, sunH, setH, panelWp, rad, tilt, sunAlt);
    const pPS = SolarEngine.calculatePowerByRadiation(hDec, sunH, setH, panelPsWp, rad, tilt, sunAlt);
    return { total: pServ + pPS, services: pServ, ps: pPS };
  }, [weatherData, time, sunrise, sunset, panelWp, panelPsWp, tilt]);

  // Calcola produzione giornaliera (array orario)
  const dailyProduction = useMemo(() => {
    if (!weatherData?.hourly || !weatherData?.daily) return [];

    const hourly = weatherData.hourly;
    const daily = weatherData.daily;
    const sunR = daily.sunrise?.[0]?.split('T')[1]?.substring(0, 5) || '--:--';
    const sunS = daily.sunset?.[0]?.split('T')[1]?.substring(0, 5) || '--:--';
    const sunH = SolarEngine.timeToDecimal(sunR);
    const setH = SolarEngine.timeToDecimal(sunS);
    const totalWp = panelWp + panelPsWp;

    const data = [];
    for (let h = Math.floor(sunH); h <= Math.ceil(setH); h++) {
      if (h > 23) break;
      const rad = hourly.shortwave_radiation?.[h] || 0;
      let alt = 0;
      if (h >= sunH && h <= setH) {
        const progress = (h - sunH) / (setH - sunH);
        alt = Math.sin(progress * Math.PI) * 65;
      }
      const power = SolarEngine.calculatePowerByRadiation(h, sunH, setH, totalWp, rad, tilt, alt);
      data.push({ hour: h, power: power < 0.1 ? 0 : power, radiation: rad });
    }
    return data;
  }, [weatherData, panelWp, panelPsWp, tilt]);

  const dailyTotal = useMemo(() => {
    return dailyProduction.reduce((sum, item) => sum + item.power, 0);
  }, [dailyProduction]);

  const estimateCharge = (currentSoc, targetSoc, currentPower, battAh) => {
    return SolarEngine.estimateChargeTime(currentSoc, targetSoc, currentPower, battAh);
  };

  const getOptimalTilt = (sunAltitude) => SolarEngine.getOptimalTilt(sunAltitude);

  return {
    instantPower,
    dailyProduction,
    dailyTotal,
    estimateCharge,
    getOptimalTilt,
  };
}