import styles from './Home.module.css';
import { SearchBar } from '../components/SearchBar';
import { CurrentWeather } from '../components/CurrentWeather';
import { TemperatureChart } from '../components/TemperatureChart';
import { HourlyForecast } from '../components/HourlyForecast';
import { WeeklyForecast } from '../components/WeeklyForecast';
import { useWeather } from '../context/WeatherContext';
import { ErrorMessage } from '../components/ErrorMessage';
import { AirQuality } from '../components/AirQuality';
import { UVIndex } from '../components/UVIndex'; // 👈 no olvides importar esto
import { WeatherAlerts } from '../components/WeatherAlerts';

export const Home = () => {
    const { weatherData, loading, error, fetchWeather } = useWeather();

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div style={{ position: 'absolute', top: '15px', left: '20px', fontSize: '1.8rem' }}>🌤</div>
                <h1 style={{ margin: '0 0 20px 0', fontSize: '2.2rem', fontWeight: '600' }}>ClimaX</h1>
                <SearchBar onSearch={fetchWeather} loading={loading} />
            </header>

            {error && <ErrorMessage message={error} />}

            {weatherData && (
                <main>
                    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                        <div>
                            <CurrentWeather data={weatherData} />

                            {weatherData?.current?.air_quality && (
                                <AirQuality aqi={weatherData.current.air_quality['us-epa-index']} />
                            )}

                            {weatherData?.current?.uv && (
                                <UVIndex uv={weatherData.current.uv} />
                            )}
                        </div>

                        <TemperatureChart
                            hourlyData={weatherData.forecast.forecastday[0].hour.map((hour) => ({
                                time: `${new Date(hour.time).getHours()}h`,
                                temp: hour.temp_c
                            }))}
                        />
                    </section>

                    <HourlyForecast hours={weatherData.forecast.forecastday[0].hour} />
                    <WeeklyForecast days={weatherData.forecast.forecastday} />

                    {weatherData && (
                        <WeatherAlerts weatherData={weatherData} />
                    )}
                </main>
            )}
        </div>
    );
};
