// frontend/src/utils/weatherStyles.ts
export const getWeatherStyles = (weatherCode: number, isDay: number) => {
    // Códigos basados en la API de WeatherAPI (https://www.weatherapi.com/docs/weather_conditions.json)
    const clearCodes = [1000];
    const cloudyCodes = [1003, 1006, 1009];
    const rainyCodes = [
        1030, 1063, 1069, 1072, 1087, 1150, 1153, 1168, 1171,
        1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240,
        1243, 1246, 1273, 1276
    ];
    const snowyCodes = [
        1066, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219,
        1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264,
        1279, 1282
    ];
    const thunderCodes = [1087, 1273, 1276];
    const foggyCodes = [1135, 1147];

    // Determinar el tipo de clima
    let weatherType = 'default';

    if (clearCodes.includes(weatherCode)) {
        weatherType = isDay ? 'clear-day' : 'clear-night';
    } else if (cloudyCodes.includes(weatherCode)) {
        weatherType = 'cloudy';
    } else if (rainyCodes.includes(weatherCode)) {
        weatherType = 'rainy';
    } else if (snowyCodes.includes(weatherCode)) {
        weatherType = 'snowy';
    } else if (thunderCodes.includes(weatherCode)) {
        weatherType = 'thunder';
    } else if (foggyCodes.includes(weatherCode)) {
        weatherType = 'foggy';
    }

    // Estilos para cada tipo de clima
    const styles = {
        'clear-day': {
            background: 'linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)',
            textColor: '#fff',
            cardBg: 'rgba(255, 255, 255, 0.15)'
        },
        'clear-night': {
            background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
            textColor: '#fff',
            cardBg: 'rgba(255, 255, 255, 0.1)'
        },
        'cloudy': {
            background: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
            textColor: '#fff',
            cardBg: 'rgba(255, 255, 255, 0.15)'
        },
        'rainy': {
            background: 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
            textColor: '#fff',
            cardBg: 'rgba(255, 255, 255, 0.15)'
        },
        'snowy': {
            background: 'linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)',
            textColor: '#333',
            cardBg: 'rgba(255, 255, 255, 0.7)'
        },
        'thunder': {
            background: 'linear-gradient(135deg, #373B44 0%, #4286f4 100%)',
            textColor: '#fff',
            cardBg: 'rgba(255, 255, 255, 0.1)'
        },
        'foggy': {
            background: 'linear-gradient(135deg, #606c88 0%, #3f4c6b 100%)',
            textColor: '#fff',
            cardBg: 'rgba(255, 255, 255, 0.1)'
        },
        'default': {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            textColor: '#fff',
            cardBg: 'rgba(255, 255, 255, 0.15)'
        }
    };

    return styles[weatherType] || styles['default'];
};