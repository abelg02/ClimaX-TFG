// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Auth } from './components/Auth/Auth';
import { onAuthStateChange, auth } from './services/firebase';
import { RegionalMap } from './components/RegionalMap';
import styles from './pages/Home.module.css';
import { useWeather } from './context/WeatherContext';

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

    const handleLogout = async () => {
        try {
            await auth.signOut();
            setIsAuthenticated(false);
            resetWeather();
            navigate('/');
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    if (loading) {
        return <div className={styles.loadingMessage}>Cargando...</div>;
    }

    return (
        <div className="App">
            {isAuthenticated && (
                <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                >
                    Cerrar sesión
                </button>
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