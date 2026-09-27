import type { Place } from '../types';

/** El lugar viaja en la URL para que cada previsión se pueda compartir con un enlace. */
export const placeToSearch = (place: Place) => {
  const params = new URLSearchParams({
    lat: place.latitude.toFixed(4),
    lon: place.longitude.toFixed(4),
    name: place.name,
  });
  if (place.region) params.set('region', place.region);
  if (place.country) params.set('country', place.country);
  return `?${params.toString()}`;
};

export const placeFromSearch = (params: URLSearchParams): Place | null => {
  const latitude = Number(params.get('lat'));
  const longitude = Number(params.get('lon'));
  const name = params.get('name');
  if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !params.get('lat')) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return {
    name,
    latitude,
    longitude,
    region: params.get('region') ?? undefined,
    country: params.get('country') ?? undefined,
  };
};

export const samePlace = (a: Place, b: Place) =>
  Math.abs(a.latitude - b.latitude) < 0.01 && Math.abs(a.longitude - b.longitude) < 0.01;
