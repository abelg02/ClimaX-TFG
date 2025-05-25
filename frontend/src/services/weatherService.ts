// frontend/src/services/weatherService.ts

export interface WeatherData {
  location: any;
  current: any;
  forecast: any;
}

export const getWeatherForecast = async (city: string): Promise<WeatherData> => {
  try {
    const response = await fetch(`http://localhost:8080/api/weather/${city}`);

    if (!response.ok) {
      throw new Error('Ciudad no encontrada');
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener el clima:', error);
    throw error;
  }
};
