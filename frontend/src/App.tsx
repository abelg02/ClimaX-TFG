// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Auth } from './components/auth/Auth';
import { onAuthStateChange } from './services/firebase';
import { RegionalMap } from './components/regionalMap/RegionalMap';
import { Menu } from './components/menu/Menu';
import { SearchBar } from './components/search/SearchBar';
import { useWeather } from './context/WeatherContext';
import styles from './pages/Home.module.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { resetWeather } = useWeather();

    useEffect(() => {
        const unsubscribe = onAuthStateChange((user) => {
            setIsAuthenticated(!!user);
            setLoading(false);
            if (!user) {
                resetWeather();
            }
        });
        return unsubscribe;
    }, [resetWeather]);

    const handleLogin = () => {
        setIsAuthenticated(true);
        resetWeather();
        navigate('/');
    };

    const handleLogoClick = () => {
        resetWeather();
    };

    if (loading) {
        return <div className={styles.loadingMessage}>Cargando...</div>;
    }

    return (
        <div className="App">
            {isAuthenticated && (
                <>
                    <SearchBar onSearch={() => {}} loading={false} onLogoClick={handleLogoClick} />
                    <Menu />
                </>
            )}
            {isAuthenticated ? (
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/map/:region" element={<RegionalMap />} />
                </Routes>
            ) : (
                <Auth onLogin={handleLogin} />
            )}
        </div>
    );
}

export default App;