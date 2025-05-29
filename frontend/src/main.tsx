import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { WeatherProvider } from './context/WeatherContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <WeatherProvider>
        <App />
      </WeatherProvider>
    </Router>
  </React.StrictMode>
);