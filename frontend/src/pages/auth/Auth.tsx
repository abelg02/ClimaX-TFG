import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useWeather } from '../../context/WeatherContext';
import { authErrorMessage, loginUser, logoutUser, registerUser } from '../../services/firebase';
import { placeToSearch } from '../../utils/placeUrl';
import styles from './Auth.module.css';

/**
 * Cuenta opcional con Firebase Authentication. Sin cuenta la app funciona
 * igual; con cuenta los lugares guardados se sincronizan entre dispositivos.
 */
export const Auth = () => {
  const { user, authReady, favorites } = useWeather();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Tu cuenta — ClimaX';
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'login') await loginUser(email, password);
      else await registerUser(name, email, password);
      setPassword('');
    } catch (err) {
      setError(authErrorMessage((err as { code?: string }).code ?? ''));
    } finally {
      setBusy(false);
    }
  };

  if (!authReady) return <div className={`${styles.card} skeleton`} style={{ minHeight: 420 }} />;

  if (user) {
    return (
      <section className={`panel ${styles.card}`}>
        <div className={styles.avatar}>{(user.name ?? user.email ?? '?').charAt(0).toUpperCase()}</div>
        <p className="eyebrow">Sesión iniciada</p>
        <h1 className={styles.title}>Hola{user.name ? `, ${user.name}` : ''}</h1>
        <p className={styles.lead}>{user.email}</p>

        <div className={styles.favs}>
          <p className="eyebrow">Tus lugares sincronizados · {favorites.length}</p>
          {favorites.length ? (
            <ul>
              {favorites.map((p) => (
                <li key={`${p.latitude},${p.longitude}`}>
                  <Link to={{ pathname: '/', search: placeToSearch(p) }}>{p.name}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.lead}>Pulsa ★ Guardar en cualquier ciudad para añadirla.</p>
          )}
        </div>

        <button type="button" className={styles.secondary} onClick={() => logoutUser()}>
          Cerrar sesión
        </button>
      </section>
    );
  }

  return (
    <section className={`panel ${styles.card}`}>
      <p className="eyebrow">Cuenta ClimaX</p>
      <h1 className={styles.title}>
        {mode === 'login' ? (
          <>
            Bienvenido de <em>nuevo</em>
          </>
        ) : (
          <>
            Crea tu <em>cuenta</em>
          </>
        )}
      </h1>
      <p className={styles.lead}>Es opcional: sirve para guardar tus lugares y tenerlos en cualquier dispositivo.</p>

      <div className={styles.tabs} role="tablist">
        <button type="button" role="tab" aria-selected={mode === 'login'} onClick={() => setMode('login')}>
          Iniciar sesión
        </button>
        <button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => setMode('register')}>
          Registrarse
        </button>
      </div>

      <form onSubmit={submit} className={styles.form}>
        {mode === 'register' && (
          <label>
            <span>Nombre</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Tu nombre" />
          </label>
        )}
        <label>
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="tu@email.com"
          />
        </label>
        <label>
          <span>Contraseña</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder={mode === 'login' ? '••••••••' : 'Mínimo 6 caracteres'}
          />
        </label>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button type="submit" className={styles.primary} disabled={busy}>
          {busy ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </form>

      <Link to="/" className={styles.skip}>
        Seguir sin cuenta →
      </Link>
    </section>
  );
};
