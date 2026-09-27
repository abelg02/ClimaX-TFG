import type { Units } from '../types';

export const toUnits = (celsius: number, units: Units) => (units === 'f' ? celsius * 1.8 + 32 : celsius);

export const formatTemp = (celsius: number, units: Units) => `${Math.round(toUnits(celsius, units))}°`;

/**
 * Las horas de Open-Meteo vienen en hora local del lugar sin zona
 * ("2026-09-27T14:00"), así que se leen como texto para no aplicar
 * la zona horaria del navegador.
 */
export const hourOf = (isoLocal: string) => isoLocal.slice(11, 16);

export const minutesOf = (isoLocal: string) => {
  const [h, m] = isoLocal.slice(11, 16).split(':').map(Number);
  return h * 60 + m;
};

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const WEEKDAYS_LONG = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const parseDate = (isoDate: string) => {
  const [y, m, d] = isoDate.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

export const weekday = (isoDate: string) => WEEKDAYS[parseDate(isoDate).getUTCDay()];

export const longDate = (isoLocal: string) => {
  const date = parseDate(isoLocal);
  return `${WEEKDAYS_LONG[date.getUTCDay()]}, ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
};

export const shortDate = (isoDate: string) => {
  const date = parseDate(isoDate);
  return `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
};

export const compassPoint = (degrees: number) => {
  const points = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  return points[Math.round(((degrees % 360) + 360) % 360 / 45) % 8];
};

export const durationLabel = (minutes: number) => `${Math.floor(minutes / 60)} h ${Math.round(minutes % 60)} min`;

export const placeSubtitle = (place: { region?: string; country?: string }) =>
  [place.region, place.country].filter(Boolean).join(', ');
