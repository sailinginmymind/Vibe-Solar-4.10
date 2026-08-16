// ============================================================
//  context/AppContext.jsx — Global State with Supabase
//  VERSIONE COMPLETA CON FIX USER ID
// ============================================================
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  loadStorageData,
  saveStorageData,
  getAuthUser,
  STORAGE_KEYS,
} from '../utils/storage';

// --- State Shape ---
const initialState = {
  user: getAuthUser() || 'Camperista',
  userId: loadStorageData('vibe_user_id') || null,
  isWh: false,

  // Hardware
  camperName: loadStorageData(STORAGE_KEYS.CAMPER_NAME) || '',
  battAh: loadStorageData(STORAGE_KEYS.BATT_AH) || 0,
  psWh: loadStorageData(STORAGE_KEYS.PS_WH) || 0,
  panelWp: loadStorageData(STORAGE_KEYS.PANEL_WP) || 0,
  panelPsWp: loadStorageData(STORAGE_KEYS.PANEL_PS_WP) || 0,
  panelTilt: loadStorageData(STORAGE_KEYS.PANEL_TILT) || 0,

  // SOC
  currentSOC: 50,
  currentPsSOC: 50,

  // Weather
  weatherData: null,
  selectedDate: new Date(),
  selectedTime: null,

  // Position
  lat: loadStorageData(STORAGE_KEYS.LAT) || '',
  lng: loadStorageData(STORAGE_KEYS.LNG) || '',
  cityName: '',

  // UI
  showRadiation: false,
  isGpsSyncing: false,
  isLoading: false,
  view: 'live',
};

// --- Reducer ---
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload.username, userId: action.payload.id };
    case 'SET_USER_ID':
      return { ...state, userId: action.payload };
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'SET_WH_MODE':
      return { ...state, isWh: action.payload };
    case 'SET_CAMPER_NAME':
      return { ...state, camperName: action.payload };
    case 'SET_BATT_AH':
      return { ...state, battAh: action.payload };
    case 'SET_PS_WH':
      return { ...state, psWh: action.payload };
    case 'SET_PANEL_WP':
      return { ...state, panelWp: action.payload };
    case 'SET_PANEL_PS_WP':
      return { ...state, panelPsWp: action.payload };
    case 'SET_PANEL_TILT':
      return { ...state, panelTilt: action.payload };
    case 'SET_SOC':
      return { ...state, currentSOC: action.payload };
    case 'SET_PS_SOC':
      return { ...state, currentPsSOC: action.payload };
    case 'SET_WEATHER':
      return { ...state, weatherData: action.payload };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_SELECTED_TIME':
      return { ...state, selectedTime: action.payload };
    case 'SET_LAT':
      return { ...state, lat: action.payload };
    case 'SET_LNG':
      return { ...state, lng: action.payload };
    case 'SET_CITY_NAME':
      return { ...state, cityName: action.payload };
    case 'SET_SHOW_RADIATION':
      return { ...state, showRadiation: action.payload };
    case 'SET_GPS_SYNCING':
      return { ...state, isGpsSyncing: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ALL_HARDWARE':
      return {
        ...state,
        camperName: action.payload.camperName ?? state.camperName,
        battAh: action.payload.battAh ?? state.battAh,
        psWh: action.payload.psWh ?? state.psWh,
        panelWp: action.payload.panelWp ?? state.panelWp,
        panelPsWp: action.payload.panelPsWp ?? state.panelPsWp,
        panelTilt: action.payload.panelTilt ?? state.panelTilt,
      };
    case 'SET_WEATHER_DATA':
      return { ...state, weatherData: action.payload };
    case 'LOGOUT':
      return { ...initialState, user: '', userId: null };
    default:
      return state;
  }
}

