export const STORAGE_KEYS = {
  AUTH_VALID: 'vibe_auth_valid',
  AUTH_SESSION: 'vibe_auth_session',
  USER: 'utente_corrente',
  CAMPER_NAME: 'vibe_camper_name',
  BATT_AH: 'vibe_batt_ah',
  PS_WH: 'vibe_ps_wh',
  PANEL_WP: 'vibe_panel_wp',
  PANEL_PS_WP: 'vibe_panel_ps_wp',
  PANEL_TILT: 'vibe_panel_tilt',
  LAT: 'vibe_lat',
  LNG: 'vibe_lng',
  BG_COLOR: 'vibe_solar_bg_color',
};

export function loadStorageData(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveStorageData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage save error:', e);
  }
}

export function removeStorageData(key) {
  localStorage.removeItem(key);
}

export function getAuthStatus() {
  const local = localStorage.getItem(STORAGE_KEYS.AUTH_VALID) === 'true';
  const session = sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION) === 'true';
  return local || session;
}

export function getAuthUser() {
  return localStorage.getItem(STORAGE_KEYS.USER) || sessionStorage.getItem(STORAGE_KEYS.USER) || null;
}

export function setAuthLocal(user) {
  localStorage.setItem(STORAGE_KEYS.AUTH_VALID, 'true');
  localStorage.setItem(STORAGE_KEYS.USER, user);
  sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
}

export function setAuthSession(user) {
  sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, 'true');
  sessionStorage.setItem(STORAGE_KEYS.USER, user);
  localStorage.removeItem(STORAGE_KEYS.AUTH_VALID);
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEYS.AUTH_VALID);
  localStorage.removeItem(STORAGE_KEYS.USER);
  sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
  sessionStorage.removeItem(STORAGE_KEYS.USER);
}