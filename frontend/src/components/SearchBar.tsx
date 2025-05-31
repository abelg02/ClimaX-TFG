// frontend/src/components/SearchBar.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import styles from '../pages/Home.module.css';

type SearchBarProps = {
    onSearch: (city: string) => void;
    loading: boolean;
    onSettingsClick?: () => void; // Nueva prop para manejar el clic en ajustes
};

export const SearchBar = ({ onSearch, loading, onSettingsClick }: SearchBarProps) => {
    const [city, setCity] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (city.trim()) {
            onSearch(city);
        }
    };

    return (
        <div className={styles.searchContainer}>
            <a href="/" className={styles.appTitle}>
                <span>🌤</span> ClimaX
            </a>

            <form onSubmit={handleSubmit} className={styles.searchForm}>
                <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Buscar ciudad..."
                    className={styles.searchInput}
                />
                <button
                    type="submit"
                    disabled={loading || !city.trim()}
                    className={styles.searchButton}
                >
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            {/* Botón de ajustes añadido aquí */}
            <button
                onClick={onSettingsClick}
                className={styles.settingsButton}
            >
                ⚙️
            </button>
        </div>
    );
};