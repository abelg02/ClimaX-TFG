import { useState } from 'react';
import { getCurrentWeather } from '../services/weatherService';

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
            const data = await getCurrentWeather(city);
            setWeather(data);
        } catch (err) {
            setError('No se pudo encontrar el clima para esta ciudad');
            setWeather(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h1>ClimaX</h1>

            <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Buscar ciudad..."
                    style={{ padding: '8px', width: '70%', marginRight: '10px' }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '8px 15px' }}
                >
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {weather && (
                <div style={{
                    border: '1px solid #ccc',
                    padding: '20px',
                    borderRadius: '8px',
                    backgroundColor: '#f9f9f9'
                }}>
                    <h2>{weather.location.name}, {weather.location.country}</h2>
                    <p>Localidad: {weather.location.region}</p>
                    <p>Última actualización: {weather.current.last_updated}</p>

                    <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                        <div>
                            <img
                                src={`https:${weather.current.condition.icon}`}
                                alt={weather.current.condition.text}
                            />
                        </div>
                        <div style={{ marginLeft: '20px' }}>
                            <h3 style={{ margin: 0 }}>{weather.current.temp_c}°C</h3>
                            <p>{weather.current.condition.text}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        <div>
                            <p><strong>Sensación térmica:</strong> {weather.current.feelslike_c}°C</p>
                            <p><strong>Humedad:</strong> {weather.current.humidity}%</p>
                        </div>
                        <div>
                            <p><strong>Viento:</strong> {weather.current.wind_kph} km/h ({weather.current.wind_dir})</p>
                            <p><strong>Presión:</strong> {weather.current.pressure_mb} mb</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};