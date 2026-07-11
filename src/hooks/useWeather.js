import { useState, useCallback } from 'react';
import { WeatherAPI } from '../utils/weatherAPI';

export function useWeather() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async (lat, lng, date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await WeatherAPI.fetchForecast(lat, lng, date);
      if (data) {
        setWeatherData(data);
        return data;
      } else {
        setError('Errore nel recupero meteo');
        return null;
      }
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCityName = useCallback(async (lat, lng) => {
    try {
      return await WeatherAPI.reverseGeocode(lat, lng);
    } catch {
      return 'POSIZIONE';
    }
  }, []);

  const searchCity = useCallback(async (query) => {
    try {
      return await WeatherAPI.searchCity(query);
    } catch {
      return null;
    }
  }, []);

  return { weatherData, loading, error, fetchWeather, getCityName, searchCity };
}