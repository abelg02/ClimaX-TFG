import { Link, NavLink } from 'react-router-dom';
import { useWeather } from '../../../context/WeatherContext';
import { SearchBar } from '../../search/SearchBar';
import styles from './Menu.module.css';

const LogoMark = () => (
  <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="26" cy="28" r="12" fill="var(--accent)" />
    <path
      d="M20 48h24a9.5 9.5 0 0 0 .8-19A12.5 12.5 0 0 0 21 33.4 7.3 7.3 0 0 0 20 48z"
      fill="#eef1f6"
      stroke="var(--ink-0)"
      strokeWidth="3"
    />
  </svg>
);

const IconForecast = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4 1.6A3.3 3.3 0 0 0 7 18z" strokeLinejoin="round" />
  </svg>
);

const IconMap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4zM9 4v13M15 6.5v13" strokeLinejoin="round" />
  </svg>
);

/** Cabecera fija: marca, buscador, navegación, unidades y cuenta. */
export const Menu = () => {
  const { units, setUnits, user } = useWeather();
  const initial = (user?.name ?? user?.email ?? '?').charAt(0).toUpperCase();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand} aria-label="ClimaX, inicio">
          <LogoMark />
          <span>
            Clima<em>X</em>
          </span>
        </Link>

        <div className={styles.search}>
          <SearchBar />
        </div>

        <nav className={styles.nav} aria-label="Principal">
          <NavLink to="/" end className={({ isActive }) => (isActive ? styles.active : undefined)}>
            <IconForecast />
            <span>Previsión</span>
          </NavLink>
          <NavLink to="/mapa" className={({ isActive }) => (isActive ? styles.active : undefined)}>
            <IconMap />
            <span>Mapa</span>
          </NavLink>
        </nav>

        <div className={styles.units} role="group" aria-label="Unidades de temperatura">
          {(['c', 'f'] as const).map((u) => (
            <button key={u} aria-pressed={units === u} onClick={() => setUnits(u)}>
              °{u.toUpperCase()}
            </button>
          ))}
        </div>

        <NavLink
          to="/cuenta"
          className={({ isActive }) => `${styles.account} ${isActive ? styles.accountActive : ''}`}
          aria-label={user ? 'Tu cuenta' : 'Iniciar sesión'}
          title={user ? (user.name ?? user.email ?? 'Tu cuenta') : 'Iniciar sesión'}
        >
          {user ? (
            <span className={styles.avatar}>{initial}</span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="8.5" r="3.6" />
              <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" strokeLinecap="round" />
            </svg>
          )}
        </NavLink>
      </div>
    </header>
  );
};
