import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapContainer, Marker, Pane, TileLayer, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CityTemperature, Place } from '../../types';
import { useWeather } from '../../context/WeatherContext';
import { useForecast } from '../../hooks/useForecast';
import { getMapCities, reversePlace } from '../../services/weatherService';
import { WeatherIcon } from '../../components/weather/weatherIcon/WeatherIcon';
import { formatTemp, placeSubtitle, toUnits } from '../../utils/format';
import { placeFromSearch, placeToSearch } from '../../utils/placeUrl';
import { TEMP_LEGEND, tempColor } from '../../utils/weatherStyles';
import styles from './RegionalMap.module.css';

type RadarFrame = { time: number; path: string };

const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas';
const ATTRIBUTION =
  'Mapa &copy; <a href="https://www.esri.com/">Esri</a>, HERE, Garmin, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · Radar <a href="https://www.rainviewer.com/">RainViewer</a>';

/** Mueve la cámara al lugar seleccionado. */
const FlyTo = ({ place }: { place: Place | null }) => {
  const map = useMap();
  useEffect(() => {
    if (place) map.flyTo([place.latitude, place.longitude], Math.max(map.getZoom(), 7), { duration: 1.1 });
  }, [place, map]);
  return null;
};

const MapEvents = ({ onClick, onZoom }: { onClick: (lat: number, lon: number) => void; onZoom: (z: number) => void }) => {
  useMapEvents({
    click: (e) => onClick(e.latlng.lat, e.latlng.lng),
    zoomend: (e) => onZoom(e.target.getZoom()),
  });
  return null;
};

