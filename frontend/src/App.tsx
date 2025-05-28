import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Auth } from './components/Auth/Auth';
import { onAuthStateChange, auth } from './services/firebase';
import { SettingsMenu } from './components/SettingsMenu';


function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChange((user) => {
            setIsAuthenticated(!!user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    return (
        <div className="App">
            {isAuthenticated ? (
                <>
                    <SettingsMenu onLogout={handleLogout} />
                    <Home />
                </>
            ) : (
                <Auth onLogin={handleLogin} />
            )}
        </div>
    );
}

export default App;