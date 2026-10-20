// The candidate's tracking token, remembered on this browser only (the link itself is the real key)
const STORAGE_KEY = "schrift.recruitment.tracking";

export const getStoredTrackingToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

export const storeTrackingToken = (token: string) => {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Storage unavailable (private mode): the link shown on screen is enough
  }
};

export const trackingPath = (token: string) => `/recrutement/suivi/${encodeURIComponent(token)}`;
