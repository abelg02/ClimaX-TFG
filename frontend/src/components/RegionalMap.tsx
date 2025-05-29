// frontend/src/components/RegionalMap.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useParams, useNavigate } from 'react-router-dom';
import { getWeatherForecast } from '../services/weatherService';
import { getProvincesForRegion, getRegionCenter } from '../services/regionService';
import styles from '../pages/Home.module.css';

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
  const [provinces, setProvinces] = useState<{name: string, lat: number, lng: number}[]>([]);
  const [weatherData, setWeatherData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.0, -3.7]);

  useEffect(() => {
    const fetchData = async () => {
      if (!region) return;

      setLoading(true);

      try {
        // 1. Obtener provincias y centro del mapa
        const fetchedProvinces = await getProvincesForRegion(region);
        setProvinces(fetchedProvinces);
        setMapCenter(getRegionCenter(region));

        // 2. Obtener clima para cada provincia
        const weatherPromises = fetchedProvinces.map(province =>
          getWeatherForecast(province.name)
            .then(data => ({
              name: province.name,
              data: {
                temp: data.current?.temp_c,
                condition: data.current?.condition?.text,
                icon: data.current?.condition?.icon,
                max: data.forecast?.forecastday[0]?.day?.maxtemp_c,
                min: data.forecast?.forecastday[0]?.day?.mintemp_c
              }
            }))
            .catch(error => {
              console.error(`Error fetching weather for ${province.name}:`, error);
              return null;
            })
        );

        const results = await Promise.all(weatherPromises);
        const validResults = results.filter(Boolean) as {name: string, data: any}[];

        setWeatherData(Object.fromEntries(
          validResults.map(r => [r.name, r.data])
        ));
      } catch (error) {
        console.error('Error loading map data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
          center={mapCenter}
          zoom={7}
          style={{ height: '500px', width: '100%', borderRadius: '12px' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {provinces.map(provincia => {
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
                    <p><strong>Actual:</strong> {weather.temp}°C</p>
                    <p><strong>Máx:</strong> {weather.max}°C</p>
                    <p><strong>Mín:</strong> {weather.min}°C</p>
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