// --- Context ---
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ----- Carica i dati salvati localmente all'avvio -----
  useEffect(() => {
    const userId = loadStorageData('vibe_user_id');
    const username = getAuthUser();
    if (userId && username) {
      console.log('👤 Utente trovato in localStorage:', { userId, username });
      dispatch({ type: 'SET_USER', payload: { id: userId, username } });
    } else {
      console.log('⚠️ Nessun utente trovato in localStorage');
    }
  }, []);

  // ----- AUTO-SYNC: ogni volta che userId cambia, sincronizza i dati -----
  useEffect(() => {
    if (state.userId) {
      console.log('🔄 userId cambiato, sincronizzo garage...', state.userId);
      sincronizzaDatiGarage();
    }
  }, [state.userId]);

  // ----- Persist hardware settings to localStorage -----
  useEffect(() => {
    saveStorageData(STORAGE_KEYS.CAMPER_NAME, state.camperName);
    saveStorageData(STORAGE_KEYS.BATT_AH, state.battAh);
    saveStorageData(STORAGE_KEYS.PS_WH, state.psWh);
    saveStorageData(STORAGE_KEYS.PANEL_WP, state.panelWp);
    saveStorageData(STORAGE_KEYS.PANEL_PS_WP, state.panelPsWp);
    saveStorageData(STORAGE_KEYS.PANEL_TILT, state.panelTilt);
    saveStorageData(STORAGE_KEYS.LAT, state.lat);
    saveStorageData(STORAGE_KEYS.LNG, state.lng);
  }, [
    state.camperName,
    state.battAh,
    state.psWh,
    state.panelWp,
    state.panelPsWp,
    state.panelTilt,
    state.lat,
    state.lng,
  ]);

  // --- Supabase CRUD Functions ---

  // Salva configurazione su Supabase
  const salvaConfigurazioneSuCloud = useCallback(async () => {
    const userId = state.userId || loadStorageData('vibe_user_id');
    if (!userId) {
      console.warn('⚠️ Nessun utente loggato, salvataggio su cloud impossibile');
      return false;
    }

    try {
      console.log('☁️ Salvataggio su cloud per userId:', userId);
      
      const { data: existing, error: checkError } = await supabase
        .from('camper_configs')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      const configData = {
        camper_name: state.camperName || 'Il mio Camper',
        batt_ah: state.battAh || 0,
        ps_wh: state.psWh || 0,
        panel_wp: state.panelWp || 0,
        panel_ps_wp: state.panelPsWp || 0,
        tilt: state.panelTilt || 0,
        lat: parseFloat(state.lat) || 0,
        lng: parseFloat(state.lng) || 0,
      };

      let result;
      if (existing) {
        result = await supabase
          .from('camper_configs')
          .update(configData)
          .eq('user_id', userId);
      } else {
        result = await supabase
          .from('camper_configs')
          .insert({ user_id: userId, ...configData });
      }

      if (result.error) throw result.error;
      console.log('✅ Configurazione salvata su Supabase');
      return true;
    } catch (error) {
      console.error('❌ Errore salvataggio Supabase:', error.message);
      return false;
    }
  }, [state]);

  // Sincronizza dal cloud Supabase
  const sincronizzaDatiGarage = useCallback(async () => {
    const userId = state.userId || loadStorageData('vibe_user_id');
    if (!userId) {
      console.warn('⚠️ Nessun utente loggato per sincronizzare');
      return false;
    }

    try {
      console.log('📥 Sincronizzazione da cloud per userId:', userId);
      
      const { data, error } = await supabase
        .from('camper_configs')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        dispatch({
          type: 'SET_ALL_HARDWARE',
          payload: {
            camperName: data.camper_name || '',
            battAh: parseFloat(data.batt_ah) || 0,
            psWh: parseFloat(data.ps_wh) || 0,
            panelWp: parseFloat(data.panel_wp) || 0,
            panelPsWp: parseFloat(data.panel_ps_wp) || 0,
            panelTilt: parseFloat(data.tilt) || 0,
          },
        });

        if (data.lat) {
          dispatch({ type: 'SET_LAT', payload: String(data.lat) });
        }
        if (data.lng) {
          dispatch({ type: 'SET_LNG', payload: String(data.lng) });
        }

        console.log('✅ Dati sincronizzati da Supabase');
        return true;
      } else {
        console.log('ℹ️ Nessuna configurazione trovata per questo utente');
        return false;
      }
    } catch (error) {
      console.error('❌ Errore sincronizzazione Supabase:', error.message);
      return false;
    }
  }, [state.userId]);

  // --- Setters ---
  const setView = useCallback((view) => dispatch({ type: 'SET_VIEW', payload: view }), []);
  const setWhMode = useCallback((val) => dispatch({ type: 'SET_WH_MODE', payload: val }), []);
  const setCamperName = useCallback((val) => dispatch({ type: 'SET_CAMPER_NAME', payload: val }), []);
  const setBattAh = useCallback((val) => dispatch({ type: 'SET_BATT_AH', payload: val }), []);
  const setPsWh = useCallback((val) => dispatch({ type: 'SET_PS_WH', payload: val }), []);
  const setPanelWp = useCallback((val) => dispatch({ type: 'SET_PANEL_WP', payload: val }), []);
  const setPanelPsWp = useCallback((val) => dispatch({ type: 'SET_PANEL_PS_WP', payload: val }), []);
  const setPanelTilt = useCallback((val) => dispatch({ type: 'SET_PANEL_TILT', payload: val }), []);
  const setSOC = useCallback((val) => dispatch({ type: 'SET_SOC', payload: val }), []);
  const setPsSOC = useCallback((val) => dispatch({ type: 'SET_PS_SOC', payload: val }), []);
  const setWeather = useCallback((val) => dispatch({ type: 'SET_WEATHER', payload: val }), []);
  const setSelectedDate = useCallback((val) => dispatch({ type: 'SET_SELECTED_DATE', payload: val }), []);
  const setSelectedTime = useCallback((val) => dispatch({ type: 'SET_SELECTED_TIME', payload: val }), []);
  const setLat = useCallback((val) => dispatch({ type: 'SET_LAT', payload: val }), []);
  const setLng = useCallback((val) => dispatch({ type: 'SET_LNG', payload: val }), []);
  const setCityName = useCallback((val) => dispatch({ type: 'SET_CITY_NAME', payload: val }), []);
  const setShowRadiation = useCallback((val) => dispatch({ type: 'SET_SHOW_RADIATION', payload: val }), []);
  const setGpsSyncing = useCallback((val) => dispatch({ type: 'SET_GPS_SYNCING', payload: val }), []);
  const setLoading = useCallback((val) => dispatch({ type: 'SET_LOADING', payload: val }), []);
  const setAllHardware = useCallback((data) => dispatch({ type: 'SET_ALL_HARDWARE', payload: data }), []);
  const setWeatherData = useCallback((data) => dispatch({ type: 'SET_WEATHER_DATA', payload: data }), []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    localStorage.removeItem('vibe_user_id');
    window.location.reload();
  }, []);

  // --- Gestione utente da Supabase ---
  const setUserFromSupabase = useCallback((userId, username) => {
    console.log('👤 Set user from Supabase:', { userId, username });
    dispatch({ type: 'SET_USER', payload: { id: userId, username } });
    saveStorageData('vibe_user_id', userId);
    saveStorageData(STORAGE_KEYS.USER, username);
  }, []);

  const value = {
    state,
    dispatch,
    setView,
    setWhMode,
    setCamperName,
    setBattAh,
    setPsWh,
    setPanelWp,
    setPanelPsWp,
    setPanelTilt,
    setSOC,
    setPsSOC,
    setWeather,
    setSelectedDate,
    setSelectedTime,
    setLat,
    setLng,
    setCityName,
    setShowRadiation,
    setGpsSyncing,
    setLoading,
    setAllHardware,
    setWeatherData,
    salvaConfigurazioneSuCloud,
    sincronizzaDatiGarage,
    setUserFromSupabase,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}