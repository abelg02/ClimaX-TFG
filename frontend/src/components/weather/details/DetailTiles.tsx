import type { Forecast } from '../../../types';
import { useWeather } from '../../../context/WeatherContext';
import { AirQuality } from '../airQuality/AirQuality';
import { UVIndex } from '../uvIndex/UVIndex';
import { Scale, Tile } from './Tile';
import { compassPoint, durationLabel, formatTemp, hourOf, minutesOf, toUnits } from '../../../utils/format';
import styles from './Details.module.css';

const WindCompass = ({ direction }: { direction: number }) => (
  <svg className={styles.compass} viewBox="0 0 120 120" aria-hidden="true">
    {Array.from({ length: 72 }, (_, i) => (
      <line
        key={i}
        x1="60"
        y1="6"
        x2="60"
        y2={i % 18 === 0 ? 16 : i % 6 === 0 ? 13 : 10}
        stroke={i % 18 === 0 ? 'var(--text)' : 'rgb(255 255 255 / 0.22)'}
        strokeWidth={i % 18 === 0 ? 2 : 1}
        transform={`rotate(${i * 5} 60 60)`}
      />
    ))}
    {[
      ['N', 60, 30],
      ['E', 92, 64],
      ['S', 60, 97],
      ['O', 28, 64],
    ].map(([l, x, y]) => (
      <text key={l} x={x} y={y} textAnchor="middle" fontSize="10" fill="var(--muted)" fontFamily="var(--font-mono)">
        {l}
      </text>
    ))}
    {/* La flecha apunta hacia donde sopla el viento */}
    <g transform={`rotate(${direction + 180} 60 60)`} className={styles.needle}>
      <line x1="60" y1="86" x2="60" y2="30" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M60 22l7 12h-14z" fill="var(--accent)" />
      <circle cx="60" cy="86" r="4" fill="none" stroke="var(--accent)" strokeWidth="2" />
    </g>
  </svg>
);

