// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import { Home } from './pages/Home';
import { Auth } from './components/Auth/Auth';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Comprobar si hay un usuario logueado al cargar la app
        const user = localStorage.getItem('weatherCurrentUser');
        if (user) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('weatherCurrentUser');
        setIsAuthenticated(false);
    };

    return (
        <div className="App">
            {isAuthenticated ? (
                <>
                    <button
                        onClick={handleLogout}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            padding: '5px 10px',
                            background: '#ff4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Cerrar sesión
                    </button>
                    <Home />
                </>
            ) : (
                <Auth onLogin={handleLogin} />
            )}
        </div>
    );
}

export default App;