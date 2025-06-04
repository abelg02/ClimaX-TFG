// frontend/src/components/regionalMap/RegionalMap.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getWeatherForecast } from '../../services/weatherService';
import styles from './RegionalMap.module.css';
import { SearchBar } from '../search/SearchBar';
import { ErrorMessage } from '../ErrorMessage';

const ZoomController = ({ zoomLevel }: { zoomLevel: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setZoom(zoomLevel);
  }, [zoomLevel, map]);
  return null;
};

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
  const hue = Math.max(0, Math.min(240, 240 - (temp * 4)));
  return `hsl(${hue}, 100%, 50%)`;
};

const getWeatherIcon = (condition: string) => {
  const conditionLower = condition.toLowerCase();
  if (conditionLower.includes('sun') || conditionLower.includes('clear')) return '☀️';
  if (conditionLower.includes('cloud')) return '☁️';
  if (conditionLower.includes('rain')) return '🌧️';
  if (conditionLower.includes('snow')) return '❄️';
  if (conditionLower.includes('thunder') || conditionLower.includes('storm')) return '⛈️';
  if (conditionLower.includes('fog') || conditionLower.includes('mist')) return '🌫️';
  return '🌤️';
};

export const RegionalMap = () => {
  const { region } = useParams<{ region: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.0, -3.7]);
  const [zoomLevel, setZoomLevel] = useState(10);
  const [cities, setCities] = useState<Array<{name: string, lat: number, lon: number, temp?: number, condition?: string}>>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCityData = async (cityName: string) => {
    setSearchLoading(true);
    setError(null);
    try {
      const data = await getWeatherForecast(cityName);

      const newCity = {
        name: data.location.name,
        lat: data.location.lat,
        lon: data.location.lon,
        temp: data.current?.temp_c,
        condition: data.current?.condition?.text,
        humidity: data.current?.humidity,
        wind: data.current?.wind_kph,
        feelslike: data.current?.feelslike_c
      };

      navigate(`/map/${encodeURIComponent(data.location.region)}`, {
        state: {
          cityData: {
            name: newCity.name,
            lat: newCity.lat,
            lon: newCity.lon
          }
        },
        replace: true
      });

      setMapCenter([newCity.lat, newCity.lon]);
      setSelectedCity(newCity.name);
      setWeatherData(newCity);

      const nearbyCities = [
        { name: `${newCity.name} Norte`, lat: newCity.lat + 0.2, lon: newCity.lon + 0.1 },
        { name: `${newCity.name} Sur`, lat: newCity.lat - 0.2, lon: newCity.lon - 0.1 },
        { name: `${newCity.name} Este`, lat: newCity.lat + 0.1, lon: newCity.lon + 0.2 },
        { name: `${newCity.name} Oeste`, lat: newCity.lat - 0.1, lon: newCity.lon - 0.2 }
      ];

      const citiesWithWeather = await Promise.all(
        nearbyCities.map(async (city) => {
          try {
            const data = await getWeatherForecast(city.name);
            return {
              ...city,
              temp: data.current?.temp_c,
              condition: data.current?.condition?.text
            };
          } catch (error) {
            return {
              ...city,
              temp: newCity.temp ? newCity.temp + (Math.random() * 2 - 1) : undefined,
              condition: newCity.condition
            };
          }
        })
      );

      setCities([newCity, ...citiesWithWeather]);

    } catch (error) {
      console.error('Error fetching city data:', error);
      setError('No se pudo encontrar el clima para esta ciudad');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (city: string) => {
    fetchCityData(city);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!region) return;

      setLoading(true);
      setError(null);

      try {
        const state = location.state;
        if (state?.cityData) {
          const { lat, lon, name } = state.cityData;
          setMapCenter([lat, lon]);
          setSelectedCity(name);

          const mainCityData = await getWeatherForecast(name);
          const mainCity = {
            name,
            lat,
            lon,
            temp: mainCityData.current?.temp_c,
            condition: mainCityData.current?.condition?.text,
            humidity: mainCityData.current?.humidity,
            wind: mainCityData.current?.wind_kph,
            feelslike: mainCityData.current?.feelslike_c
          };

          setWeatherData(mainCity);

          const nearbyCities = [
            { name: `${name} Norte`, lat: lat + 0.2, lon: lon + 0.1 },
            { name: `${name} Sur`, lat: lat - 0.2, lon: lon - 0.1 },
            { name: `${name} Este`, lat: lat + 0.1, lon: lon + 0.2 },
            { name: `${name} Oeste`, lat: lat - 0.1, lon: lon - 0.2 }
          ];

          const citiesWithWeather = await Promise.all(
            nearbyCities.map(async (city) => {
              try {
                const data = await getWeatherForecast(city.name);
                return {
                  ...city,
                  temp: data.current?.temp_c,
                  condition: data.current?.condition?.text
                };
              } catch (error) {
                return {
                  ...city,
                  temp: mainCity.temp ? mainCity.temp + (Math.random() * 2 - 1) : undefined,
                  condition: mainCity.condition
                };
              }
            })
          );

          setCities([mainCity, ...citiesWithWeather]);
        } else {
          const data = await getWeatherForecast(region);
          const mainCity = {
            name: data.location.name,
            lat: data.location.lat,
            lon: data.location.lon,
            temp: data.current?.temp_c,
            condition: data.current?.condition?.text,
            humidity: data.current?.humidity,
            wind: data.current?.wind_kph,
            feelslike: data.current?.feelslike_c
          };

          setMapCenter([mainCity.lat, mainCity.lon]);
          setSelectedCity(mainCity.name);
          setWeatherData(mainCity);

          const nearbyCities = [
            { name: `${mainCity.name} Norte`, lat: mainCity.lat + 0.2, lon: mainCity.lon + 0.1 },
            { name: `${mainCity.name} Sur`, lat: mainCity.lat - 0.2, lon: mainCity.lon - 0.1 },
            { name: `${mainCity.name} Este`, lat: mainCity.lat + 0.1, lon: mainCity.lon + 0.2 },
            { name: `${mainCity.name} Oeste`, lat: mainCity.lat - 0.1, lon: mainCity.lon - 0.2 }
          ];

          const citiesWithWeather = await Promise.all(
            nearbyCities.map(async (city) => {
              try {
                const data = await getWeatherForecast(city.name);
                return {
                  ...city,
                  temp: data.current?.temp_c,
                  condition: data.current?.condition?.text
                };
              } catch (error) {
                return {
                  ...city,
                  temp: mainCity.temp ? mainCity.temp + (Math.random() * 2 - 1) : undefined,
                  condition: mainCity.condition
                };
              }
            })
          );

          setCities([mainCity, ...citiesWithWeather]);
        }
      } catch (error) {
        console.error('Error loading map data:', error);
        setError('No se pudieron cargar los datos meteorológicos para esta región');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [region, location.state]);

  const handleCityClick = (cityName: string) => {
    const city = cities.find(c => c.name === cityName);
    if (city) {
      setSelectedCity(cityName);
      setMapCenter([city.lat, city.lon]);
      // Actualizar el estado de la ruta con la ciudad seleccionada
      navigate(`/map/${encodeURIComponent(region || '')}`, {
        state: {
          cityData: {
            name: city.name,
            lat: city.lat,
            lon: city.lon
          }
        },
        replace: true
      });
    }
  };

  const clearError = () => {
    setError(null);
  };

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
      {error && <ErrorMessage message={error} onClose={clearError} />}

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
      </div>

      <div className={styles.searchContainer}>
        <SearchBar
          onSearch={handleSearch}
          loading={searchLoading}
          onSettingsClick={() => {}}
        />
      </div>

      <div className={styles.mapLayout}>
        <div className={styles.mapContainerWrapper}>
          <MapContainer
            center={mapCenter}
            zoom={zoomLevel}
            style={{ height: '100%', width: '100%', borderRadius: '12px' }}
            zoomControl={false}
          >
            <ZoomController zoomLevel={zoomLevel} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {cities.map((city, index) => (
              <Marker
                key={index}
                position={[city.lat, city.lon]}
                icon={createCustomIcon(city.temp || 0)}
                eventHandlers={{
                  click: () => handleCityClick(city.name)
                }}
              >
                <Popup className={styles.customPopup}>
                  <div className={styles.popupContent}>
                    <h3>{city.name}</h3>
                    <div className={styles.popupWeather}>
                      <span className={styles.weatherIcon}>
                        {getWeatherIcon(city.condition || '')}
                      </span>
                      <span className={styles.weatherTemp}>
                        {city.temp ? Math.round(city.temp) : '--'}°C
                      </span>
                    </div>
                    <p className={styles.weatherCondition}>
                      {city.condition || 'Datos no disponibles'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {selectedCity && (
              <Circle
                center={[
                  cities.find(c => c.name === selectedCity)?.lat || 0,
                  cities.find(c => c.name === selectedCity)?.lon || 0
                ]}
                radius={5000 * (12 / zoomLevel)}
                fillOpacity={0.2}
                fillColor={getTempColor(
                  cities.find(c => c.name === selectedCity)?.temp || 0
                )}
                color={getTempColor(
                  cities.find(c => c.name === selectedCity)?.temp || 0
                )}
              />
            )}
          </MapContainer>
        </div>

        <div className={styles.mapSidebar}>
          <div className={styles.weatherSummary}>
            <h3>Resumen Meteorológico</h3>
            {selectedCity && (
              <>
                <div className={styles.summaryContent}>
                  <div className={styles.summaryIcon}>
                    {getWeatherIcon(
                      cities.find(c => c.name === selectedCity)?.condition || ''
                    )}
                  </div>
                  <div className={styles.summaryTemp}>
                    {cities.find(c => c.name === selectedCity)?.temp
                      ? Math.round(cities.find(c => c.name === selectedCity)?.temp || 0)
                      : '--'}°C
                  </div>
                  <div className={styles.summaryText}>
                    {cities.find(c => c.name === selectedCity)?.condition || 'Datos no disponibles'}
                  </div>
                </div>
                <div className={styles.summaryDetails}>
                  <div className={styles.detailItem}>
                    <span>🌡️ Sensación</span>
                    <span>{weatherData.feelslike ? Math.round(weatherData.feelslike) : '--'}°C</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span>💧 Humedad</span>
                    <span>{weatherData.humidity || '--'}%</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span>🌬️ Viento</span>
                    <span>{weatherData.wind || '--'} km/h</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className={styles.nearbyCities}>
            <h3>Áreas Cercanas</h3>
            <div className={styles.cityList}>
              {cities.map((city, index) => (
                <div
                  key={index}
                  className={`${styles.cityItem} ${selectedCity === city.name ? styles.selectedCity : ''}`}
                  onClick={() => handleCityClick(city.name)}
                >
                  <span className={styles.cityName}>{city.name}</span>
                  <span className={styles.cityTemp}>
                    {city.temp ? Math.round(city.temp) : '--'}°C
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mapLegend}>
        <h3>Leyenda de Temperaturas</h3>
        <div className={styles.legendScale}>
          <div className={styles.legendGradient}></div>
          <div className={styles.legendLabels}>
            <span>-10°C</span>
            <span>0°C</span>
            <span>10°C</span>
            <span>20°C</span>
            <span>30°C</span>
            <span>40°C</span>
          </div>
        </div>
      </div>
    </div>
  );
};