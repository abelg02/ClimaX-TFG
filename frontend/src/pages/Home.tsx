import { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid
} from 'recharts';
import styles from './Home.module.css';

export const Home = () => {
    const [city, setCity] = useState('');
    const [weather, setWeather] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!city.trim()) return;

        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                `https://api.weatherapi.com/v1/forecast.json?key=2492e2fb53484460909160443252005&q=${city}&days=7&lang=es`
            );
            if (!response.ok) {
                throw new Error('Ciudad no encontrada');
            }
            const data = await response.json();
            setWeather(data);
        } catch (err) {
            setError('No se pudo encontrar el clima para esta ciudad');
            setWeather(null);
        } finally {
            setLoading(false);
        }
    };

    const formatDay = (dateString: string, index: number) => {
        const date = new Date(dateString);
        return index === 0 ? 'Hoy' : date.toLocaleDateString('es-ES', { weekday: 'long' });
    };

    return (
        <div className={styles.container}>
            {/* Header con búsqueda */}
            <header className={styles.header}>
                <div style={{ position: 'absolute', top: '15px', left: '20px', fontSize: '1.8rem' }}>🌤</div>

                <h1 style={{ margin: '0 0 20px 0', fontSize: '2.2rem', fontWeight: '600' }}>ClimaX</h1>

                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Buscar ciudad..."
                        className={styles.searchInput}
                    />
                    <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>🔍</div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.searchButton}
                    >
                        {loading ? <>⏳ Buscando...</> : <>🔍 Buscar</>}
                    </button>
                </form>
            </header>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            {weather && (
                <main>
                    {/* Sección de clima actual */}
                    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                        <div className={styles.weatherCard}>
                            <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '1.5rem' }}>🌡️</div>

                            <div style={{ marginBottom: '20px' }}>
                                <h2 style={{ margin: '0 0 5px 0', fontSize: '1.8rem', fontWeight: '600' }}>
                                    {weather.location.name}, {weather.location.country}
                                </h2>
                                <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                                    {weather.location.region} • {new Date(weather.current.last_updated).toLocaleString('es-ES', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                                </p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                                <img
                                    src={`https:${weather.current.condition.icon}`}
                                    alt={weather.current.condition.text}
                                    style={{ width: '80px', height: '80px' }}
                                />
                                <div style={{ marginLeft: '20px' }}>
                                    <p style={{ margin: '0', fontSize: '3rem', fontWeight: '300', lineHeight: '1' }}>
                                        {weather.current.temp_c}°
                                        <span style={{ fontSize: '1.5rem', verticalAlign: 'top' }}>C</span>
                                    </p>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '1.1rem', color: '#666' }}>
                                        {weather.current.condition.text}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: 'auto' }}>
                                <div>
                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                        <span style={{ marginRight: '5px' }}>🌡️</span>
                                        <strong>Sensación:</strong> {weather.current.feelslike_c}°C
                                    </p>
                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                        <span style={{ marginRight: '5px' }}>💧</span>
                                        <strong>Humedad:</strong> {weather.current.humidity}%
                                    </p>
                                </div>
                                <div>
                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                        <span style={{ marginRight: '5px' }}>🌬️</span>
                                        <strong>Viento:</strong> {weather.current.wind_kph} km/h {weather.current.wind_dir}
                                    </p>
                                    <p style={{ margin: '5px 0', color: '#666' }}>
                                        <span style={{ marginRight: '5px' }}>📊</span>
                                        <strong>Presión:</strong> {weather.current.pressure_mb} mb
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Gráfica de temperatura horaria */}
                        <div className={styles.chartContainer}>
                            <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '1.5rem' }}>📈</div>

                            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>⏱</span> Temperatura por horas
                            </h3>
                            <div style={{ height: '250px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={weather.forecast.forecastday[0].hour.map((hour: any) => ({
                                            time: `${new Date(hour.time).getHours()}h`,
                                            temp: hour.temp_c
                                        }))}
                                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                        <XAxis dataKey="time" tick={{ fill: '#666' }} tickLine={{ stroke: '#eee' }} />
                                        <YAxis unit="°C" tick={{ fill: '#666' }} tickLine={{ stroke: '#eee' }} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                border: 'none'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="temp"
                                            stroke="#007bff"
                                            strokeWidth={2}
                                            dot={{ r: 4 }}
                                            activeDot={{ r: 6, stroke: '#007bff', strokeWidth: 2, fill: 'white' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </section>

                    {/* Pronóstico por horas */}
                    <section className={styles.hourlyForecastContainer}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: '600', color: '#444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>🕒</span> Pronóstico por horas (hoy)
                        </h3>
                        <div style={{ display: 'flex', overflowX: 'auto', gap: '15px', padding: '15px 5px', scrollbarWidth: 'thin' }}>
                            {weather.forecast.forecastday[0].hour.map((hour: any) => (
                                <div key={hour.time_epoch} className={styles.hourItem}>
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
                    </section>

                    {/* Pronóstico semanal */}
                    <section style={{ position: 'relative' }}>
                        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', fontWeight: '600', color: '#444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>📆</span> Pronóstico para los próximos 7 días
                        </h3>
                        <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                            {weather.forecast.forecastday.map((day: any, index: number) => (
                                <div key={day.date_epoch} className={styles.forecastDay}>
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
                </main>
            )}
        </div>
    );
};