import type { Forecast, Units } from '../../../types';
import { useWeather } from '../../../context/WeatherContext';
import { formatTemp, hourOf } from '../../../utils/format';
import styles from './WeatherAlerts.module.css';

type Alert = { level: 'warn' | 'danger'; title: string; detail: string };

/** Avisos calculados a partir de la previsión de las próximas 24 horas. */
const buildAlerts = (forecast: Forecast, units: Units): Alert[] => {
  const today = forecast.daily[0];
  const alerts: Alert[] = [];

  const storm = forecast.hourly.find((h) => h.condition.group === 'storm');
  if (storm) {
    alerts.push({ level: 'danger', title: 'Tormentas', detail: `Posibles tormentas a partir de las ${hourOf(storm.time)}.` });
  }
  if (today.temperatureMax >= 38) {
    alerts.push({ level: 'danger', title: 'Calor extremo', detail: `Máxima de ${formatTemp(today.temperatureMax, units)}. Evita el sol en las horas centrales.` });
  } else if (today.temperatureMax >= 34) {
    alerts.push({ level: 'warn', title: 'Calor intenso', detail: `Máxima de ${formatTemp(today.temperatureMax, units)}. Hidrátate bien.` });
  }
  if (today.temperatureMin <= 0) {
    alerts.push({ level: 'warn', title: 'Heladas', detail: `Mínima de ${formatTemp(today.temperatureMin, units)}. Cuidado con el hielo en la calzada.` });
  }
  const gusts = Math.max(forecast.current.windGusts, today.windSpeedMax);
  if (gusts >= 70) {
    alerts.push({ level: 'danger', title: 'Viento muy fuerte', detail: `Rachas de hasta ${Math.round(gusts)} km/h.` });
  } else if (gusts >= 50) {
    alerts.push({ level: 'warn', title: 'Viento fuerte', detail: `Rachas de hasta ${Math.round(gusts)} km/h.` });
  }
  const heavy = forecast.hourly.find((h) => h.precipitation >= 7);
  if (heavy) {
    alerts.push({ level: 'warn', title: 'Lluvia intensa', detail: `${heavy.precipitation.toFixed(1)} mm/h previstos a las ${hourOf(heavy.time)}.` });
  }
  if (today.uvIndexMax >= 8) {
    alerts.push({ level: 'warn', title: 'Radiación UV muy alta', detail: `Índice ${Math.round(today.uvIndexMax)}. Usa protección solar.` });
  }
  return alerts;
};

export const WeatherAlerts = ({ forecast }: { forecast: Forecast }) => {
  const { units } = useWeather();
  const alerts = buildAlerts(forecast, units);
  if (!alerts.length) return null;

  return (
    <section className={styles.alerts} aria-label="Avisos meteorológicos">
      {alerts.map((a) => (
        <article key={a.title} className={`panel ${styles.alert} ${styles[a.level]}`}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12 3.5 2.8 19.5h18.4z" strokeLinejoin="round" />
            <path d="M12 10v4.5M12 17v.3" strokeLinecap="round" />
          </svg>
          <div>
            <strong>{a.title}</strong>
            <p>{a.detail}</p>
          </div>
        </article>
      ))}
    </section>
  );
};
