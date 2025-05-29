import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useParams, useNavigate } from 'react-router-dom';
import { getWeatherForecast } from '../services/weatherService';
import styles from '../pages/Home.module.css';

// Coordenadas aproximadas de las provincias de Andalucía
const PROVINCIAS_ANDALUCIA = [
  { name: 'Sevilla', lat: 37.3826, lng: -5.9963 },
  { name: 'Málaga', lat: 36.7213, lng: -4.4213 },
  { name: 'Granada', lat: 37.1765, lng: -3.5979 },
  { name: 'Córdoba', lat: 37.8882, lng: -4.7794 },
  { name: 'Jaén', lat: 37.7796, lng: -3.7849 },
  { name: 'Almería', lat: 36.8402, lng: -2.4679 },
  { name: 'Huelva', lat: 37.2614, lng: -6.9447 },
  { name: 'Cádiz', lat: 36.5297, lng: -6.2926 }
];

const getTempColor = (temp: number) => {
  if (temp < 10) return '#3498db';    // Azul frío
  if (temp < 20) return '#2ecc71';    // Verde fresco
  if (temp < 30) return '#f1c40f';    // Amarillo cálido
  if (temp < 35) return '#e67e22';    // Naranja caliente
  return '#e74c3c';                   // Rojo muy caliente
};

export const RegionalMap = () => {
  const { region } = useParams<{ region: string }>();
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherForProvinces = async () => {
      const data: Record<string, any> = {};

      try {
        for (const provincia of PROVINCIAS_ANDALUCIA) {
          const response = await getWeatherForecast(provincia.name);
          data[provincia.name] = {
            temp: response.current?.temp_c,
            condition: response.current?.condition?.text,
            icon: response.current?.condition?.icon
          };
        }
        setWeatherData(data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherForProvinces();
  }, [region]);

  if (loading) {
    return <div className={styles.loadingMessage}>Cargando datos del mapa...</div>;
  }

  return (
    <div className={styles.mapPageContainer}>
      <h1 className={styles.mapTitle}>
        <span onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>←</span>
        Mapa de temperaturas en {region}
      </h1>

      <div className={styles.mapContainer}>
        <MapContainer
          center={[37.5, -4.5]}  // Centro de Andalucía
          zoom={7}
          style={{ height: '500px', width: '100%', borderRadius: '12px' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {PROVINCIAS_ANDALUCIA.map(provincia => {
            const weather = weatherData[provincia.name];
            if (!weather) return null;

            return (
              <Marker
                key={provincia.name}
                position={[provincia.lat, provincia.lng]}
                icon={L.divIcon({
                  html: `
                    <div style="
                      background: ${getTempColor(weather.temp)};
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
                      ${Math.round(weather.temp)}°
                    </div>
                  `,
                  className: ''
                })}
              >
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <h3>{provincia.name}</h3>
                    <img
                      src={`https:${weather.icon}`}
                      alt={weather.condition}
                      style={{ width: '50px', height: '50px' }}
                    />
                    <p>{weather.condition}</p>
                    <p><strong>Temperatura:</strong> {weather.temp}°C</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
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