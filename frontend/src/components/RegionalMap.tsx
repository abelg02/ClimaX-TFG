import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getWeatherForecast } from '../services/weatherService';
import styles from '../pages/Home.module.css';

// Función para obtener el color basado en la temperatura
const getTempColor = (temp: number) => {
  if (temp < 10) return '#3498db';
  if (temp < 20) return '#2ecc71';
  if (temp < 30) return '#f1c40f';
  if (temp < 35) return '#e67e22';
  return '#e74c3c';
};

export const RegionalMap = () => {
  const { region } = useParams<{ region: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.0, -3.7]); // Centro de España por defecto

  useEffect(() => {
    const fetchData = async () => {
      if (!region) return;

      setLoading(true);

      try {
        // Obtener datos de la ciudad desde la ubicación (pasados desde CurrentWeather)
        const state = location.state;
        if (state && state.cityData) {
          const { lat, lon, name } = state.cityData;
          setMapCenter([lat, lon]);

          // Obtener datos del clima para esta ciudad
          const data = await getWeatherForecast(name);
          setWeatherData({
            name,
            temp: data.current?.temp_c,
            condition: data.current?.condition?.text,
            icon: data.current?.condition?.icon,
            lat,
            lon
          });
        }
      } catch (error) {
        console.error('Error loading map data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [region, location.state]);

  if (loading) {
    return <div className={styles.loadingMessage}>Cargando mapa...</div>;
  }

  if (!weatherData) {
    return <div className={styles.loadingMessage}>No se encontraron datos para mostrar en el mapa.</div>;
  }

  return (
    <div className={styles.mapPageContainer}>
      <h1 className={styles.mapTitle}>
        <span onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>←</span>
        Mapa de {weatherData.name}
      </h1>

      <div className={styles.mapContainer}>
        <MapContainer
          center={mapCenter}
          zoom={10}
          style={{ height: '500px', width: '100%', borderRadius: '12px' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <Marker
            position={[weatherData.lat, weatherData.lon]}
            icon={L.divIcon({
              html: `
                <div style="
                  background: ${getTempColor(weatherData.temp)};
                  color: white;
                  padding: 5px 10px;
                  border-radius: 50%;
                  border: 2px solid white;
                  font-weight: bold;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 40px;
                  height: 40px;
                ">
                  ${Math.round(weatherData.temp)}°
                </div>
              `,
              className: ''
            })}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <h3>{weatherData.name}</h3>
                <img
                  src={`https:${weatherData.icon}`}
                  alt={weatherData.condition}
                  style={{ width: '50px', height: '50px' }}
                />
                <p>{weatherData.condition}</p>
                <p><strong>Temperatura:</strong> {weatherData.temp}°C</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <div className={styles.legend}>
        <h3>Leyenda de temperaturas:</h3>
        <div className={styles.legendItems}>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#3498db' }}></div>
            <span>Menos de 10°C</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#2ecc71' }}></div>
            <span>10°C - 20°C</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#f1c40f' }}></div>
            <span>20°C - 30°C</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#e67e22' }}></div>
            <span>30°C - 35°C</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendColor} style={{ backgroundColor: '#e74c3c' }}></div>
            <span>Más de 35°C</span>
          </div>
        </div>
      </div>
    </div>
  );
};