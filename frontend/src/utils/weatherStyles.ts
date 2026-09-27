import type { Condition, ConditionGroup } from '../types';

// Mismos textos que WeatherCodes.java
const CONDITIONS: Record<number, [string, ConditionGroup]> = {
  0: ['Despejado', 'clear'],
  1: ['Mayormente despejado', 'clear'],
  2: ['Parcialmente nublado', 'partly'],
  3: ['Cubierto', 'cloudy'],
  45: ['Niebla', 'fog'],
  48: ['Niebla con escarcha', 'fog'],
  51: ['Llovizna débil', 'drizzle'],
  53: ['Llovizna', 'drizzle'],
  55: ['Llovizna intensa', 'drizzle'],
  56: ['Llovizna helada', 'drizzle'],
  57: ['Llovizna helada intensa', 'drizzle'],
  61: ['Lluvia débil', 'rain'],
  63: ['Lluvia', 'rain'],
  65: ['Lluvia intensa', 'rain'],
  66: ['Lluvia helada', 'rain'],
  67: ['Lluvia helada intensa', 'rain'],
  71: ['Nevada débil', 'snow'],
  73: ['Nevada', 'snow'],
  75: ['Nevada intensa', 'snow'],
  77: ['Granizo fino', 'snow'],
  80: ['Chubascos débiles', 'rain'],
  81: ['Chubascos', 'rain'],
  82: ['Chubascos violentos', 'rain'],
  85: ['Chubascos de nieve', 'snow'],
  86: ['Chubascos de nieve intensos', 'snow'],
  95: ['Tormenta', 'storm'],
  96: ['Tormenta con granizo', 'storm'],
  99: ['Tormenta con granizo intenso', 'storm'],
};

export const describeCondition = (code: number): Condition => {
  const [description, group] = CONDITIONS[code] ?? ['Desconocido', 'cloudy'];
  return { code, description, group };
};

export interface SkyTheme {
  top: string;
  bottom: string;
  accent: string;
}

/** Paleta del cielo según el estado y si es de día o de noche. */
export const getSkyTheme = (group: ConditionGroup, isDay: boolean): SkyTheme => {
  if (!isDay) {
    switch (group) {
      case 'clear':
      case 'partly':
        return { top: '#0e1a3d', bottom: '#04060d', accent: '#c7d2fe' };
      case 'storm':
        return { top: '#1d1733', bottom: '#040309', accent: '#c4b5fd' };
      case 'snow':
        return { top: '#27334a', bottom: '#070a11', accent: '#e0f2fe' };
      case 'rain':
      case 'drizzle':
        return { top: '#12233a', bottom: '#03060c', accent: '#7dd3fc' };
      default:
        return { top: '#1b2230', bottom: '#05070b', accent: '#cbd5e1' };
    }
  }
  switch (group) {
    case 'clear':
      return { top: '#1f6fd6', bottom: '#081a36', accent: '#ffc857' };
    case 'partly':
      return { top: '#3a6aa3', bottom: '#0a1629', accent: '#ffd27a' };
    case 'cloudy':
      return { top: '#465264', bottom: '#0c1118', accent: '#dbe3ee' };
    case 'fog':
      return { top: '#5b6573', bottom: '#101318', accent: '#e5e7eb' };
    case 'drizzle':
    case 'rain':
      return { top: '#28476a', bottom: '#060c17', accent: '#7dd3fc' };
    case 'snow':
      return { top: '#7589a3', bottom: '#111722', accent: '#e0f2fe' };
    case 'storm':
      return { top: '#342b52', bottom: '#07060d', accent: '#c4b5fd' };
  }
};

// Escala de color de temperatura (°C) compartida por el mapa, la semana y la curva horaria
const TEMP_STOPS: Array<[number, [number, number, number]]> = [
  [-15, [139, 92, 246]],
  [-5, [96, 165, 250]],
  [5, [34, 211, 238]],
  [12, [52, 211, 153]],
  [18, [163, 230, 53]],
  [24, [250, 204, 21]],
  [30, [251, 146, 60]],
  [36, [239, 68, 68]],
  [42, [190, 18, 60]],
];

export const tempColor = (celsius: number): string => {
  const t = Math.max(TEMP_STOPS[0][0], Math.min(TEMP_STOPS[TEMP_STOPS.length - 1][0], celsius));
  for (let i = 1; i < TEMP_STOPS.length; i++) {
    const [t1, c1] = TEMP_STOPS[i];
    const [t0, c0] = TEMP_STOPS[i - 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0);
      const mix = c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
      return `rgb(${mix.join(' ')})`;
    }
  }
  return 'rgb(190 18 60)';
};

export const TEMP_LEGEND = TEMP_STOPS.map(([t]) => t);
