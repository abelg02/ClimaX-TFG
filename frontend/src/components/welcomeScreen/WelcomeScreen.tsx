import { useState } from 'react';
import styles from './WelcomeScreen.module.css';
import { ErrorMessage } from '../ErrorMessage';

type WelcomeScreenProps = {
    onCityClick: (city: string) => Promise<void>;
    showReset?: boolean;
    onReset?: () => void;
    error?: string;
    onClearError?: () => void;
};

type FeatureModalType = 'temperature' | 'wind' | 'precipitation' | 'alerts' | null;

export const WelcomeScreen = ({
    onCityClick,
    showReset = false,
    onReset,
    error,
    onClearError
}: WelcomeScreenProps) => {
    const [activeFeature, setActiveFeature] = useState<FeatureModalType>(null);
    const [quizAnswer, setQuizAnswer] = useState('');
    const [quizResult, setQuizResult] = useState('');
    const [localError, setLocalError] = useState('');

    const popularCities = [
        { name: 'Madrid', country: 'Spain' },
        { name: 'Barcelona', country: 'Spain' },
        { name: 'Valencia', country: 'Spain' },
        { name: 'Sevilla', country: 'Spain' },
        { name: 'Bilbao', country: 'Spain' },
    ];

    const handleFeatureClick = (feature: FeatureModalType) => {
        setActiveFeature(feature);
        setQuizAnswer('');
        setQuizResult('');
    };

    const handleCloseModal = () => {
        setActiveFeature(null);
    };

    const checkQuizAnswer = () => {
        const correctAnswers = {
            temperature: 'Valencia',
            wind: 'Tarifa',
            precipitation: 'Valencia',
            alerts: 'Sevilla'
        };

        if (quizAnswer.toLowerCase() === correctAnswers[activeFeature!].toLowerCase()) {
            setQuizResult('¡Correcto! 🎉');
        } else {
            setQuizResult(`Incorrecto. La respuesta correcta es ${correctAnswers[activeFeature!]}.`);
        }
    };

    const handleCitySearch = async (city: string) => {
        try {
            setLocalError('');
            await onCityClick(city);
        } catch (err) {
            setLocalError('No se pudo encontrar el clima para esta ciudad');
        }
    };

    const clearError = () => {
        setLocalError('');
        if (onClearError) onClearError();
    };

    const getFeatureContent = () => {
        switch (activeFeature) {
            case 'temperature':
                return (
                    <div className={styles.modalContent}>
                        <p className={styles.demoLabel}>Ejemplo de demostración</p>
                        <h3>🌡️ Pronóstico de temperatura</h3>
                        <p>Aquí puedes ver cómo varía la temperatura a lo largo del día en diferentes ciudades.</p>
                        <div className={styles.exampleChart}>
                            <div className={styles.chartBar} style={{ height: '150px', background: 'linear-gradient(to top, #ff6b6b, #6bc5ff)' }}></div>
                            <div className={styles.chartLabels}>
                                <span>6h: 15°C</span>
                                <span>12h: 22°C</span>
                                <span>18h: 18°C</span>
                                <span>24h: 12°C</span>
                            </div>
                        </div>
                        <div className={styles.quizSection}>
                            <p>¿En qué ciudad española se registró la temperatura más alta en 2023?</p>
                            <input
                                type="text"
                                value={quizAnswer}
                                onChange={(e) => setQuizAnswer(e.target.value)}
                                placeholder="Escribe tu respuesta"
                            />
                            <button onClick={checkQuizAnswer}>Comprobar</button>
                            {quizResult && <p className={styles.quizResult}>{quizResult}</p>}
                        </div>
                    </div>
                );
            case 'wind':
                return (
                    <div className={styles.modalContent}>
                        <p className={styles.demoLabel}>Ejemplo de demostración</p>
                        <h3>💨 Datos de viento</h3>
                        <p>Información sobre velocidad y dirección del viento:</p>
                        <div className={styles.windExample}>
                            <div className={styles.windCompass}>
                                <div className={styles.compass}>
                                    <div className={styles.direction} style={{ transform: 'rotate(45deg)' }}>↗</div>
                                    <span>N</span>
                                    <span>E</span>
                                    <span>S</span>
                                    <span>W</span>
                                </div>
                                <div className={styles.windSpeed}>20 km/h</div>
                            </div>
                            <p>La dirección del viento se mide en grados (0°-360°) indicando de dónde viene el viento.</p>
                        </div>
                        <div className={styles.quizSection}>
                            <p>¿Qué ciudad española es conocida como "la ciudad del viento"?</p>
                            <input
                                type="text"
                                value={quizAnswer}
                                onChange={(e) => setQuizAnswer(e.target.value)}
                                placeholder="Escribe tu respuesta"
                            />
                            <button onClick={checkQuizAnswer}>Comprobar</button>
                            {quizResult && <p className={styles.quizResult}>{quizResult}</p>}
                        </div>
                    </div>
                );
            case 'precipitation':
                return (
                    <div className={styles.modalContent}>
                        <p className={styles.demoLabel}>Ejemplo de demostración</p>
                        <h3>🌧️ Probabilidad de precipitaciones</h3>
                        <p>Predicción de lluvia y nieve para las próximas horas:</p>
                        <div className={styles.rainExample}>
                            {[0, 6, 12, 18].map((hour) => (
                                <div key={hour} className={styles.rainHour}>
                                    <span>{hour}h</span>
                                    <div className={styles.rainBarContainer}>
                                        <div
                                            className={styles.rainBar}
                                            style={{ height: `${Math.random() * 80 + 10}px` }}
                                        ></div>
                                    </div>
                                    <span>{Math.floor(Math.random() * 60 + 20)}%</span>
                                </div>
                            ))}
                        </div>
                        <p className={styles.rainLegend}>Cuanto más alta la barra, mayor probabilidad de lluvia.</p>
                        <div className={styles.quizSection}>
                            <p>¿Qué ciudad española tiene el récord de precipitación en 24 horas?</p>
                            <input
                                type="text"
                                value={quizAnswer}
                                onChange={(e) => setQuizAnswer(e.target.value)}
                                placeholder="Escribe tu respuesta"
                            />
                            <button onClick={checkQuizAnswer}>Comprobar</button>
                            {quizResult && <p className={styles.quizResult}>{quizResult}</p>}
                        </div>
                    </div>
                );
            case 'alerts':
                return (
                    <div className={styles.modalContent}>
                        <p className={styles.demoLabel}>Ejemplo de demostración</p>
                        <h3>⚠️ Alertas meteorológicas</h3>
                        <p>Ejemplo de alertas que puedes configurar:</p>
                        <div className={styles.alertsExample}>
                            <div className={styles.alertExampleItem}>
                                <span>🌡️ Temperatura mayor de 35°C</span>
                                <span className={styles.alertStatus}>Activa</span>
                            </div>
                            <div className={styles.alertExampleItem}>
                                <span>💨 Viento mayor de 50 km/h</span>
                                <span className={styles.alertStatus}>Inactiva</span>
                            </div>
                            <div className={styles.alertExampleItem}>
                                <span>🌧️ Lluvia mayor de 70%</span>
                                <span className={styles.alertStatus}>Activa</span>
                            </div>
                        </div>
                        <p>Recibirás notificaciones cuando se activen estas alertas.</p>
                        <div className={styles.quizSection}>
                            <p>¿En qué ciudad española se activan más alertas por calor?</p>
                            <input
                                type="text"
                                value={quizAnswer}
                                onChange={(e) => setQuizAnswer(e.target.value)}
                                placeholder="Escribe tu respuesta"
                            />
                            <button onClick={checkQuizAnswer}>Comprobar</button>
                            {quizResult && <p className={styles.quizResult}>{quizResult}</p>}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.welcomeScreen}>
            {(error || localError) && (
                <ErrorMessage message={error || localError} onClose={clearError} />
            )}

            {showReset && (
                <button onClick={onReset} className={styles.backButton}>
                    ← Volver al inicio
                </button>
            )}

            <div className={styles.welcomeHero}>
                <h1>Bienvenido a <span className={styles.appName}>ClimaX</span></h1>
                <p className={styles.subtitle}>Información meteorológica precisa</p>
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
                            onClick={() => handleCitySearch(`${city.name}, ${city.country}`)}
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
                    <div
                        className={styles.featureCard}
                        onClick={() => handleFeatureClick('temperature')}
                    >
                        <div className={styles.featureIcon}>🌡️</div>
                        <h3>Temperatura</h3>
                        <p>Pronóstico preciso por horas y días</p>
                    </div>
                    <div
                        className={styles.featureCard}
                        onClick={() => handleFeatureClick('wind')}
                    >
                        <div className={styles.featureIcon}>💨</div>
                        <h3>Viento</h3>
                        <p>Velocidad y dirección del viento</p>
                    </div>
                    <div
                        className={styles.featureCard}
                        onClick={() => handleFeatureClick('precipitation')}
                    >
                        <div className={styles.featureIcon}>🌧️</div>
                        <h3>Precipitaciones</h3>
                        <p>Probabilidad de lluvia y nieve</p>
                    </div>
                    <div
                        className={styles.featureCard}
                        onClick={() => handleFeatureClick('alerts')}
                    >
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

            {activeFeature && (
                <div className={styles.featureModal}>
                    <div className={styles.modalOverlay} onClick={handleCloseModal}></div>
                    <div className={styles.modalContainer}>
                        <button className={styles.closeModal} onClick={handleCloseModal}>
                            ×
                        </button>
                        {getFeatureContent()}
                    </div>
                </div>
            )}
        </div>
    );
};