const radarTime = (unix: number) => {
  const minutes = Math.round((Date.now() / 1000 - unix) / 60);
  const clock = new Date(unix * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  if (minutes <= 2) return `${clock} · ahora`;
  return minutes > 0 ? `${clock} · hace ${minutes} min` : `${clock} · previsión`;
};

export const RegionalMap = () => {
  const [params] = useSearchParams();
  const { units, lastPlace } = useWeather();
  const focus = useMemo(() => placeFromSearch(params), [params]);

  const [cities, setCities] = useState<CityTemperature[]>([]);
  const [citiesError, setCitiesError] = useState(false);
  const [selected, setSelected] = useState<Place | null>(focus);
  const [showTemps, setShowTemps] = useState(true);
  const [showRadar, setShowRadar] = useState(true);
  const [zoom, setZoom] = useState(6);
  const [radar, setRadar] = useState<{ host: string; frames: RadarFrame[] } | null>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const clickSeq = useRef(0);

  const { data: selectedForecast, loading: selectedLoading } = useForecast(selected);

  useEffect(() => {
    document.title = 'Mapa del tiempo — ClimaX';
  }, []);

  useEffect(() => {
    if (focus) setSelected(focus);
  }, [focus]);

  useEffect(() => {
    const controller = new AbortController();
    getMapCities(controller.signal)
      .then(setCities)
      .catch((err: Error) => err.name !== 'AbortError' && setCitiesError(true));
    return () => controller.abort();
  }, []);

  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then((r) => r.json())
      .then((data) => {
        const frames: RadarFrame[] = [...(data.radar?.past ?? []), ...(data.radar?.nowcast ?? [])];
        if (!frames.length) return;
        setRadar({ host: data.host, frames });
        setFrame((data.radar?.past?.length ?? frames.length) - 1);
      })
      .catch(() => setRadar(null));
  }, []);

  useEffect(() => {
    if (!playing || !radar) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % radar.frames.length), 900);
    return () => clearInterval(id);
  }, [playing, radar]);

  const icons = useMemo(
    () =>
      cities.map((c) =>
        L.divIcon({
          className: '',
          iconSize: [0, 0],
          html: `<div class="${styles.pin}" style="--c:${tempColor(c.temperature)}"><b>${Math.round(
            toUnits(c.temperature, units),
          )}°</b><span class="${styles.pinName}">${c.name}</span></div>`,
        }),
      ),
    [cities, units],
  );

  const selectedIcon = useMemo(() => L.divIcon({ className: '', iconSize: [0, 0], html: `<div class="${styles.target}"></div>` }), []);

  const pickPoint = async (lat: number, lon: number) => {
    const seq = ++clickSeq.current;
    const provisional: Place = { name: 'Punto seleccionado', latitude: lat, longitude: lon };
    setSelected(provisional);
    try {
      const place = await reversePlace(lat, lon);
      if (seq === clickSeq.current) setSelected(place);
    } catch {
      /* se queda el nombre provisional */
    }
  };

  const pickCity = (c: CityTemperature) => {
    setSelected({ name: c.name, latitude: c.latitude, longitude: c.longitude });
    setListOpen(false);
  };

  const start = focus ?? lastPlace;
  const center: [number, number] = start ? [start.latitude, start.longitude] : [40.1, -3.6];
  const sorted = [...cities].sort((a, b) => b.temperature - a.temperature);
  const extremes = sorted.length ? { hot: sorted[0], cold: sorted[sorted.length - 1] } : null;

  return (
    <div className={`${styles.page} ${zoom >= 7 ? styles.showNames : ''}`}>
      <MapContainer
        center={center}
        zoom={start ? 7 : 6}
        minZoom={3}
        maxZoom={12}
        zoomControl={false}
        worldCopyJump
        className={styles.map}
        attributionControl
      >
        <TileLayer url={`${ESRI}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`} attribution={ATTRIBUTION} maxNativeZoom={16} />

        {/* RainViewer limita las peticiones: solo se carga el fotograma visible
            y, durante la animación, se precarga el siguiente */}
        {showRadar &&
          radar &&
          (playing ? [frame, (frame + 1) % radar.frames.length] : [frame]).map((i) => (
            <TileLayer
              key={radar.frames[i].path}
              url={`${radar.host}${radar.frames[i].path}/256/{z}/{x}/{y}/2/1_1.png`}
              opacity={i === frame ? 0.75 : 0}
              maxNativeZoom={7}
              zIndex={10 + i}
            />
          ))}

        <Pane name="labels" style={{ zIndex: 450, pointerEvents: 'none' }}>
          <TileLayer url={`${ESRI}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`} maxNativeZoom={16} />
        </Pane>

        {showTemps &&
          cities.map((c, i) => (
            <Marker
              key={c.name}
              position={[c.latitude, c.longitude]}
              icon={icons[i]}
              eventHandlers={{ click: () => pickCity(c) }}
              title={`${c.name}: ${formatTemp(c.temperature, units)}, ${c.condition.description}`}
            />
          ))}

        {selected && <Marker position={[selected.latitude, selected.longitude]} icon={selectedIcon} interactive={false} />}

        <FlyTo place={selected} />
        <MapEvents onClick={pickPoint} onZoom={setZoom} />
        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* Capas */}
      <div className={`${styles.card} ${styles.layers}`}>
        <p className="eyebrow">Mapa del tiempo</p>
        <div className={styles.toggles}>
          <button type="button" aria-pressed={showTemps} onClick={() => setShowTemps((v) => !v)}>
            <i className={styles.swatchTemp} /> Temperatura
          </button>
          <button type="button" aria-pressed={showRadar} onClick={() => setShowRadar((v) => !v)} disabled={!radar}>
            <i className={styles.swatchRadar} /> Radar de lluvia
          </button>
        </div>
        <p className={styles.hint}>Haz clic en cualquier punto del mapa para ver su tiempo.</p>
      </div>

      {/* Ciudades */}
      <aside className={`${styles.card} ${styles.cities} ${listOpen ? styles.citiesOpen : ''}`} aria-label="Ciudades">
        <button type="button" className={styles.citiesHeader} onClick={() => setListOpen((v) => !v)} aria-expanded={listOpen}>
          <span className="eyebrow">Ahora en {cities.length || '…'} ciudades</span>
          {extremes && (
            <span className={`mono ${styles.extremes}`}>
              <b style={{ color: tempColor(extremes.hot.temperature) }}>{formatTemp(extremes.hot.temperature, units)}</b> {extremes.hot.name} ·{' '}
              <b style={{ color: tempColor(extremes.cold.temperature) }}>{formatTemp(extremes.cold.temperature, units)}</b> {extremes.cold.name}
            </span>
          )}
        </button>
        {citiesError && <p className={styles.hint}>No se pudieron cargar las temperaturas.</p>}
        <ol className={styles.cityList}>
          {sorted.map((c) => (
            <li key={c.name}>
              <button type="button" onClick={() => pickCity(c)}>
                <WeatherIcon group={c.condition.group} isDay={c.isDay} size={22} animated={false} />
                <span>{c.name}</span>
                <b className="mono" style={{ color: tempColor(c.temperature) }}>
                  {formatTemp(c.temperature, units)}
                </b>
              </button>
            </li>
          ))}
        </ol>
      </aside>

      {/* Lugar seleccionado */}
      {selected && (
        <section className={`${styles.card} ${styles.selected}`} aria-live="polite">
          <button type="button" className={styles.close} onClick={() => setSelected(null)} aria-label="Cerrar">
            ×
          </button>
          <p className="eyebrow">{placeSubtitle(selected) || 'Ahora mismo'}</p>
          <h2>{selected.name}</h2>
          {selectedForecast ? (
            <div className={styles.selectedBody}>
              <WeatherIcon group={selectedForecast.current.condition.group} isDay={selectedForecast.current.isDay} size={58} />
              <div>
                <p className={styles.selectedTemp}>{formatTemp(selectedForecast.current.temperature, units)}</p>
                <p className={styles.selectedMeta}>
                  {selectedForecast.current.condition.description} · viento {Math.round(selectedForecast.current.windSpeed)} km/h
                </p>
              </div>
            </div>
          ) : (
            <p className={styles.hint}>{selectedLoading ? 'Cargando…' : 'Sin datos para este punto.'}</p>
          )}
          <Link className={styles.cta} to={{ pathname: '/', search: placeToSearch(selected) }}>
            Ver previsión completa →
          </Link>
        </section>
      )}

      {/* Línea de tiempo del radar */}
      {showRadar && radar && (
        <div className={`${styles.card} ${styles.timeline}`}>
          <button
            type="button"
            className={styles.play}
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pausar animación del radar' : 'Reproducir animación del radar'}
          >
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
                <rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M3 1.5v11l9.5-5.5z" fill="currentColor" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min={0}
            max={radar.frames.length - 1}
            value={frame}
            onChange={(e) => {
              setPlaying(false);
              setFrame(Number(e.target.value));
            }}
            aria-label="Momento del radar"
          />
          <span className="mono">{radarTime(radar.frames[frame].time)}</span>
        </div>
      )}

      {/* Leyenda */}
      {showTemps && (
        <div className={`${styles.card} ${styles.legend}`} aria-label="Escala de temperatura">
          <div
            className={styles.legendBar}
            style={{ background: `linear-gradient(90deg, ${TEMP_LEGEND.map((t) => tempColor(t)).join(', ')})` }}
          />
          <div className={`mono ${styles.legendLabels}`}>
            {TEMP_LEGEND.filter((_, i) => i % 2 === 0).map((t) => (
              <span key={t}>{formatTemp(t, units)}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
