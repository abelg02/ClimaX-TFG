// frontend/src/components/SearchBar.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import styles from '../pages/Home.module.css';

type SearchBarProps = {
    onSearch: (city: string) => void;
    loading: boolean;
};

export const SearchBar = ({ onSearch, loading }: SearchBarProps) => {
    const [city, setCity] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (city.trim()) {
            onSearch(city);
            setCity(''); // Limpiamos el input después de buscar
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.searchForm}>
            <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Buscar ciudad..."
                className={styles.searchInput}
            />
            <div style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}>🔍</div>
            <button
                type="submit"
                disabled={loading || !city.trim()}
                className={styles.searchButton}
            >
                {loading ? <>⏳ Buscando...</> : <>🔍 Buscar</>}
            </button>
        </form>
    );
};