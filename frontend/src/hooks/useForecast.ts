import { useCallback, useEffect, useState } from 'react';
import type { Forecast, Place } from '../types';
import { getForecast } from '../services/weatherService';

const TTL = 10 * 60 * 1000;
const cache = new Map<string, { at: number; data: Forecast }>();

type State = { key: string | null; data: Forecast | null; error: string | null };

const keyOf = (place: Place | null) => (place ? `${place.latitude.toFixed(3)},${place.longitude.toFixed(3)}` : null);

const fresh = (key: string | null) => {
  const hit = key ? cache.get(key) : undefined;
  return hit && Date.now() - hit.at < TTL ? hit.data : null;
};

/** Carga la previsión de un lugar con una caché en memoria de 10 minutos. */
export const useForecast = (place: Place | null) => {
  const key = keyOf(place);
  const [state, setState] = useState<State>(() => ({ key, data: fresh(key), error: null }));
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!place || !key) return;
    const cached = fresh(key);
    if (cached) {
      setState({ key, data: cached, error: null });
      return;
    }
    const controller = new AbortController();
    setState({ key, data: null, error: null });
    getForecast(place.latitude, place.longitude, controller.signal)
      .then((data) => {
        cache.set(key, { at: Date.now(), data });
        setState({ key, data, error: null });
      })
      .catch((err: Error) => {
        if (err.name === 'AbortError') return;
        setState({ key, data: null, error: 'No hemos podido cargar la previsión. Revisa tu conexión e inténtalo de nuevo.' });
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const reload = useCallback(() => {
    if (key) cache.delete(key);
    setAttempt((n) => n + 1);
  }, [key]);

  // Solo se exponen datos del lugar pedido, nunca los del anterior
  const current = state.key === key;
  return {
    data: current ? state.data : null,
    error: current ? state.error : null,
    loading: !current || (!state.data && !state.error),
    reload,
  };
};
