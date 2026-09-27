import type { CityTemperature, Forecast, Place } from '../types';
import * as direct from './openMeteoDirect';

/**
 * Capa de datos. Por defecto habla con la API Spring Boot; si el backend no
 * está disponible (por ejemplo, en la demo publicada en GitHub Pages) pasa a
 * consultar Open-Meteo directamente desde el navegador con el mismo contrato.
 */

export type DataSource = 'api' | 'direct';

const API_URL = (import.meta.env.VITE_API_URL ?? `${import.meta.env.BASE_URL}api`).replace(/\/$/, '');

let source: DataSource = import.meta.env.VITE_DATA_SOURCE === 'direct' ? 'direct' : 'api';
const listeners = new Set<(s: DataSource) => void>();

export const getDataSource = () => source;

export const onDataSourceChange = (listener: (s: DataSource) => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export class WeatherError extends Error {}

async function fromApi<T>(path: string, fallback: () => Promise<T>, signal?: AbortSignal): Promise<T> {
  if (source === 'api') {
    try {
      const res = await fetch(`${API_URL}${path}`, { signal, headers: { Accept: 'application/json' } });
      const isJson = res.headers.get('content-type')?.includes('json');
      if (res.ok && isJson) return (await res.json()) as T;
      if (res.status === 400) {
        const problem = isJson ? await res.json() : null;
        throw new WeatherError(problem?.detail ?? 'Petición no válida');
      }
      // 404 / 5xx / respuesta HTML: no hay backend detrás → modo directo
    } catch (err) {
      if (err instanceof WeatherError || (err as Error).name === 'AbortError') throw err;
    }
    source = 'direct';
    listeners.forEach((l) => l(source));
  }
  return fallback();
}

const coords = (lat: number, lon: number) => `lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`;

export const getForecast = (lat: number, lon: number, signal?: AbortSignal) =>
  fromApi<Forecast>(`/weather?${coords(lat, lon)}`, () => direct.forecast(lat, lon, signal), signal);

export const searchPlaces = (query: string, signal?: AbortSignal) =>
  fromApi<Place[]>(
    `/places?q=${encodeURIComponent(query)}`,
    () => direct.searchPlaces(query, signal),
    signal,
  );

export const reversePlace = (lat: number, lon: number, signal?: AbortSignal) =>
  fromApi<Place>(`/places/reverse?${coords(lat, lon)}`, () => direct.reversePlace(lat, lon, signal), signal);

export const getMapCities = (signal?: AbortSignal) =>
  fromApi<CityTemperature[]>('/map/cities', () => direct.mapCities(signal), signal);
