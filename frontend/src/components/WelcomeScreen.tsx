// frontend/src/components/WelcomeScreen.tsx
import styles from '../pages/Home.module.css';

type WelcomeScreenProps = {
    onCityClick: (city: string) => void;
    showReset?: boolean;
    onReset?: () => void;
};

export const WelcomeScreen = ({ onCityClick, showReset = false, onReset }: WelcomeScreenProps) => {
    const popularCities = [
        { name: 'Madrid', country: 'Spain' },
        { name: 'Barcelona', country: 'Spain' },
        { name: 'Valencia', country: 'Spain' },
        { name: 'Sevilla', country: 'Spain' },
        { name: 'Bilbao', country: 'Spain' },
    ];

    return (
        <div className={styles.welcomeScreen}>
            {showReset && (
                <button onClick={onReset} className={styles.backButton}>
                    ← Volver al inicio
                </button>
            )}

            <div className={styles.welcomeHero}>
                <h1>Bienvenido a <span className={styles.appName}>Climax</span></h1>
                <p className={styles.subtitle}>Tu aplicación meteorológica favorita</p>
            </div>

            <div className={styles.weatherIllustration}>
                <div className={styles.sun}></div>
                <div className={styles.cloud}></div>
                <div className={styles.cloud}></div>
            </div>

            <div className={styles.popularCitiesSection}>
                <h2>Ciudades populares en España</h2>
                <div className={styles.cityGrid}>
                    {popularCities.map(city => (
                        <button
                            key={city.name}
                            onClick={() => onCityClick(`${city.name}, ${city.country}`)}
                            className={styles.cityCard}
                        >
                            <span className={styles.cityName}>{city.name}</span>
                            <span className={styles.cityCountry}>{city.country}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.featuresSection}>
                <h2>Características principales</h2>
                <div className={styles.featuresGrid}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🌡️</div>
                        <h3>Temperatura</h3>
                        <p>Pronóstico preciso por horas y días</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>💨</div>
                        <h3>Viento</h3>
                        <p>Velocidad y dirección del viento</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🌧️</div>
                        <h3>Precipitaciones</h3>
                        <p>Probabilidad de lluvia y nieve</p>
                    </div>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>⚠️</div>
                        <h3>Alertas</h3>
                        <p>Notificaciones meteorológicas</p>
                    </div>
                </div>
            </div>

            <div className={styles.tipsSection}>
                <h2>Consejos útiles</h2>
                <ul className={styles.tipsList}>
                    <li>🔍 Busca cualquier ciudad del mundo</li>
                    <li>📅 Planifica tu semana con el pronóstico extendido</li>
                    <li>🔔 Configura alertas personalizadas</li>
                    <li>🗺️ Explora el mapa meteorológico</li>
                </ul>
            </div>
        </div>
    );
};