import { Link } from 'react-router-dom';
import type { Place } from '../../types';
import { useWeather } from '../../context/WeatherContext';
import { POPULAR_PLACES } from '../../utils/cities';
import { placeToSearch, samePlace } from '../../utils/placeUrl';
import styles from './PlacesStrip.module.css';

/** Accesos rápidos: favoritos del usuario y ciudades populares. */
export const PlacesStrip = ({ current }: { current?: Place }) => {
  const { favorites, toggleFavorite } = useWeather();
  const popular = POPULAR_PLACES.filter((p) => !favorites.some((f) => samePlace(f, p)));

  return (
    <section className={`panel ${styles.strip}`} aria-label="Lugares">
      {favorites.length > 0 && (
        <div className={styles.group}>
          <h2 className="eyebrow">Tus lugares</h2>
          <ul>
            {favorites.map((p) => (
              <li key={`${p.latitude},${p.longitude}`} className={styles.fav}>
                <Link
                  to={{ pathname: '/', search: placeToSearch(p) }}
                  aria-current={current && samePlace(current, p) ? 'page' : undefined}
                >
                  ★ {p.name}
                </Link>
                <button type="button" onClick={() => toggleFavorite(p)} aria-label={`Quitar ${p.name} de tus lugares`}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className={styles.group}>
        <h2 className="eyebrow">{favorites.length ? 'Explorar' : 'Explorar · guarda tus lugares con ★'}</h2>
        <ul>
          {popular.map((p) => (
            <li key={p.name}>
              <Link
                to={{ pathname: '/', search: placeToSearch(p) }}
                aria-current={current && samePlace(current, p) ? 'page' : undefined}
              >
                {p.name}
              </Link>
            </li>
          ))}
          <li>
            <Link to="/mapa" className={styles.mapLink}>
              Ver el mapa →
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
};
