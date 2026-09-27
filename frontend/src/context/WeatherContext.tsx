import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Place, Units } from '../types';
import type { SkyTheme } from '../utils/weatherStyles';
import { getDataSource, onDataSourceChange } from '../services/weatherService';
import { samePlace } from '../utils/placeUrl';
import type { DataSource } from '../services/weatherService';
import type { UserProfile } from '../services/firebase';

/**
 * Estado global de la app: unidades, lugares favoritos, sesión (opcional)
 * y el "cielo" actual que pinta el fondo animado.
 */

export interface Sky {
  group: string;
  isDay: boolean;
  theme: SkyTheme;
}

type WeatherContextType = {
  units: Units;
  setUnits: (u: Units) => void;
  favorites: Place[];
  isFavorite: (p: Place) => boolean;
  toggleFavorite: (p: Place) => void;
  lastPlace: Place | null;
  rememberPlace: (p: Place) => void;
  sky: Sky | null;
  setSky: (s: Sky | null) => void;
  dataSource: DataSource;
  user: UserProfile | null;
  authReady: boolean;
};

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible: se ignora */
  }
};

export const WeatherProvider = ({ children }: { children: ReactNode }) => {
  const [units, setUnitsState] = useState<Units>(() => read('climax:units', 'c'));
  const [favorites, setFavorites] = useState<Place[]>(() => read('climax:favorites', []));
  const [lastPlace, setLastPlace] = useState<Place | null>(() => read('climax:last', null));
  const [sky, setSky] = useState<Sky | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>(getDataSource);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => onDataSourceChange(setDataSource), []);

  // Firebase se carga en diferido para no penalizar la primera carga
  useEffect(() => {
    let unsubscribe = () => {};
    let cancelled = false;
    import('../services/firebase').then(({ onAuthStateChange, loadFavorites }) => {
      if (cancelled) return;
      unsubscribe = onAuthStateChange(async (profile) => {
        // Primero se fusionan los favoritos remotos y después se marca la sesión,
        // para que el guardado automático no pise los de Firestore
        if (profile) {
          const remote = await loadFavorites(profile.uid);
          if (remote) {
            setFavorites((local) => {
              const merged = [...remote];
              local.forEach((p) => !merged.some((r) => samePlace(r, p)) && merged.push(p));
              return merged;
            });
          }
        }
        setUser(profile);
        setAuthReady(true);
      });
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    write('climax:favorites', favorites);
    if (user) {
      import('../services/firebase').then(({ saveFavorites }) => saveFavorites(user.uid, favorites));
    }
  }, [favorites, user]);

  const setUnits = useCallback((u: Units) => {
    setUnitsState(u);
    write('climax:units', u);
  }, []);

  const isFavorite = useCallback((p: Place) => favorites.some((f) => samePlace(f, p)), [favorites]);

  const toggleFavorite = useCallback((p: Place) => {
    setFavorites((list) => (list.some((f) => samePlace(f, p)) ? list.filter((f) => !samePlace(f, p)) : [...list, p]));
  }, []);

  const rememberPlace = useCallback((p: Place) => {
    setLastPlace(p);
    write('climax:last', p);
  }, []);

  const value = useMemo(
    () => ({
      units,
      setUnits,
      favorites,
      isFavorite,
      toggleFavorite,
      lastPlace,
      rememberPlace,
      sky,
      setSky,
      dataSource,
      user,
      authReady,
    }),
    [units, setUnits, favorites, isFavorite, toggleFavorite, lastPlace, rememberPlace, sky, dataSource, user, authReady],
  );

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) throw new Error('useWeather debe usarse dentro de WeatherProvider');
  return context;
};
