import type { Forecast } from '../../../types';
import { Scale, Tile } from '../details/Tile';
import styles from '../details/Details.module.css';

// Índice europeo de calidad del aire (EAQI)
const category = (aqi: number) => {
  if (aqi <= 20) return { label: 'Buena', advice: 'Aire limpio: ideal para actividades al aire libre.' };
  if (aqi <= 40) return { label: 'Razonable', advice: 'Calidad aceptable para la mayoría de personas.' };
  if (aqi <= 60) return { label: 'Moderada', advice: 'Las personas sensibles deberían moderar el esfuerzo.' };
  if (aqi <= 80) return { label: 'Mala', advice: 'Reduce el ejercicio intenso en exteriores.' };
  if (aqi <= 100) return { label: 'Muy mala', advice: 'Evita el esfuerzo al aire libre.' };
  return { label: 'Extremadamente mala', advice: 'Permanece en interiores si es posible.' };
};

export const AirQuality = ({ air }: { air: NonNullable<Forecast['airQuality']> }) => {
  if (air.europeanAqi == null) return null;
  const { label, advice } = category(air.europeanAqi);
  const pollutants: Array<[string, number | undefined]> = [
    ['PM2.5', air.pm25],
    ['PM10', air.pm10],
    ['O₃', air.ozone],
    ['NO₂', air.nitrogenDioxide],
  ];

  return (
    <Tile title="Calidad del aire" value={air.europeanAqi} unit={label} caption={advice} wide>
      <Scale
        position={air.europeanAqi / 100}
        gradient="linear-gradient(90deg, #34d399, #a3e635 25%, #facc15 45%, #fb923c 65%, #ef4444 85%, #a21caf)"
        labels={['0', '20', '40', '60', '80', '100+']}
      />
      <dl className={styles.pollutants}>
        {pollutants.map(([name, value]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd className="mono">
              {value != null ? Math.round(value) : '–'}
              <small> µg/m³</small>
            </dd>
          </div>
        ))}
      </dl>
    </Tile>
  );
};
