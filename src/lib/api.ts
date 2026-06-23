import { Capacitor } from '@capacitor/core';

// For local web development, use empty string to use relative paths
// For native Android/iOS apps, use the hosted backend URL because the app has no built-in server
export const API_BASE_URL = Capacitor.isNativePlatform() 
  ? "https://ais-dev-c6dvjsu5v46ooaodwrhwg4-902428853015.asia-east1.run.app" 
  : "";

export const fetchApi = (path: string, options?: RequestInit) => {
  return fetch(`${API_BASE_URL}${path}`, options);
};
