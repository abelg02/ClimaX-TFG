// frontend/src/components/HourlyForecast.tsx
import styles from '../pages/Home.module.css';

type HourlyForecastProps = {
    hours: Array<{
        time: string;
        temp_c: number;
        condition: {
            icon: string;
            text: string;
        };
    }>;
};

export const HourlyForecast = ({ hours }: HourlyForecastProps) => {
    return (
        <div className={styles.hourlyForecastContainer}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: '600', color: '#444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>🕒</span> Pronóstico por horas (hoy)
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
                            {hour.temp_c}°
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};