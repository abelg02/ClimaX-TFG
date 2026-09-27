import type { Hour } from '../../../types';
import { useWeather } from '../../../context/WeatherContext';
import { TemperatureChart } from '../temperatureChart/TemperatureChart';
import { WeatherIcon } from '../weatherIcon/WeatherIcon';
import { formatTemp, hourOf } from '../../../utils/format';
import styles from './HourlyForecast.module.css';

const COLUMN = 64;

export const HourlyForecast = ({ hours }: { hours: Hour[] }) => {
  const { units } = useWeather();
  const temps = hours.map((h) => h.temperature);
  const rainiest = Math.max(...hours.map((h) => h.precipitationProbability));

  return (
    <section className={`panel ${styles.panel}`} aria-labelledby="hourly-title">
      <header className={styles.header}>
        <h2 id="hourly-title" className="eyebrow">
          Próximas 24 horas
        </h2>
        <p className={`${styles.range} mono`}>
          {formatTemp(Math.min(...temps), units)} – {formatTemp(Math.max(...temps), units)}
          {rainiest > 0 && <span> · lluvia máx. {rainiest} %</span>}
        </p>
      </header>

      <div className={styles.scroller} tabIndex={0} aria-label="Previsión por horas, desplazable">
        <div className={styles.track} style={{ width: hours.length * COLUMN }}>
          <TemperatureChart temperatures={temps} columnWidth={COLUMN} units={units} />
          <ol className={styles.columns}>
            {hours.map((hour, i) => (
              <li key={hour.time} style={{ width: COLUMN }}>
                <WeatherIcon group={hour.condition.group} isDay={hour.isDay} size={30} animated={false} title={hour.condition.description} />
                <span className={styles.rain} style={{ opacity: hour.precipitationProbability >= 10 ? 1 : 0.25 }}>
                  <i style={{ height: `${Math.max(2, hour.precipitationProbability * 0.22)}px` }} />
                  {hour.precipitationProbability}%
                </span>
                <span className={`${styles.hour} ${i === 0 ? styles.now : ''}`}>{i === 0 ? 'Ahora' : hourOf(hour.time)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};
