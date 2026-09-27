// Contrato de la API: refleja los records de com.example.climaxtfg.model

export type ConditionGroup =
  | 'clear'
  | 'partly'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'storm';

export interface Condition {
  code: number;
  description: string;
  group: ConditionGroup;
}

export interface Place {
  name: string;
  region?: string;
  country?: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
}

export interface Forecast {
  location: {
    latitude: number;
    longitude: number;
    elevation: number;
    timezone: string;
    utcOffsetSeconds: number;
  };
  current: {
    time: string;
    temperature: number;
    apparentTemperature: number;
    humidity: number;
    dewPoint: number;
    precipitation: number;
    condition: Condition;
    isDay: boolean;
    cloudCover: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    windGusts: number;
    uvIndex: number;
    visibility: number;
  };
  hourly: Array<{
    time: string;
    temperature: number;
    precipitationProbability: number;
    precipitation: number;
    windSpeed: number;
    condition: Condition;
    isDay: boolean;
  }>;
  daily: Array<{
    date: string;
    condition: Condition;
    temperatureMax: number;
    temperatureMin: number;
    sunrise: string;
    sunset: string;
    uvIndexMax: number;
    precipitationSum: number;
    precipitationProbability: number;
    windSpeedMax: number;
  }>;
  airQuality?: {
    europeanAqi?: number;
    pm10?: number;
    pm25?: number;
    nitrogenDioxide?: number;
    ozone?: number;
  };
}

export type Hour = Forecast['hourly'][number];
export type Day = Forecast['daily'][number];

export interface CityTemperature {
  name: string;
  latitude: number;
  longitude: number;
  temperature: number;
  windSpeed: number;
  condition: Condition;
  isDay: boolean;
}

export type Units = 'c' | 'f';
