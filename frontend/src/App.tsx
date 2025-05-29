import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Auth } from './components/Auth/Auth';
import { onAuthStateChange, auth } from './services/firebase';
import { SettingsMenu } from './components/SettingsMenu';
import { RegionalMap } from './components/RegionalMap';
import styles from './pages/Home.module.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChange((user) => {
            setIsAuthenticated(!!user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
        navigate('/');
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            setIsAuthenticated(false);
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
            {isAuthenticated ? (
                <>
                    <SettingsMenu onLogout={handleLogout} />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/map/:region" element={<RegionalMap />} />
                    </Routes>
                </>
            ) : (
                <Auth onLogin={handleLogin} />
            )}
        </div>
    );
}

export default App;