// frontend/src/components/WeeklyForecast.tsx
import { useState } from 'react';
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
            avgtemp_c: number;
            maxwind_kph: number;
            totalprecip_mm: number;
            avghumidity: number;
            daily_chance_of_rain: number;
            daily_chance_of_snow: number;
            uv: number;
        };
        astro: {
            sunrise: string;
            sunset: string;
        };
    }>;
};

export const WeeklyForecast = ({ days }: WeeklyForecastProps) => {
    const [expandedDay, setExpandedDay] = useState<string | null>(null);

    const formatDay = (dateString: string, index: number) => {
        const date = new Date(dateString);
        return index === 0 ? 'Hoy' : date.toLocaleDateString('es-ES', { weekday: 'long' });
    };

    const toggleDayExpansion = (date: string) => {
        if (expandedDay === date) {
            setExpandedDay(null);
        } else {
            setExpandedDay(date);
        }
    };

    return (
        <section style={{ position: 'relative' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: '600', color: '#444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>📆</span> Pronóstico para los próximos 7 días
            </h3>
            <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.2)',border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                {days.map((day, index) => (
                    <div key={day.date}>
                        <div
                            className={styles.forecastDay}
                            onClick={() => toggleDayExpansion(day.date)}
                            style={{ cursor: 'pointer' }}
                        >
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
                                <span style={{
                                    transform: expandedDay === day.date ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s ease',
                                    fontSize: '1.2rem'
                                }}>
                                    ▼
                                </span>
                            </div>
                        </div>

                        {expandedDay === day.date && (
                            <div className={styles.dayDetails} style={{
                                padding: '15px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                                animation: 'fadeIn 0.3s ease'
                            }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '15px',
                                    marginBottom: '15px'
                                }}>
                                    <div>
                                        <p style={{ margin: '5px 0', color: '#666' }}>
                                            <strong>🌡 Temperatura media:</strong> {day.day.avgtemp_c}°C
                                        </p>
                                        <p style={{ margin: '5px 0', color: '#666' }}>
                                            <strong>💧 Humedad media:</strong> {day.day.avghumidity}%
                                        </p>
                                        <p style={{ margin: '5px 0', color: '#666' }}>
                                            <strong>☔ Precipitaciones:</strong> {day.day.totalprecip_mm}mm
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '5px 0', color: '#666' }}>
                                            <strong>🌬 Viento máximo:</strong> {day.day.maxwind_kph} km/h
                                        </p>
                                        <p style={{ margin: '5px 0', color: '#666' }}>
                                            <strong>🌧 Prob. lluvia:</strong> {day.day.daily_chance_of_rain}%
                                        </p>
                                        <p style={{ margin: '5px 0', color: '#666' }}>
                                            <strong>❄ Prob. nieve:</strong> {day.day.daily_chance_of_snow}%
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    borderTop: '1px solid #eee',
                                    paddingTop: '10px'
                                }}>
                                    <div>
                                        <p style={{ margin: '5px 0', color: '#666' }}>
                                            <strong>🌅 Amanecer:</strong> {day.astro.sunrise}
                                        </p>
                                        <p style={{ margin: '5px 0', color: '#666' }}>
                                            <strong>🌇 Atardecer:</strong> {day.astro.sunset}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '5px 0', color: '#666' }}>
                                            <strong>☀ Índice UV:</strong> {day.day.uv}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDayExpansion(day.date);
                                    }}
                                    style={{
                                        display: 'block',
                                        margin: '10px auto 0',
                                        padding: '5px 15px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #ddd',
                                        borderRadius: '20px',
                                        color: '#666',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Mostrar menos
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};