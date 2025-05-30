// frontend/src/components/CurrentWeather.tsx
import { useNavigate } from 'react-router-dom';
import styles from '../pages/Home.module.css';

type CurrentWeatherProps = {
    data: {
        location: {
            name: string;
            country: string;
            region: string;
            localtime: string;
        };
        current: {
            temp_c: number;
            condition: {
                text: string;
                icon: string;
            };
            feelslike_c: number;
            humidity: number;
            wind_kph: number;
            wind_dir: string;
            pressure_mb: number;
            last_updated: string;
        };
    };
};

export const CurrentWeather = ({ data }: CurrentWeatherProps) => {
    const navigate = useNavigate();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleRegionClick = () => {
      navigate(`/map/${encodeURIComponent(data.location.region)}`, {
        state: {
          cityData: {
            name: data.location.name,
            lat: data.location.lat,
            lon: data.location.lon
          }
        }
      });
    };

    return (
            <div className={styles.weatherCard}>
                <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '1.5rem' }}>🌡️</div>

                <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ margin: '0 0 5px 0', fontSize: '1.8rem', fontWeight: '600' }}>
                        {data.location.name}, {data.location.country}
                    </h2>
                    <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                        <span
                            onClick={handleRegionClick}
                            style={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        {data.location.region}
                    </span> • {formatDate(data.current.last_updated)}
                    </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <img
                    src={`https:${data.current.condition.icon}`}
                    alt={data.current.condition.text}
                    style={{ width: '80px', height: '80px' }}
                />
                <div style={{ marginLeft: '20px' }}>
                    <p style={{ margin: '0', fontSize: '3rem', fontWeight: '300', lineHeight: '1' }}>
                        {data.current.temp_c}°
                        <span style={{ fontSize: '1.5rem', verticalAlign: 'top' }}>C</span>
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '1.1rem', color: '#666' }}>
                        {data.current.condition.text}
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: 'auto' }}>
                <div>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                        <span style={{ marginRight: '5px' }}>🌡️</span>
                        <strong>Sensación:</strong> {data.current.feelslike_c}°C
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                        <span style={{ marginRight: '5px' }}>💧</span>
                        <strong>Humedad:</strong> {data.current.humidity}%
                    </p>
                </div>
                <div>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                        <span style={{ marginRight: '5px' }}>🌬️</span>
                        <strong>Viento:</strong> {data.current.wind_kph} km/h {data.current.wind_dir}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                        <span style={{ marginRight: '5px' }}>📊</span>
                        <strong>Presión:</strong> {data.current.pressure_mb} mb
                    </p>
                </div>
            </div>
        </div>
    );
};