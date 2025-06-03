import { useEffect, useState } from 'react';
import styles from './Home.module.css';
import { SearchBar } from '../components/SearchBar';
import { CurrentWeather } from '../components/CurrentWeather';
import { TemperatureChart } from '../components/TemperatureChart';
import { HourlyForecast } from '../components/HourlyForecast';
import { WeeklyForecast } from '../components/WeeklyForecast';
import { useWeather } from '../context/WeatherContext';
import { ErrorMessage } from '../components/ErrorMessage';
import { AirQuality } from '../components/AirQuality';
import { UVIndex } from '../components/UVIndex';
import { WeatherAlerts } from '../components/WeatherAlerts';
import { getWeatherStyles } from '../utils/weatherStyles';
import { WelcomeScreen } from '../components/WelcomeScreen/WelcomeScreen';
import { Menu } from '../components/Menu/Menu';
import { useLocation } from 'react-router-dom';

export const Home = () => {
  const { weatherData, loading, error, fetchWeather, resetWeather, displayMode, setError } = useWeather();
  const [showWelcome, setShowWelcome] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Si venimos del mapa con una ciudad, buscamos esa ciudad automáticamente
    if (location.state?.fromMap && location.state?.cityData) {
      const { name } = location.state.cityData;
      handleSearch(name);
    }
  }, [location.state]);

  const handleSearch = async (city: string) => {
    try {
      setLocalError(null);
      await fetchWeather(city);
      setShowWelcome(false);
    } catch (err) {
      setLocalError('No se pudo encontrar el clima para esta ciudad');
      setShowWelcome(true);
    }
  };

  useEffect(() => {
    if (weatherData) {
      const weatherCode = weatherData.current.condition.code;
      const isDay = weatherData.current.is_day;
      const weatherStyles = getWeatherStyles(weatherCode, isDay);

      document.documentElement.style.setProperty('--bg-gradient', weatherStyles.background);
      document.documentElement.style.setProperty('--text-color', '#333333');
      document.documentElement.style.setProperty('--card-bg', weatherStyles.cardBg);
    } else {
      document.documentElement.style.setProperty('--text-color', '#333333');
    }
  }, [weatherData]);

  const clearError = () => {
    setLocalError(null);
    setError(null);
  };

  if (showWelcome || !weatherData) {
    return (
      <div className={styles.container}>
        <SearchBar onSearch={handleSearch} loading={loading} />
        <Menu />
        {(error || localError) && (
          <ErrorMessage message={error || localError || ''} onClose={clearError} />
        )}
        <WelcomeScreen
          onCityClick={handleSearch}
          showReset={false}
          error={error || localError || ''}
          onClearError={clearError}
        />
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ color: '#333333' }}>
      <SearchBar onSearch={handleSearch} loading={loading} />
      <Menu />
      {(error || localError) && (
        <ErrorMessage message={error || localError || ''} onClose={clearError} />
      )}

      <main style={{ color: '#333333' }}>
        {displayMode === 'all' || displayMode === 'temperature' ? (
          <section style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '30px',
            color: '#333333'
          }}>
            <div>
              <CurrentWeather data={weatherData} />
              {weatherData?.current?.air_quality && (
                <AirQuality aqi={weatherData.current.air_quality['us-epa-index']} />
              )}
              {weatherData?.current?.uv && (
                <UVIndex uv={weatherData.current.uv} />
              )}
            </div>
            <TemperatureChart
              hourlyData={weatherData.forecast.forecastday[0].hour.map((hour) => ({
                time: `${new Date(hour.time).getHours()}h`,
                temp: hour.temp_c
              }))}
            />
          </section>
        ) : null}

        {(displayMode === 'all' || displayMode === 'humidity') && (
          <HourlyForecast
            hours={weatherData.forecast.forecastday[0].hour}
            displayMode={displayMode}
          />
        )}

        {(displayMode === 'all' || displayMode === 'weekly') && (
          <WeeklyForecast days={weatherData.forecast.forecastday} />
        )}

        {displayMode === 'all' && (
          <WeatherAlerts weatherData={weatherData} />
        )}
      </main>
    </div>
  );
};