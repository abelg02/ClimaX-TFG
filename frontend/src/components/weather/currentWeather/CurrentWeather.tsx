import type { Forecast, Place, Units } from '../../../types';
import { useWeather } from '../../../context/WeatherContext';
import { WeatherIcon } from '../weatherIcon/WeatherIcon';
import { formatTemp, hourOf, longDate, placeSubtitle, toUnits } from '../../../utils/format';
import styles from './CurrentWeather.module.css';

type Props = { place: Place; forecast: Forecast };

/** Frase corta que resume las próximas horas. */
const summarize = (forecast: Forecast, units: Units) => {
  const today = forecast.daily[0];
  const hours = forecast.hourly;
  const parts: string[] = [];

  const peak = hours.slice(0, 14).reduce((a, b) => (b.temperature > a.temperature ? b : a), hours[0]);
  if (peak && peak.temperature > forecast.current.temperature + 1) {
    parts.push(`Subirá hasta ${formatTemp(peak.temperature, units)} hacia las ${hourOf(peak.time)}.`);
  } else {
    parts.push(`Máxima de ${formatTemp(today.temperatureMax, units)} y mínima de ${formatTemp(today.temperatureMin, units)} hoy.`);
  }

  const wet = hours.find((h) => h.precipitationProbability >= 50);
  if (wet) {
    parts.push(
      wet === hours[0]
        ? `Probabilidad de lluvia alta ahora mismo (${wet.precipitationProbability} %).`
        : `Lluvia probable a partir de las ${hourOf(wet.time)} (${wet.precipitationProbability} %).`,
    );
  } else {
    parts.push('Sin lluvia a la vista en las próximas 24 horas.');
  }

  if (forecast.current.windGusts >= 50) {
    parts.push(`Rachas de hasta ${Math.round(forecast.current.windGusts)} km/h.`);
  }
  return parts.join(' ');
};

export const CurrentWeather = ({ place, forecast }: Props) => {
  const { units, isFavorite, toggleFavorite } = useWeather();
  const { current, daily } = forecast;
  const saved = isFavorite(place);
  const subtitle = placeSubtitle(place);

  return (
    <section className={`panel ${styles.hero}`} aria-labelledby="place-name">
      <div className={styles.top}>
        <p className="eyebrow">
          Ahora · {longDate(current.time)} · {hourOf(current.time)} hora local
        </p>
        <button
          type="button"
          className={`${styles.save} ${saved ? styles.saved : ''}`}
          onClick={() => toggleFavorite(place)}
          aria-pressed={saved}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="m12 3.5 2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9z"
              fill={saved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          {saved ? 'Guardado' : 'Guardar'}
        </button>
      </div>

      <h1 id="place-name" className={styles.place}>
        {place.name}
      </h1>
      {subtitle && <p className={styles.region}>{subtitle}</p>}

      <div className={styles.reading}>
        <p className={styles.temp} aria-label={`${Math.round(toUnits(current.temperature, units))} grados`}>
          {Math.round(toUnits(current.temperature, units))}
          <span className={styles.deg}>°</span>
        </p>
        <div className={styles.iconWrap}>
          <WeatherIcon group={current.condition.group} isDay={current.isDay} size={148} />
        </div>
      </div>

      <p className={styles.condition}>{current.condition.description}</p>
      <p className={`${styles.meta} mono`}>
        <span>Sensación {formatTemp(current.apparentTemperature, units)}</span>
        <span>Máx {formatTemp(daily[0].temperatureMax, units)}</span>
        <span>Mín {formatTemp(daily[0].temperatureMin, units)}</span>
      </p>

      <p className={styles.summary}>{summarize(forecast, units)}</p>
    </section>
  );
};
