// frontend/src/components/WeatherAlerts.tsx
import { useState, useEffect } from 'react';
import styles from '../pages/Home.module.css';

type AlertType = 'rain' | 'temp' | 'wind' | 'humidity';
type ConditionType = 'above' | 'below';

interface Alert {
  id: string;
  type: AlertType;
  condition: ConditionType;
  value: number;
  active: boolean;
  notified?: boolean;
}

const DEFAULT_ALERTS: Alert[] = [
  { id: '1', type: 'rain', condition: 'above', value: 70, active: true },
  { id: '2', type: 'temp', condition: 'above', value: 30, active: true },
];

const ALERT_OPTIONS = [
  { value: 'rain', label: 'Lluvia', unit: '%', min: 0, max: 100, step: 5 },
  { value: 'temp', label: 'Temperatura', unit: '°C', min: -20, max: 50, step: 1 },
  { value: 'wind', label: 'Viento', unit: 'km/h', min: 0, max: 100, step: 5 },
  { value: 'humidity', label: 'Humedad', unit: '%', min: 0, max: 100, step: 5 },
];

export const WeatherAlerts = ({ weatherData }: { weatherData: any }) => {
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('weatherAlerts');
    return saved ? JSON.parse(saved) : DEFAULT_ALERTS;
  });
  const [isAdding, setIsAdding] = useState(false);
  const [newAlert, setNewAlert] = useState<Omit<Alert, 'id' | 'notified'>>({
    type: 'temp',
    condition: 'above',
    value: 25,
    active: true
  });

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('weatherAlerts', JSON.stringify(alerts));
  }, [alerts]);

  // Mostrar notificaciones
  const showNotification = (message: string) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification("⚠️ Alerta ClimaX", { body: message });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("⚠️ Alerta ClimaX", { body: message });
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
      let currentValue = 0;

      switch(alert.type) {
        case 'rain':
          currentValue = weatherData.forecast?.forecastday[0]?.day?.daily_chance_of_rain || 0;
          conditionMet = alert.condition === 'above'
            ? currentValue > alert.value
            : currentValue < alert.value;
          message = `Probabilidad de lluvia: ${currentValue}% (Umbral: ${alert.condition === 'above' ? '>' : '<'} ${alert.value}%)`;
          break;

        case 'temp':
          currentValue = weatherData.current?.temp_c || 0;
          conditionMet = alert.condition === 'above'
            ? currentValue > alert.value
            : currentValue < alert.value;
          message = `Temperatura actual: ${currentValue}°C (Umbral: ${alert.condition === 'above' ? '>' : '<'} ${alert.value}°C)`;
          break;

        case 'wind':
          currentValue = weatherData.current?.wind_kph || 0;
          conditionMet = alert.condition === 'above'
            ? currentValue > alert.value
            : currentValue < alert.value;
          message = `Velocidad del viento: ${currentValue} km/h (Umbral: ${alert.condition === 'above' ? '>' : '<'} ${alert.value} km/h)`;
          break;

        case 'humidity':
          currentValue = weatherData.current?.humidity || 0;
          conditionMet = alert.condition === 'above'
            ? currentValue > alert.value
            : currentValue < alert.value;
          message = `Humedad: ${currentValue}% (Umbral: ${alert.condition === 'above' ? '>' : '<'} ${alert.value}%)`;
          break;
      }

      if (conditionMet && !alert.notified) {
        showNotification(`¡Alerta de ${alert.type}! ${message}`);
        return true;
      }
      return false;
    });
  };

  // Comprobar alertas cuando cambian los datos
  useEffect(() => {
    if (weatherData) {
      const triggeredAlerts = checkAlerts();

      if (triggeredAlerts.length > 0) {
        setAlerts(alerts.map(alert =>
          triggeredAlerts.some(a => a.id === alert.id)
            ? { ...alert, notified: true }
            : alert
        ));
      }
    }
  }, [weatherData]);

  // Añadir nueva alerta
  const addAlert = () => {
    const alertToAdd = {
      ...newAlert,
      id: Date.now().toString(),
      notified: false
    };
    setAlerts([...alerts, alertToAdd]);
    setIsAdding(false);
    setNewAlert({ type: 'temp', condition: 'above', value: 25, active: true });
  };

  // Eliminar alerta
  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  // Actualizar alerta
  const updateAlert = (id: string, field: keyof Alert, value: any) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, [field]: value, notified: false } : alert
    ));
  };

  // Alertas activadas actualmente
  const activeAlerts = checkAlerts();

  return (
    <div className={styles.alertsContainer}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-color)' }}>
        <span>⚠️</span> Alertas Meteorológicas
      </h3>

      <div className={styles.alertList}>
        {alerts.map(alert => {
          const option = ALERT_OPTIONS.find(o => o.value === alert.type);
          return (
            <div key={alert.id} className={styles.alertItem}>
              <div className={styles.alertControls}>
                <input
                  type="checkbox"
                  checked={alert.active}
                  onChange={(e) => updateAlert(alert.id, 'active', e.target.checked)}
                  className={styles.alertCheckbox}
                />

                <select
                  value={alert.type}
                  onChange={(e) => updateAlert(alert.id, 'type', e.target.value as AlertType)}
                  className={styles.alertSelect}
                >
                  {ALERT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={alert.condition}
                  onChange={(e) => updateAlert(alert.id, 'condition', e.target.value as ConditionType)}
                  className={styles.alertSelect}
                >
                  <option value="above">Mayor de</option>
                  <option value="below">Menor de</option>
                </select>

                <input
                  type="number"
                  value={alert.value}
                  onChange={(e) => updateAlert(alert.id, 'value', Number(e.target.value))}
                  min={option?.min}
                  max={option?.max}
                  step={option?.step}
                  className={styles.alertInput}
                />

                <span className={styles.alertUnit}>{option?.unit}</span>
              </div>

              <button
                onClick={() => removeAlert(alert.id)}
                className={styles.removeAlertButton}
                title="Eliminar alerta"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {isAdding ? (
        <div className={styles.newAlertForm}>
          <div className={styles.formRow}>
            <label>Tipo:</label>
            <select
              value={newAlert.type}
              onChange={(e) => setNewAlert({...newAlert, type: e.target.value as AlertType})}
              className={styles.alertSelect}
            >
              {ALERT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <label>Condición:</label>
            <select
              value={newAlert.condition}
              onChange={(e) => setNewAlert({...newAlert, condition: e.target.value as ConditionType})}
              className={styles.alertSelect}
            >
              <option value="above">Mayor que</option>
              <option value="below">Menor que</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <label>Valor:</label>
            <input
              type="number"
              value={newAlert.value}
              onChange={(e) => setNewAlert({...newAlert, value: Number(e.target.value)})}
              min={ALERT_OPTIONS.find(o => o.value === newAlert.type)?.min}
              max={ALERT_OPTIONS.find(o => o.value === newAlert.type)?.max}
              step={ALERT_OPTIONS.find(o => o.value === newAlert.type)?.step}
              className={styles.alertInput}
            />
            <span className={styles.alertUnit}>
              {ALERT_OPTIONS.find(o => o.value === newAlert.type)?.unit}
            </span>
          </div>

          <div className={styles.formButtons}>
            <button
              onClick={addAlert}
              className={styles.confirmButton}
            >
              Confirmar
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className={styles.cancelButton}
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.alertActions}>
          <button
            onClick={() => setIsAdding(true)}
            className={styles.addAlertButton}
          >
            + Añadir nueva alerta
          </button>
          <button
            onClick={() => setAlerts(DEFAULT_ALERTS)}
            className={styles.resetAlertsButton}
          >
            Restablecer alertas
          </button>
        </div>
      )}

      {activeAlerts.length > 0 && (
        <div className={styles.activeAlerts}>
          <h4>🚨 Alertas activas:</h4>
          <ul>
            {activeAlerts.map(alert => {
              const option = ALERT_OPTIONS.find(o => o.value === alert.type);
              return (
                <li key={alert.id}>
                  {option?.label}: {alert.condition === 'above' ? '>' : '<'} {alert.value}{option?.unit}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};