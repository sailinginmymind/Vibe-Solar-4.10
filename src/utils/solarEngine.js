export const SolarEngine = {
  getOptimalTilt(sunAltitude) {
    if (sunAltitude <= 0) return 0;
    const ideal = 90 - sunAltitude;
    return Math.max(0, Math.min(90, ideal));
  },

  calculatePowerByRadiation(hDec, sunH, setH, panelWp, radiation, tilt = 0, sunAltitude = 0) {
    if (hDec < sunH || hDec > setH || sunAltitude <= 0) return 0;
    if (!radiation || radiation < 15) return 0;

    const basePower = panelWp * (radiation / 1000);
    const optimalTilt = this.getOptimalTilt(sunAltitude);
    const angularDiff = Math.abs(tilt - optimalTilt);
    const radDiff = (angularDiff * Math.PI) / 180;
    const incidenceFactor = Math.max(0, Math.cos(radDiff));
    const systemEfficiency = 0.82;

    const finalPower = basePower * incidenceFactor * systemEfficiency;
    return finalPower < 0.1 ? 0 : finalPower;
  },

  estimateChargeTime(currentSoc, targetSoc, currentPower, battAh) {
    if (currentPower <= 5 || battAh <= 0) return '--';
    if (parseFloat(currentSoc) >= targetSoc) return 'OK';

    const voltage = 12.8;
    const lossFactor = 0.85;
    const totalWh = battAh * voltage;
    const energyNeeded = totalWh * ((targetSoc - currentSoc) / 100);
    const netPower = currentPower * lossFactor - 10;
    if (netPower <= 0) return '∞';

    const hoursDecimal = energyNeeded / netPower;
    if (hoursDecimal > 48) return '>48h';

    const h = Math.floor(hoursDecimal);
    const m = Math.round((hoursDecimal - h) * 60);
    return `${h}h ${m}m`;
  },

  timeToDecimal(timeStr) {
    if (!timeStr || timeStr === '--:--') return 12;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return 12;
    const h = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    return h + m / 60;
  },
};