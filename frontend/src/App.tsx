import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Home } from './pages/home/Home';
import { Menu } from './components/common/menu/Menu';
import { SkyBackdrop } from './components/weather/skyBackdrop/SkyBackdrop';
import { useWeather } from './context/WeatherContext';
import './App.css';

// Leaflet y Firebase Auth solo se descargan al entrar en su página
const RegionalMap = lazy(() => import('./pages/regionalMap/RegionalMap').then((m) => ({ default: m.RegionalMap })));
const Auth = lazy(() => import('./pages/auth/Auth').then((m) => ({ default: m.Auth })));

function App() {
  const { pathname } = useLocation();
  const { dataSource } = useWeather();
  const isMap = pathname === '/mapa';

  return (
    <>
      <SkyBackdrop />
      <Menu />
      <main className={isMap ? 'app-main app-main--full' : 'app-main'}>
        <Suspense fallback={<div className="page-loading" aria-label="Cargando" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/mapa" element={<RegionalMap />} />
            <Route path="/cuenta" element={<Auth />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!isMap && (
        <footer className="app-footer">
          <p>
            <span className={`source-dot ${dataSource === 'api' ? 'is-api' : ''}`} />
            {dataSource === 'api' ? 'Datos servidos por la API Spring Boot' : 'Modo demo · datos directos de Open-Meteo'}
          </p>
          <p>
            Datos: <a href="https://open-meteo.com/">Open-Meteo</a> · Radar:{' '}
            <a href="https://www.rainviewer.com/">RainViewer</a> · Mapa: © <a href="https://www.esri.com/">Esri</a>, ©{' '}
            <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>
          </p>
          <p>
            ClimaX · Proyecto de fin de grado ·{' '}
            <a href="https://github.com/abelg02/ClimaX-TFG">Código en GitHub</a>
          </p>
        </footer>
      )}
    </>
  );
}

export default App;
