export const WeatherAPI = {
  getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject({ code: 0, message: 'GPS not supported' });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords),
        (err) => reject(err),
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
      );
    });
  },

  async fetchForecast(lat, lng, date) {
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&hourly=temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,shortwave_radiation` +
        `&daily=sunrise,sunset&timezone=auto&start_date=${date}&end_date=${date}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather API error');
      return await res.json();
    } catch (err) {
      console.error('Weather fetch error:', err);
      return null;
    }
  },

  async reverseGeocode(lat, lng) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=it`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Vibe-Solar-App (contact@example.com)' },
      });
      if (!res.ok) throw new Error('Geocode error');
      const data = await res.json();
      return data.address?.city || data.address?.town || data.address?.village || 'POSIZIONE';
    } catch {
      return 'POSIZIONE';
    }
  },

  async searchCity(cityName) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data?.[0]) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch {
      return null;
    }
  },
};