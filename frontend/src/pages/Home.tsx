// frontend/src/pages/Home.tsx
import { useEffect, useState } from 'react';
import styles from './Home.module.css';
import { SearchBar } from '../components/SearchBar';
import { CurrentWeather } from '../components/CurrentWeather';
import { TemperatureChart } from '../components/TemperatureChart';
import { HourlyForecast } from '../components/HourlyForecast';
import { WeeklyForecast } from '../components/WeeklyForecast';
import { useWeather } from '../context/WeatherContext';
import { ErrorMessage } from '../components/ErrorMessage';
import { AirQuality } from '../components/AirQuality';
import { UVIndex } from '../components/UVIndex';
import { WeatherAlerts } from '../components/WeatherAlerts';
import { getWeatherStyles } from '../utils/weatherStyles';
import { WelcomeScreen } from '../components/WelcomeScreen';

export const Home = () => {
    const { weatherData, loading, error, fetchWeather, resetWeather } = useWeather();
    const [showWelcome, setShowWelcome] = useState(false);

    const handleSearch = async (city: string) => {
        try {
            await fetchWeather(city);
            setShowWelcome(false);
        } catch (err) {
            setShowWelcome(true);
        }
    };

    useEffect(() => {
        if (weatherData) {
            const weatherCode = weatherData.current.condition.code;
            const isDay = weatherData.current.is_day;
            const weatherStyles = getWeatherStyles(weatherCode, isDay);

            document.documentElement.style.setProperty('--bg-gradient', weatherStyles.background);
            document.documentElement.style.setProperty('--text-color', weatherStyles.textColor);
            document.documentElement.style.setProperty('--card-bg', weatherStyles.cardBg);
        }
    }, [weatherData]);

    return (
        <div className={styles.container}>
                    <SearchBar onSearch={handleSearch} loading={loading} />

                    {error && <ErrorMessage message={error} />}

                    {weatherData ? (
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
                    <WeatherAlerts weatherData={weatherData} />
                </main>
            ) : (
                <WelcomeScreen
                    onCityClick={handleSearch}
                    showReset={false}
                />
            )}
        </div>
    );
};