const SunArc = ({ progress, isDay }: { progress: number; isDay: boolean }) => {
  // Arco de 180° de (16,86) a (184,86) con radio 84
  const angle = Math.PI * (1 - Math.min(1, Math.max(0, progress)));
  const x = 100 + 84 * Math.cos(angle);
  const y = 86 - 84 * Math.sin(angle);
  return (
    <svg className={styles.sunArc} viewBox="0 0 200 96" aria-hidden="true">
      <path d="M16 86A84 84 0 0 1 184 86" fill="none" stroke="rgb(255 255 255 / 0.18)" strokeDasharray="3 5" />
      {isDay && (
        <>
          <path
            d={`M16 86A84 84 0 0 1 ${x} ${y}`}
            fill="none"
            stroke="url(#sun-grad)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={x} cy={y} r="8" fill="#ffc857" style={{ filter: 'drop-shadow(0 0 8px #ffc857)' }} />
        </>
      )}
      <line x1="4" y1="86" x2="196" y2="86" stroke="rgb(255 255 255 / 0.25)" />
      <defs>
        <linearGradient id="sun-grad" x1="0" x2="1">
          <stop offset="0" stopColor="#fb923c" />
          <stop offset="1" stopColor="#ffc857" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const DetailTiles = ({ forecast }: { forecast: Forecast }) => {
  const { units } = useWeather();
  const { current, daily, hourly, airQuality } = forecast;
  const today = daily[0];
  const tomorrow = daily[1];

  const now = minutesOf(current.time);
  const rise = minutesOf(today.sunrise);
  const set = minutesOf(today.sunset);
  const isDaylight = now >= rise && now <= set;
  const nextRise = now > set && tomorrow ? tomorrow.sunrise : today.sunrise;

  const feelsDiff = current.apparentTemperature - current.temperature;
  const feelsCaption =
    Math.abs(feelsDiff) < 1.5
      ? 'Parecida a la temperatura real.'
      : feelsDiff < 0
        ? current.windSpeed > 15
          ? 'El viento hace que parezca más frío.'
          : 'Se nota más fresco de lo que marca el termómetro.'
        : 'La humedad hace que parezca más calor.';

  const next24Rain = hourly.reduce((sum, h) => sum + h.precipitation, 0);
  const maxPop = Math.max(...hourly.map((h) => h.precipitationProbability));
  const visibilityKm = current.visibility / 1000;
  const pressureLabel = current.pressure > 1022 ? 'Alta: tiempo estable' : current.pressure < 1005 ? 'Baja: tiempo inestable' : 'Normal';

  return (
    <section aria-labelledby="details-title">
      <h2 id="details-title" className="visually-hidden">
        Detalles del tiempo actual
      </h2>
      <div className={styles.grid}>
        <Tile
          title="Viento"
          value={Math.round(current.windSpeed)}
          unit="km/h"
          caption={`Del ${compassPoint(current.windDirection)} (${current.windDirection}°) · rachas de ${Math.round(current.windGusts)} km/h`}
        >
          <WindCompass direction={current.windDirection} />
        </Tile>

        <UVIndex uv={current.uvIndex} max={today.uvIndexMax} />

        <Tile
          title={isDaylight ? 'Sol · puesta' : 'Sol · amanecer'}
          value={isDaylight ? hourOf(today.sunset) : hourOf(nextRise)}
          caption={`${durationLabel(set - rise)} de luz · sale a las ${hourOf(today.sunrise)}, se pone a las ${hourOf(today.sunset)}`}
          wide
        >
          <SunArc progress={(now - rise) / (set - rise)} isDay={isDaylight} />
        </Tile>

        {airQuality && <AirQuality air={airQuality} />}

        <Tile title="Humedad" value={current.humidity} unit="%" caption={`Punto de rocío de ${formatTemp(current.dewPoint, units)}.`}>
          <div className={styles.meter}>
            <i style={{ width: `${current.humidity}%` }} />
          </div>
        </Tile>

        <Tile title="Sensación térmica" value={formatTemp(current.apparentTemperature, units)} caption={feelsCaption}>
          <p className={`${styles.delta} mono`}>
            {feelsDiff >= 0 ? '+' : '−'}
            {Math.abs(Math.round(toUnits(current.apparentTemperature, units) - toUnits(current.temperature, units)))}° respecto a la real
          </p>
        </Tile>

        <Tile
          title="Precipitación"
          value={next24Rain.toFixed(next24Rain > 0 && next24Rain < 10 ? 1 : 0)}
          unit="mm"
          caption={maxPop > 0 ? `En las próximas 24 h · probabilidad máxima del ${maxPop} %.` : 'No se espera lluvia en las próximas 24 h.'}
        />

        <Tile title="Presión" value={Math.round(current.pressure)} unit="hPa" caption={pressureLabel}>
          <Scale
            position={(current.pressure - 980) / 60}
            gradient="linear-gradient(90deg, rgb(125 211 252 / .5), rgb(255 255 255 / .15) 50%, rgb(251 191 36 / .5))"
            labels={['980', '1010', '1040']}
          />
        </Tile>

        <Tile
          title="Visibilidad"
          value={visibilityKm >= 10 ? Math.round(visibilityKm) : visibilityKm.toFixed(1)}
          unit="km"
          caption={visibilityKm >= 20 ? 'Excelente, cielo muy limpio.' : visibilityKm >= 10 ? 'Buena.' : visibilityKm >= 2 ? 'Reducida por bruma o lluvia.' : 'Muy baja: niebla.'}
        />

        <Tile title="Nubosidad" value={current.cloudCover} unit="%" caption={current.cloudCover < 20 ? 'Cielo prácticamente despejado.' : current.cloudCover < 70 ? 'Nubes y claros.' : 'Cielo cubierto.'}>
          <div className={styles.meter}>
            <i style={{ width: `${current.cloudCover}%`, background: 'linear-gradient(90deg, #94a3b8, #e2e8f0)' }} />
          </div>
        </Tile>
      </div>
    </section>
  );
};
