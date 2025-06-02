// frontend/src/components/Menu/Menu.tsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWeather } from '../../context/WeatherContext';
import { auth } from '../../services/firebase';
import styles from '../../pages/Home.module.css';

type MenuItem = {
  icon: string;
  label: string;
  action: () => void;
  requiresWeatherData?: boolean;
};

export const Menu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { weatherData, setDisplayMode } = useWeather();

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const isMapPage = location.pathname.includes('/map');
  const isWelcomePage = !weatherData && !isMapPage;

  const menuItems: MenuItem[] = [
    {
      icon: '⚙️',
      label: 'Configuración',
      action: () => {
        alert('Configuración: Próximamente podrás personalizar tu experiencia');
      }
    },
    ...(isMapPage ? [
      {
        icon: '👁️',
        label: 'Mostrar todo',
        action: () => {
          setDisplayMode('all');
          navigate('/');
        },
        requiresWeatherData: true
      }
    ] : []),
    ...(!isMapPage && !isWelcomePage ? [
      {
        icon: '🌡️',
        label: 'Mostrar solo temperatura',
        action: () => setDisplayMode('temperature'),
        requiresWeatherData: true
      },
      {
        icon: '💧',
        label: 'Mostrar solo humedad',
        action: () => setDisplayMode('humidity'),
        requiresWeatherData: true
      },
      {
        icon: '🗓️',
        label: 'Mostrar pronóstico semanal',
        action: () => setDisplayMode('weekly'),
        requiresWeatherData: true
      },
      {
        icon: '👁️',
        label: 'Mostrar todo',
        action: () => setDisplayMode('all'),
        requiresWeatherData: true
      },
      {
        icon: '🗺️',
        label: 'Ver mapa completo',
        action: () => {
          if (weatherData?.location?.region) {
            navigate(`/map/${encodeURIComponent(weatherData.location.region)}`, {
              state: {
                cityData: {
                  name: weatherData.location.name,
                  lat: weatherData.location.lat,
                  lon: weatherData.location.lon
                }
              }
            });
          }
        },
        requiresWeatherData: true
      }
    ] : []),
    {
      icon: '🚪',
      label: 'Cerrar sesión',
      action: handleLogout
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.menuContainer} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.menuButton}
        aria-label="Menú"
      >
        <span className={styles.menuIcon}>☰</span>
      </button>

      {isOpen && (
        <div className={styles.menuDropdown}>
          {menuItems
            .filter(item => !item.requiresWeatherData || weatherData)
            .map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className={styles.menuItem}
              >
                <span className={styles.menuItemIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};