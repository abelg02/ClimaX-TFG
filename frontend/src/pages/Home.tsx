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
    const today = new Date();
    const date = new Date(dateString);

    if (index === 0) {
      return 'Hoy';
    } else {
      return date.toLocaleDateString('es-ES', { weekday: 'long' });
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
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
        <>
          {/* Sección de clima actual */}
          <div style={{
            border: '1px solid #ccc',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            marginBottom: '20px'
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

          {/* Sección de pronóstico por horas */}
          <div style={{
            border: '1px solid #ccc',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            marginBottom: '20px'
          }}>
            <h3>Pronóstico por horas (hoy)</h3>
            <div style={{
              display: 'flex',
              overflowX: 'auto',
              gap: '15px',
              padding: '10px 0'
            }}>
              {weather.forecast.forecastday[0].hour.map((hour: any) => (
                <div key={hour.time_epoch} style={{
                  minWidth: '80px',
                  textAlign: 'center',
                  padding: '10px',
                  backgroundColor: '#fff',
                  borderRadius: '5px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                    {new Date(hour.time).getHours()}h
                  </p>
                  <img
                    src={`https:${hour.condition.icon}`}
                    alt={hour.condition.text}
                    style={{ width: '40px', height: '40px' }}
                  />
                  <p style={{ margin: '5px 0 0 0' }}>{hour.temp_c}°C</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sección de pronóstico por días (7 días con "Hoy" destacado) */}
          <div style={{
            border: '1px solid #ccc',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}>
            <h3>Pronóstico para los próximos 7 días</h3>
            <div style={{ display: 'grid', gap: '15px' }}>
              {weather.forecast.forecastday.map((day: any, index: number) => (
                <div key={day.date_epoch} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px',
                  backgroundColor: '#fff',
                  borderRadius: '5px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  borderLeft: index === 0 ? '4px solid #007bff' : 'none'
                }}>
                  <div style={{ width: '100px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>
                      {formatDay(day.date, index)}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.9em' }}>
                      {new Date(day.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={`https:${day.day.condition.icon}`}
                      alt={day.day.condition.text}
                      style={{ width: '40px', height: '40px' }}
                    />
                    <span style={{ marginLeft: '10px' }}>{day.day.condition.text}</span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{day.day.maxtemp_c}°C</p>
                    <p style={{ margin: 0, color: '#666' }}>{day.day.mintemp_c}°C</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};