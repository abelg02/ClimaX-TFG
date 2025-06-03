// frontend/src/components/SearchBar.tsx
import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import styles from '../pages/Home.module.css';

type SearchBarProps = {
    onSearch: (city: string) => void;
    loading: boolean;
    onSettingsClick?: () => void;
    onLogoClick?: () => void;
};

type Suggestion = {
    display_name: string;
    lat: string;
    lon: string;
};

export const SearchBar = ({ onSearch, loading, onSettingsClick, onLogoClick }: SearchBarProps) => {
    const [city, setCity] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
    const searchRef = useRef<HTMLDivElement>(null);

    const fetchSuggestions = async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`
            );
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSuggestions(city);
        }, 300);

        return () => clearTimeout(timer);
    }, [city]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (city.trim()) {
            onSearch(city);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: Suggestion) => {
        setCity(suggestion.display_name);
        onSearch(suggestion.display_name);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSuggestion(prev =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSuggestion(prev =>
                prev > 0 ? prev - 1 : 0
            );
        } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
            e.preventDefault();
            handleSuggestionClick(suggestions[selectedSuggestion]);
        }
    };

    return (
        <div className={styles.searchContainer} ref={searchRef}>
            <a
                href="/"
                className={styles.appTitle}
                onClick={(e) => {
                    e.preventDefault();
                    onLogoClick?.();
                }}
            >
                <span>🌤</span> ClimaX
            </a>

            <form onSubmit={handleSubmit} className={styles.searchForm}>
                <div className={styles.searchInputWrapper}>
                    <input
                        type="text"
                        value={city}
                        onChange={(e) => {
                            setCity(e.target.value);
                            setShowSuggestions(true);
                            setSelectedSuggestion(-1);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Buscar ciudad..."
                        className={styles.searchInput}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                        <div className={styles.suggestionsDropdown}>
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={`${suggestion.lat},${suggestion.lon}`}
                                    className={`${styles.suggestionItem} ${
                                        index === selectedSuggestion ? styles.selectedSuggestion : ''
                                    }`}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion.display_name.split(',').slice(0, 3).join(',')}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={loading || !city.trim()}
                    className={styles.searchButton}
                >
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            <button
                onClick={onSettingsClick}
                className={styles.settingsButton}
            >
                ⚙️
            </button>
        </div>
    );
};