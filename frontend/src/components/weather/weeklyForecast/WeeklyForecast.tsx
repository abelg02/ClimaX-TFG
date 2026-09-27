import type { Forecast } from '../../../types';
import { useWeather } from '../../../context/WeatherContext';
import { WeatherIcon } from '../weatherIcon/WeatherIcon';
import { formatTemp, shortDate, weekday } from '../../../utils/format';
import { tempColor } from '../../../utils/weatherStyles';
import styles from './WeeklyForecast.module.css';

/** Siete días con barras de rango: la posición y el color muestran lo cálido o frío de cada día. */
export const WeeklyForecast = ({ forecast }: { forecast: Forecast }) => {
  const { units } = useWeather();
  const days = forecast.daily;
  const low = Math.min(...days.map((d) => d.temperatureMin));
  const high = Math.max(...days.map((d) => d.temperatureMax));
  const span = Math.max(high - low, 1);
  const pos = (t: number) => ((t - low) / span) * 100;
  const now = forecast.current.temperature;

  return (
    <section className={`panel ${styles.panel}`} aria-labelledby="weekly-title">
      <h2 id="weekly-title" className="eyebrow">
        Próximos 7 días
      </h2>
      <ol className={styles.list}>
        {days.map((day, i) => (
          <li key={day.date} className={styles.row}>
            <span className={styles.day}>
              <b>{i === 0 ? 'Hoy' : weekday(day.date)}</b>
              <small className="mono">{shortDate(day.date)}</small>
            </span>
            <span className={styles.icon}>
              <WeatherIcon group={day.condition.group} size={34} animated={false} title={day.condition.description} />
              <small className={`mono ${styles.pop}`}>{day.precipitationProbability >= 20 ? `${day.precipitationProbability}%` : ''}</small>
            </span>
            <span className={`${styles.min} mono`}>{formatTemp(day.temperatureMin, units)}</span>
            <span className={styles.bar} aria-hidden="true">
              <i
                style={{
                  left: `${pos(day.temperatureMin)}%`,
                  width: `${Math.max(pos(day.temperatureMax) - pos(day.temperatureMin), 4)}%`,
                  background: `linear-gradient(90deg, ${tempColor(day.temperatureMin)}, ${tempColor(day.temperatureMax)})`,
                }}
              />
              {i === 0 && <b className={styles.nowDot} style={{ left: `${pos(Math.min(high, Math.max(low, now)))}%` }} />}
            </span>
            <span className={`${styles.max} mono`}>{formatTemp(day.temperatureMax, units)}</span>
            <span className="visually-hidden">
              {day.condition.description}, entre {formatTemp(day.temperatureMin, units)} y {formatTemp(day.temperatureMax, units)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
};
