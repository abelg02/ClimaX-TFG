// frontend/src/components/weather/hourlyForecast/HourlyForecast.tsx
import styles from '../../../pages/home/Home.module.css';

type HourlyForecastProps = {
    hours: Array<{
        time: string;
        temp_c: number;
        humidity: number;
        wind_kph: number;
        condition: {
            icon: string;
            text: string;
        };
    }>;
    displayMode: 'all' | 'temperature' | 'humidity' | 'wind';
};

export const HourlyForecast = ({ hours, displayMode }: HourlyForecastProps) => {
    const getValueToShow = (hour: any) => {
        switch (displayMode) {
            case 'temperature':
                return `${hour.temp_c}°`;
            case 'humidity':
                return `${hour.humidity}%`;
            case 'wind':
                return `${hour.wind_kph} km/h`;
            default:
                return `${hour.temp_c}°`;
        }
    };

    const getTitle = () => {
        switch (displayMode) {
            case 'temperature':
                return '🌡️ Temperatura por horas';
            case 'humidity':
                return '💧 Humedad por horas';
            case 'wind':
                return '🌬️ Viento por horas';
            default:
                return '🕒 Pronóstico por horas (hoy)';
        }
    };

    return (
        <div className={styles.hourlyForecastContainer}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: '600', color: '#444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {getTitle()}
            </h3>
            <div style={{ display: 'flex', overflowX: 'auto', gap: '15px', padding: '15px 5px', scrollbarWidth: 'thin' }}>
                {hours.map((hour) => (
                    <div key={hour.time} className={styles.hourItem}>
                        <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: '600', color: '#444' }}>
                            {new Date(hour.time).getHours()}h
                        </p>
                        <img
                            src={`https:${hour.condition.icon}`}
                            alt={hour.condition.text}
                            style={{ width: '40px', height: '40px', marginBottom: '10px' }}
                        />
                        <p style={{ margin: '0', fontSize: '1.1rem', fontWeight: '600' }}>
                            {getValueToShow(hour)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};