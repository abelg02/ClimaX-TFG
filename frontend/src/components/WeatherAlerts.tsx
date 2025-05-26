import { useState, useEffect } from 'react';
import styles from '../pages/Home.module.css';

type AlertType = 'rain' | 'temp' | 'wind' | 'air';
type ConditionType = 'above' | 'below';

type Alert = {
  id: string;
  type: AlertType;
  condition: ConditionType;
  value: number;
  active: boolean;
  notified?: boolean;
};

const DEFAULT_ALERTS: Alert[] = [
  { id: '1', type: 'rain', condition: 'above', value: 70, active: true },
  { id: '2', type: 'temp', condition: 'above', value: 30, active: false },
];

export const WeatherAlerts = ({ weatherData }: { weatherData: any }) => {
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('weatherAlerts');
    return saved ? JSON.parse(saved) : DEFAULT_ALERTS;
  });

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('weatherAlerts', JSON.stringify(alerts));
  }, [alerts]);

  // Función para mostrar notificaciones
  const showNotification = (message: string) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification("Alerta ClimaX", { body: message });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Alerta ClimaX", { body: message });
        }
      });
    }
  };

  // Verificar alertas
  const checkAlerts = () => {
    if (!weatherData) return [];

    return alerts.filter(alert => {
      if (!alert.active) return false;

      let conditionMet = false;
      let message = '';

      switch(alert.type) {
        case 'rain':
          const rainChance = weatherData.forecast?.forecastday[0]?.day?.daily_chance_of_rain || 0;
          conditionMet = alert.condition === 'above'
            ? rainChance > alert.value
            : rainChance < alert.value;
          message = `Probabilidad de lluvia: ${rainChance}%`;
          break;

        case 'temp':
          const temp = weatherData.current?.temp_c;
          conditionMet = temp && (
            alert.condition === 'above'
              ? temp > alert.value
              : temp < alert.value
          );
          message = `Temperatura actual: ${temp}°C`;
          break;
      }

      if (conditionMet && !alert.notified) {
        showNotification(`¡Alerta! ${message}`);
        return true;
      }
      return false;
    });
  };

  // Ejecutar comprobación cuando cambian los datos
  useEffect(() => {
    if (weatherData) {
      const triggeredAlerts = checkAlerts();

      // Marcar como notificadas
      if (triggeredAlerts.length > 0) {
        setAlerts(alerts.map(alert =>
          triggeredAlerts.some(a => a.id === alert.id)
            ? { ...alert, notified: true }
            : alert
        ));
      }
    }
  }, [weatherData]);

  // Añadir nueva alerta (mejorado)
  const addNewAlert = () => {
    const newAlert: Alert = {
      id: Date.now().toString(),
      type: 'temp',
      condition: 'above',
      value: 25,
      active: true,
      notified: false
    };
    setAlerts([...alerts, newAlert]);
  };

  // Eliminar alerta
  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  // Actualizar alerta
  const updateAlert = (id: string, updates: Partial<Alert>) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, ...updates } : alert
    ));
  };

  // Alertas activadas actualmente
  const activeAlerts = checkAlerts();

  return (
    <div className={styles.alertsContainer}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>⚠️</span> Alertas Meteorológicas
      </h3>

      <div className={styles.alertSettings}>
        {alerts.map(alert => (
          <div key={alert.id} className={styles.alertItem}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <input
                type="checkbox"
                checked={alert.active}
                onChange={() => updateAlert(alert.id, { active: !alert.active, notified: false })}
              />
              <span>
                {`${alert.type === 'rain' ? 'Lluvia >' : 'Temp. '}${alert.condition === 'above' ? '>' : '<'} ${alert.value}${alert.type === 'rain' ? '%' : '°C'}`}
              </span>
            </div>
            <button
              onClick={() => removeAlert(alert.id)}
              className={styles.removeAlertButton}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button
          onClick={addNewAlert}
          className={styles.addAlertButton}
        >
          + Añadir alerta
        </button>

        <button
          onClick={() => setAlerts(DEFAULT_ALERTS)}
          className={styles.resetAlertsButton}
        >
          Restablecer
        </button>
      </div>

      {activeAlerts.length > 0 && (
        <div className={styles.activeAlerts}>
          <h4>Alertas activas ahora:</h4>
          <ul>
            {activeAlerts.map(alert => (
              <li key={alert.id}>
                {alert.type === 'rain'
                  ? `Lluvia: ${weatherData.forecast.forecastday[0].day.daily_chance_of_rain}%`
                  : `Temp: ${weatherData.current.temp_c}°C`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};