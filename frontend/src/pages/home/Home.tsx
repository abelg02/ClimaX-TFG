import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWeather } from '../../context/WeatherContext';
import { useForecast } from '../../hooks/useForecast';
import { CurrentWeather } from '../../components/weather/currentWeather/CurrentWeather';
import { HourlyForecast } from '../../components/weather/hourlyForecast/HourlyForecast';
import { WeeklyForecast } from '../../components/weather/weeklyForecast/WeeklyForecast';
import { WeatherAlerts } from '../../components/weather/weatherAlerts/WeatherAlerts';
import { DetailTiles } from '../../components/weather/details/DetailTiles';
import { PlacesStrip } from '../../components/places/PlacesStrip';
import { WelcomeScreen } from '../welcomeScreen/WelcomeScreen';
import { DEFAULT_PLACE } from '../../utils/cities';
import { placeFromSearch } from '../../utils/placeUrl';
import { getSkyTheme } from '../../utils/weatherStyles';
import { formatTemp } from '../../utils/format';
import styles from './Home.module.css';

export const Home = () => {
  const [params] = useSearchParams();
  const { lastPlace, rememberPlace, setSky, units } = useWeather();
  const urlPlace = useMemo(() => placeFromSearch(params), [params]);
  const place = urlPlace ?? lastPlace ?? DEFAULT_PLACE;
  const { data, error, reload } = useForecast(place);

  useEffect(() => {
    if (!data) return;
    rememberPlace(place);
    const { group } = data.current.condition;
    setSky({ group, isDay: data.current.isDay, theme: getSkyTheme(group, data.current.isDay) });
    document.title = `${place.name} · ${formatTemp(data.current.temperature, units)} ${data.current.condition.description} — ClimaX`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, units]);

  if (error) return <WelcomeScreen message={error} onRetry={reload} />;
  if (!data) return <HomeSkeleton />;

  return (
    <div className={styles.dashboard}>
      <div className={styles.hero}>
        <CurrentWeather place={place} forecast={data} />
      </div>
      <div className={styles.week}>
        <WeeklyForecast forecast={data} />
      </div>
      <div className={styles.hours}>
        <HourlyForecast hours={data.hourly} />
      </div>
      <div className={styles.full}>
        <WeatherAlerts forecast={data} />
      </div>
      <div className={styles.full}>
        <DetailTiles forecast={data} />
      </div>
      <div className={styles.full}>
        <PlacesStrip current={place} />
      </div>
    </div>
  );
};

const HomeSkeleton = () => (
  <div className={styles.dashboard} aria-busy="true" aria-label="Cargando previsión">
    <div className={`${styles.hero} skeleton`} style={{ minHeight: 380 }} />
    <div className={`${styles.week} skeleton`} style={{ minHeight: 380 }} />
    <div className={`${styles.hours} skeleton`} style={{ minHeight: 220 }} />
    <div className={`${styles.full} skeleton`} style={{ minHeight: 200 }} />
  </div>
);
