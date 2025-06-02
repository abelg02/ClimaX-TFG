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
        setExpandedDay(expandedDay === date ? null : date);
    };

    const getWeatherIcon = (condition: string) => {
        const conditionLower = condition.toLowerCase();
        if (conditionLower.includes('sol') || conditionLower.includes('clear')) return '☀️';
        if (conditionLower.includes('nubl') || conditionLower.includes('cloud')) return '☁️';
        if (conditionLower.includes('lluv') || conditionLower.includes('rain')) return '🌧️';
        if (conditionLower.includes('nieve') || conditionLower.includes('snow')) return '❄️';
        if (conditionLower.includes('torment') || conditionLower.includes('storm')) return '⛈️';
        if (conditionLower.includes('niebla') || conditionLower.includes('fog')) return '🌫️';
        return '🌤️';
    };

    const getUVLevel = (uv: number) => {
        if (uv <= 2) return 'Bajo';
        if (uv <= 5) return 'Moderado';
        if (uv <= 7) return 'Alto';
        if (uv <= 10) return 'Muy alto';
        return 'Extremo';
    };

    return (
        <section className={styles.weeklyForecast}>
            <div className={styles.forecastContainer}>
                        <h3 className={styles.sectionTitle}>
                            <span>📆</span> Pronóstico para los próximos 7 días
                        </h3>
                {days.map((day, index) => (
                    <div key={day.date} className={styles.forecastCard}>
                        <div
                            className={styles.forecastHeader}
                            onClick={() => toggleDayExpansion(day.date)}
                        >
                            <div className={styles.dayInfo}>
                                <span className={index === 0 ? styles.today : styles.dayName}>
                                    {formatDay(day.date, index)}
                                </span>
                                <span className={styles.date}>
                                    {new Date(day.date).toLocaleDateString('es-ES', {
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </span>
                            </div>

                            <div className={styles.weatherCondition}>
                                <img
                                    src={`https:${day.day.condition.icon}`}
                                    alt={day.day.condition.text}
                                    className={styles.weatherIcon}
                                />
                                <span className={styles.conditionText}>
                                    {day.day.condition.text}
                                </span>
                            </div>

                            <div className={styles.temperatures}>
                                <span className={styles.maxTemp}>{day.day.maxtemp_c}°</span>
                                <span className={styles.minTemp}>{day.day.mintemp_c}°</span>
                                <span className={styles.expandIcon}>
                                    {expandedDay === day.date ? '▲' : '▼'}
                                </span>
                            </div>
                        </div>

                        {expandedDay === day.date && (
                            <div className={styles.dayDetails}>
                                <div className={styles.detailGrid}>
                                    {/* Primera columna */}
                                    <div className={styles.detailColumn}>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailIcon}>🌡️</span>
                                            <div>
                                                <span className={styles.detailLabel}>Temp. media</span>
                                                <span className={styles.detailValue}>
                                                    {day.day.avgtemp_c}°C
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.detailItem}>
                                            <span className={styles.detailIcon}>💧</span>
                                            <div>
                                                <span className={styles.detailLabel}>Humedad</span>
                                                <span className={styles.detailValue}>
                                                    {day.day.avghumidity}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.detailItem}>
                                            <span className={styles.detailIcon}>☔</span>
                                            <div>
                                                <span className={styles.detailLabel}>Precipitación</span>
                                                <span className={styles.detailValue}>
                                                    {day.day.totalprecip_mm}mm
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Segunda columna */}
                                    <div className={styles.detailColumn}>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailIcon}>🌬️</span>
                                            <div>
                                                <span className={styles.detailLabel}>Viento máx.</span>
                                                <span className={styles.detailValue}>
                                                    {day.day.maxwind_kph} km/h
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.detailItem}>
                                            <span className={styles.detailIcon}>🌧️</span>
                                            <div>
                                                <span className={styles.detailLabel}>Prob. lluvia</span>
                                                <span className={styles.detailValue}>
                                                    {day.day.daily_chance_of_rain}%
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.detailItem}>
                                            <span className={styles.detailIcon}>❄️</span>
                                            <div>
                                                <span className={styles.detailLabel}>Prob. nieve</span>
                                                <span className={styles.detailValue}>
                                                    {day.day.daily_chance_of_snow}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tercera columna */}
                                    <div className={styles.detailColumn}>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailIcon}>☀️</span>
                                            <div>
                                                <span className={styles.detailLabel}>Índice UV</span>
                                                <span className={styles.detailValue}>
                                                    {day.day.uv} ({getUVLevel(day.day.uv)})
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.detailItem}>
                                            <span className={styles.detailIcon}>🌅</span>
                                            <div>
                                                <span className={styles.detailLabel}>Amanecer</span>
                                                <span className={styles.detailValue}>
                                                    {day.astro.sunrise}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.detailItem}>
                                            <span className={styles.detailIcon}>🌇</span>
                                            <div>
                                                <span className={styles.detailLabel}>Atardecer</span>
                                                <span className={styles.detailValue}>
                                                    {day.astro.sunset}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDayExpansion(day.date);
                                    }}
                                    className={styles.collapseButton}
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