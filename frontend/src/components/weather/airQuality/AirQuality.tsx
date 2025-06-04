// frontend/src/components/weather/airQuality/AirQuality.tsx
import styles from '../../../pages/home/Home.module.css';

const getAirQualityText = (aqi: number) => {
  if (aqi <= 50) return 'Buena';
  if (aqi <= 100) return 'Moderada';
  if (aqi <= 150) return 'Poco saludable para grupos sensibles';
  if (aqi <= 200) return 'Poco saludable';
  if (aqi <= 300) return 'Muy poco saludable';
  return 'Peligrosa';
};

const getAirQualityColor = (aqi: number) => {
  if (aqi <= 50) return '#4CAF50';
  if (aqi <= 100) return '#FFC107';
  if (aqi <= 150) return '#FF9800';
  if (aqi <= 200) return '#F44336';
  if (aqi <= 300) return '#9C27B0';
  return '#673AB7';
};

export const AirQuality = ({ aqi }: { aqi: number }) => {
  return (
    <div className={styles.airQualityContainer}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>🌫️</span> Calidad del Aire (AQI: {aqi})
      </h3>
      <div
        className={styles.airQualityBar}
        style={{ backgroundColor: getAirQualityColor(aqi) }}
      >
        <div
          className={styles.airQualityLevel}
          style={{
            width: `${Math.min(100, (aqi / 3))}%`,
            backgroundColor: getAirQualityColor(aqi)
          }}
        />
      </div>
      <p>{getAirQualityText(aqi)}</p>
      <div className={styles.airQualityTips}>
        {aqi > 100 && (
          <p>🔹 Considera limitar actividades al aire libre</p>
        )}
        {aqi > 150 && (
          <p>🔹 Grupos sensibles deben evitar esfuerzos</p>
        )}
      </div>
    </div>
  );
};