import type { CityTemperature, Forecast, Place } from '../types';
import { describeCondition } from '../utils/weatherStyles';
import { MAP_CITIES } from '../utils/cities';

/**
 * Implementación en el navegador del mismo contrato que expone la API Spring
 * Boot (ver ForecastMapper.java). Solo se usa cuando el backend no responde.
 */

const FORECAST = 'https://api.open-meteo.com/v1/forecast';
const AIR = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const GEOCODING = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE = 'https://nominatim.openstreetmap.org/reverse';

const CURRENT =
  'temperature_2m,relative_humidity_2m,apparent_temperature,dew_point_2m,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m';
const HOURLY = 'temperature_2m,precipitation_probability,precipitation,weather_code,is_day,wind_speed_10m,uv_index,visibility';
const DAILY =
  'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = any;

async function getJson(url: string, signal?: AbortSignal): Promise<Json> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}`);
  return res.json();
}

export async function forecast(lat: number, lon: number, signal?: AbortSignal): Promise<Forecast> {
  const q = `latitude=${lat}&longitude=${lon}`;
  const [f, air] = await Promise.all([
    getJson(`${FORECAST}?${q}&current=${CURRENT}&hourly=${HOURLY}&daily=${DAILY}&timezone=auto&forecast_days=7`, signal),
    getJson(`${AIR}?${q}&current=european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone&timezone=auto`, signal).catch(
      () => null,
    ),
  ]);

  const c = f.current;
  const h = f.hourly;
  const d = f.daily;
  const currentHour = `${c.time.slice(0, 13)}:00`;
  const start = Math.max(0, h.time.findIndex((t: string) => t >= currentHour));

  return {
    location: {
      latitude: f.latitude,
      longitude: f.longitude,
      elevation: f.elevation,
      timezone: f.timezone,
      utcOffsetSeconds: f.utc_offset_seconds,
    },
    current: {
      time: c.time,
      temperature: c.temperature_2m,
      apparentTemperature: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      dewPoint: c.dew_point_2m,
      precipitation: c.precipitation,
      condition: describeCondition(c.weather_code),
      isDay: c.is_day === 1,
      cloudCover: c.cloud_cover,
      pressure: c.pressure_msl,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      windGusts: c.wind_gusts_10m,
      uvIndex: h.uv_index[start] ?? 0,
      visibility: h.visibility[start] ?? 0,
    },
    hourly: h.time.slice(start, start + 24).map((time: string, j: number) => {
      const i = start + j;
      return {
        time,
        temperature: h.temperature_2m[i],
        precipitationProbability: h.precipitation_probability[i] ?? 0,
        precipitation: h.precipitation[i] ?? 0,
        windSpeed: h.wind_speed_10m[i],
        condition: describeCondition(h.weather_code[i]),
        isDay: h.is_day[i] === 1,
      };
    }),
    daily: d.time.map((date: string, i: number) => ({
      date,
      condition: describeCondition(d.weather_code[i]),
      temperatureMax: d.temperature_2m_max[i],
      temperatureMin: d.temperature_2m_min[i],
      sunrise: d.sunrise[i],
      sunset: d.sunset[i],
      uvIndexMax: d.uv_index_max[i] ?? 0,
      precipitationSum: d.precipitation_sum[i] ?? 0,
      precipitationProbability: d.precipitation_probability_max[i] ?? 0,
      windSpeedMax: d.wind_speed_10m_max[i],
    })),
    airQuality: air?.current
      ? {
          europeanAqi: air.current.european_aqi ?? undefined,
          pm10: air.current.pm10 ?? undefined,
          pm25: air.current.pm2_5 ?? undefined,
          nitrogenDioxide: air.current.nitrogen_dioxide ?? undefined,
          ozone: air.current.ozone ?? undefined,
        }
      : undefined,
  };
}

export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const data = await getJson(
    `${GEOCODING}?name=${encodeURIComponent(query.trim())}&count=8&language=es&format=json`,
    signal,
  );
  return (data.results ?? []).map((r: Json) => ({
    name: r.name,
    region: r.admin1,
    country: r.country,
    countryCode: r.country_code,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export async function reversePlace(lat: number, lon: number, signal?: AbortSignal): Promise<Place> {
  const fallback: Place = { name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`, latitude: lat, longitude: lon };
  try {
    const data = await getJson(`${REVERSE}?lat=${lat}&lon=${lon}&format=jsonv2&zoom=10&accept-language=es`, signal);
    const a = data.address ?? {};
    return {
      name: a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? a.state ?? fallback.name,
      region: a.state ?? a.province,
      country: a.country,
      countryCode: a.country_code?.toUpperCase(),
      latitude: lat,
      longitude: lon,
    };
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    return fallback;
  }
}

export async function mapCities(signal?: AbortSignal): Promise<CityTemperature[]> {
  const lats = MAP_CITIES.map((c) => c.latitude).join(',');
  const lons = MAP_CITIES.map((c) => c.longitude).join(',');
  const data: Json[] = await getJson(
    `${FORECAST}?latitude=${lats}&longitude=${lons}&current=temperature_2m,weather_code,is_day,wind_speed_10m&timezone=auto`,
    signal,
  );
  return MAP_CITIES.map((city, i) => ({
    ...city,
    temperature: data[i].current.temperature_2m,
    windSpeed: data[i].current.wind_speed_10m,
    condition: describeCondition(data[i].current.weather_code),
    isDay: data[i].current.is_day === 1,
  }));
}
