// frontend/src/context/WeatherContext.tsx
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { getWeatherForecast } from '../services/weatherService';
import type { WeatherData } from '../services/weatherService';

type WeatherContextType = {
  weatherData: WeatherData | null;
  loading: boolean;
  error: string | null;
  displayMode: 'all' | 'temperature' | 'humidity' | 'weekly';
  fetchWeather: (city: string) => Promise<void>;
  resetWeather: () => void;
  setDisplayMode: (mode: 'all' | 'temperature' | 'humidity' | 'weekly') => void;
};

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'all' | 'temperature' | 'humidity' | 'weekly'>('all');

  const fetchWeather = async (city: string) => {
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getWeatherForecast(city);
      setWeatherData(data);
    } catch (err) {
      setError('No se pudo encontrar el clima para esta ciudad');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  const resetWeather = () => {
    setWeatherData(null);
    setLoading(false);
    setError(null);
    setDisplayMode('all');
  };

  return (
    <WeatherContext.Provider value={{
      weatherData,
      loading,
      error,
      displayMode,
      fetchWeather,
      resetWeather,
      setDisplayMode
    }}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};