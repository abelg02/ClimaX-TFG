const API_KEY = '2492e2fb53484460909160443252005';
const BASE_URL = 'https://api.weatherapi.com/v1';

export const getCurrentWeather = async (city: string) => {
    try {
        const response = await fetch(
            `${BASE_URL}/current.json?key=${API_KEY}&q=${city}&lang=es`
        );
        if (!response.ok) {
            throw new Error('Ciudad no encontrada');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
};