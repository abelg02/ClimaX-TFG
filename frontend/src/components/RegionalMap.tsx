// frontend/src/components/RegionalMap.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getWeatherForecast } from '../services/weatherService';
import styles from '../pages/Home.module.css';

// Configuración de iconos personalizados
const createCustomIcon = (temp: number) => {
  const color = getTempColor(temp);
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        color: white;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        font-weight: bold;
        font-size: 14px;
      ">
        ${Math.round(temp)}°
      </div>
    `,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

const getTempColor = (temp: number) => {
  const hue = Math.max(0, Math.min(240, 240 - (temp * 4))); // Azul (frío) a Rojo (caliente)
  return `hsl(${hue}, 100%, 50%)`;
};

const getWeatherIcon = (condition: string) => {
  const icons: Record<string, string> = {
    'sunny': '☀️',
    'clear': '🌙',
    'cloudy': '☁️',
    'partly-cloudy': '⛅',
    'rain': '🌧️',
    'snow': '❄️',
    'thunder': '⛈️',
    'fog': '🌫️'
  };

  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) return icons.sunny;
  if (lowerCondition.includes('cloud')) return icons.cloudy;
  if (lowerCondition.includes('rain')) return icons.rain;
  if (lowerCondition.includes('snow')) return icons.snow;
  if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) return icons.thunder;
  if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) return icons.fog;
  return icons.sunny;
};

export const RegionalMap = () => {
  const { region } = useParams<{ region: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.0, -3.7]);
  const [zoomLevel, setZoomLevel] = useState(8);
  const [cities, setCities] = useState<Array<{name: string, lat: number, lon: number}>>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!region) return;

      setLoading(true);

      try {
        const state = location.state;
        if (state && state.cityData) {
          const { lat, lon, name } = state.cityData;
          setMapCenter([lat, lon]);
          setSelectedCity(name);

          const data = await getWeatherForecast(name);
          setWeatherData({
            name,
            temp: data.current?.temp_c,
            condition: data.current?.condition?.text,
            icon: data.current?.condition?.icon,
            lat,
            lon,
            humidity: data.current?.humidity,
            wind: data.current?.wind_kph,
            feelslike: data.current?.feelslike_c
          });

          // Simulamos obtener ciudades cercanas (en un proyecto real usarías una API)
          const mockCities = [
            { name: `${name} Norte`, lat: lat + 0.2, lon: lon + 0.1 },
            { name: `${name} Sur`, lat: lat - 0.2, lon: lon - 0.1 },
            { name: `${name} Este`, lat: lat + 0.1, lon: lon + 0.2 },
            { name: `${name} Oeste`, lat: lat - 0.1, lon: lon - 0.2 }
          ];
          setCities(mockCities);
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
    return (
      <div className={styles.mapLoadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando mapa meteorológico...</p>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className={styles.mapErrorContainer}>
        <p>No se pudieron cargar los datos meteorológicos.</p>
        <button
          onClick={() => navigate(-1)}
          className={styles.backButton}
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className={styles.mapPageContainer}>
      <div className={styles.mapHeader}>
        <button
          onClick={() => navigate(-1)}
          className={styles.backButton}
        >
          &larr; Volver
        </button>
        <h1 className={styles.mapTitle}>
          Mapa Meteorológico: {weatherData.name}
        </h1>
        <div className={styles.mapControls}>
          <button
            onClick={() => setZoomLevel(z => Math.min(z + 1, 12))}
            className={styles.zoomButton}
          >
            +
          </button>
          <button
            onClick={() => setZoomLevel(z => Math.max(z - 1, 6))}
            className={styles.zoomButton}
          >
            -
          </button>
        </div>
      </div>

      <div className={styles.mapLayout}>
        <div className={styles.mapContainerWrapper}>
          <MapContainer
            center={mapCenter}
            zoom={zoomLevel}
            style={{ height: '100%', width: '100%', borderRadius: '12px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Marker principal */}
            <Marker
              position={[weatherData.lat, weatherData.lon]}
              icon={createCustomIcon(weatherData.temp)}
            >
              <Popup className={styles.customPopup}>
                <div className={styles.popupContent}>
                  <h3>{weatherData.name}</h3>
                  <div className={styles.popupWeather}>
                    <span className={styles.weatherIcon}>
                      {getWeatherIcon(weatherData.condition)}
                    </span>
                    <span className={styles.weatherTemp}>
                      {Math.round(weatherData.temp)}°C
                    </span>
                  </div>
                  <p className={styles.weatherCondition}>
                    {weatherData.condition}
                  </p>
                  <div className={styles.weatherDetails}>
                    <div>
                      <span>🌡️ Sensación: {Math.round(weatherData.feelslike)}°C</span>
                    </div>
                    <div>
                      <span>💧 Humedad: {weatherData.humidity}%</span>
                    </div>
                    <div>
                      <span>🌬️ Viento: {weatherData.wind} km/h</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Ciudades cercanas */}
            {cities.map((city, index) => (
              <Marker
                key={index}
                position={[city.lat, city.lon]}
                icon={createCustomIcon(weatherData.temp + (Math.random() * 4 - 2))}
              >
                <Popup>
                  <div className={styles.popupContent}>
                    <h4>{city.name}</h4>
                    <p>Temperatura aproximada: {Math.round(weatherData.temp + (Math.random() * 4 - 2))}°C</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Radio de influencia (simulado) */}
            <Circle
              center={[weatherData.lat, weatherData.lon]}
              radius={10000}
              fillOpacity={0.1}
              fillColor={getTempColor(weatherData.temp)}
              color={getTempColor(weatherData.temp)}
            />
          </MapContainer>
        </div>

        <div className={styles.mapSidebar}>
          <div className={styles.weatherSummary}>
            <h3>Resumen Meteorológico</h3>
            <div className={styles.summaryContent}>
              <div className={styles.summaryIcon}>
                {getWeatherIcon(weatherData.condition)}
              </div>
              <div className={styles.summaryTemp}>
                {Math.round(weatherData.temp)}°C
              </div>
              <div className={styles.summaryText}>
                {weatherData.condition}
              </div>
            </div>
            <div className={styles.summaryDetails}>
              <div className={styles.detailItem}>
                <span>🌡️ Sensación</span>
                <span>{Math.round(weatherData.feelslike)}°C</span>
              </div>
              <div className={styles.detailItem}>
                <span>💧 Humedad</span>
                <span>{weatherData.humidity}%</span>
              </div>
              <div className={styles.detailItem}>
                <span>🌬️ Viento</span>
                <span>{weatherData.wind} km/h</span>
              </div>
            </div>
          </div>

          <div className={styles.nearbyCities}>
            <h3>Ciudades Cercanas</h3>
            <div className={styles.cityList}>
              {cities.map((city, index) => (
                <div
                  key={index}
                  className={`${styles.cityItem} ${selectedCity === city.name ? styles.selectedCity : ''}`}
                  onClick={() => setSelectedCity(city.name)}
                >
                  <span className={styles.cityName}>{city.name}</span>
                  <span className={styles.cityTemp}>
                    {Math.round(weatherData.temp + (Math.random() * 4 - 2))}°C
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mapLegend}>
        <h3>Leyenda de Temperaturas</h3>
        <div className={styles.legendItems}>
          {[0, 10, 20, 30, 40].map((temp, i, arr) => (
            <div key={temp} className={styles.legendItem}>
              <div
                className={styles.legendColor}
                style={{ backgroundColor: getTempColor(temp) }}
              ></div>
              <span className={styles.legendLabel}>
                {i === arr.length - 1 ? `>${temp}°C` : `${temp}-${arr[i+1]}°C`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};