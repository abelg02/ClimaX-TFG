import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Place } from '../../types';
import { reversePlace, searchPlaces } from '../../services/weatherService';
import { placeToSearch } from '../../utils/placeUrl';
import { placeSubtitle } from '../../utils/format';
import styles from './SearchBar.module.css';

/** Buscador con sugerencias (combobox accesible) y botón de ubicación actual. */
export const SearchBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const listId = useId();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    const controller = new AbortController();
    setSearching(true);
    const timer = setTimeout(() => {
      searchPlaces(q, controller.signal)
        .then((places) => {
          setResults(places);
          setActive(places.length ? 0 : -1);
          setSearching(false);
        })
        .catch((err: Error) => {
          if (err.name !== 'AbortError') {
            setResults([]);
            setSearching(false);
          }
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onShortcut = (e: globalThis.KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest('input, textarea');
      if (e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onShortcut);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onShortcut);
    };
  }, []);

  const go = (place: Place) => {
    // En el mapa, buscar centra el mapa; en el resto abre la previsión
    navigate({ pathname: pathname === '/mapa' ? '/mapa' : '/', search: placeToSearch(place) });
    setQuery('');
    setResults([]);
    setOpen(false);
    inputRef.current?.blur();
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setNotice('Tu navegador no permite la geolocalización');
      return;
    }
    setLocating(true);
    setNotice(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          go(await reversePlace(coords.latitude, coords.longitude));
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setNotice('No se ha podido obtener tu ubicación');
      },
      { timeout: 10000, maximumAge: 600000 },
    );
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showList = open && query.trim().length >= 2;

  return (
    <div className={styles.root} ref={rootRef}>
      <div className={styles.field}>
        <svg className={styles.glass} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
          aria-label="Buscar una ciudad"
          placeholder="Busca una ciudad…"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setNotice(null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
        <kbd className={styles.kbd} aria-hidden="true">
          /
        </kbd>
        <button
          type="button"
          className={styles.locate}
          onClick={locate}
          disabled={locating}
          aria-label="Usar mi ubicación"
          title="Usar mi ubicación"
        >
          {locating ? (
            <span className={styles.spinner} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="3.2" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
              <circle cx="12" cy="12" r="7" />
            </svg>
          )}
        </button>
      </div>

      {showList && (
        <ul id={listId} role="listbox" className={styles.list}>
          {results.map((place, i) => (
            <li
              key={`${place.latitude},${place.longitude}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? styles.activeOption : undefined}
              onPointerEnter={() => setActive(i)}
              onClick={() => go(place)}
            >
              <span className={styles.name}>{place.name}</span>
              <span className={styles.sub}>{placeSubtitle(place)}</span>
              {place.countryCode && <span className={styles.cc}>{place.countryCode}</span>}
            </li>
          ))}
          {!results.length && (
            <li className={styles.empty} aria-disabled="true">
              {searching ? 'Buscando…' : 'Sin resultados. Prueba con otro nombre.'}
            </li>
          )}
        </ul>
      )}
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}
    </div>
  );
};
