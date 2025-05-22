// frontend/src/components/WeeklyForecast.tsx
import styles from '../pages/Home.module.css';

type WeeklyForecastProps = {
    days: Array<{
        date: string;
        day: {
            maxtemp_c: number;
            mintemp_c: number;
            condition: {
                text: string;
                icon: string;
            };
        };
    }>;
};

export const WeeklyForecast = ({ days }: WeeklyForecastProps) => {
    const formatDay = (dateString: string, index: number) => {
        const date = new Date(dateString);
        return index === 0 ? 'Hoy' : date.toLocaleDateString('es-ES', { weekday: 'long' });
    };

    return (
        <section style={{ position: 'relative' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: '600', color: '#444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>📆</span> Pronóstico para los próximos 7 días
            </h3>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                {days.map((day, index) => (
                    <div key={day.date} className={styles.forecastDay}>
                        <div style={{ width: '120px' }}>
                            <p style={{ margin: '0', fontWeight: '600', color: index === 0 ? '#007bff' : '#444' }}>
                                {formatDay(day.date, index)}
                            </p>
                            <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#666' }}>
                                {new Date(day.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                            </p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <img
                                src={`https:${day.day.condition.icon}`}
                                alt={day.day.condition.text}
                                style={{ width: '30px', height: '30px', marginRight: '15px' }}
                            />
                            <span style={{ color: '#666' }}>{day.day.condition.text}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontWeight: '600' }}>{day.day.maxtemp_c}°</span>
                            <span style={{ color: '#999' }}>{day.day.mintemp_c}°</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};