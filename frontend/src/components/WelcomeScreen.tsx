import styles from '../pages/Home.module.css';

type WelcomeScreenProps = {
    onCityClick: (city: string) => void;
    showReset?: boolean;
    onReset?: () => void;
};

export const WelcomeScreen = ({ onCityClick, showReset = false, onReset }: WelcomeScreenProps) => {
    const popularCities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao', 'Málaga'];

    return (
        <div className={styles.welcomeContainer}>
            {showReset && (
                <button onClick={onReset} className={styles.backButton}>
                    ← Volver al inicio
                </button>
            )}

            <div className={styles.welcomeCard}>
                <h2>👋 ¡Bienvenido a Climax!</h2>
                <p>Busca una ciudad para ver el pronóstico meteorológico completo.</p>

                <div className={styles.weatherTips}>
                    <h3>💡 Consejos útiles:</h3>
                    <ul>
                        <li>Haz clic en cualquier región del mapa para ver detalles</li>
                        <li>Configura alertas personalizadas para condiciones específicas</li>
                        <li>Expande cada día para ver detalles completos del pronóstico</li>
                    </ul>
                </div>

                <div className={styles.popularCities}>
                    <h3>🌆 Ciudades populares:</h3>
                    <div className={styles.cityButtons}>
                        {popularCities.map(city => (
                            <button
                                key={city}
                                onClick={() => onCityClick(city)}
                                className={styles.cityButton}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.featuresGrid}>
                    <div className={styles.featureCard}>
                        <span>🌡️</span>
                        <h4>Temperatura</h4>
                        <p>Pronóstico por horas y días</p>
                    </div>
                    <div className={styles.featureCard}>
                        <span>💨</span>
                        <h4>Viento</h4>
                        <p>Velocidad y dirección</p>
                    </div>
                    <div className={styles.featureCard}>
                        <span>🌫️</span>
                        <h4>Calidad del aire</h4>
                        <p>Índice AQI detallado</p>
                    </div>
                    <div className={styles.featureCard}>
                        <span>⚠️</span>
                        <h4>Alertas</h4>
                        <p>Configura tus propias alertas</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
