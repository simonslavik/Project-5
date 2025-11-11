import axios from 'axios';
import { insertWeatherData, WeatherData } from '../database/db';
import { logger } from '../utils/logger';

interface OpenWeatherMapResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '1h'?: number;
  };
  visibility?: number;
}

export async function collectWeatherData(): Promise<void> {
  const startTime = Date.now();
  
  try {
    logger.info('🌤️  [Weather Collector] Starting collection...');

    // Validate environment variables
    const API_KEY = process.env.WEATHER_API_KEY;
    if (!API_KEY || API_KEY === 'your_openweathermap_api_key_here') {
      logger.warn('[Weather Collector] ⚠️  API key not configured. Skipping collection.');
      logger.info('[Weather Collector] Get your free API key at: https://openweathermap.org/api');
      return;
    }

    const LOCATION = process.env.WEATHER_LOCATION || 'New York';
    const LAT = process.env.WEATHER_LAT;
    const LON = process.env.WEATHER_LON;

    let url: string;
    
    // Use coordinates if available, otherwise use city name
    if (LAT && LON) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`;
    } else {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${LOCATION}&appid=${API_KEY}&units=metric`;
    }

    // Fetch weather data
    const response = await axios.get<OpenWeatherMapResponse>(url, {
      timeout: 10000, // 10 second timeout
    });

    // Extract and structure data
    const weatherData: WeatherData = {
      time: new Date(),
      location: LOCATION,
      temperature: response.data.main.temp,
      feels_like: response.data.main.feels_like,
      humidity: response.data.main.humidity,
      pressure: response.data.main.pressure,
      weather_condition: response.data.weather[0].main,
      weather_description: response.data.weather[0].description,
      wind_speed: response.data.wind.speed,
      clouds: response.data.clouds.all,
      precipitation: response.data.rain?.['1h'] || 0,
      visibility: response.data.visibility,
    };

    // Save to database
    await insertWeatherData(weatherData);

    const duration = Date.now() - startTime;
    logger.info(
      `[Weather Collector] ✅ Success (${duration}ms): ${weatherData.temperature.toFixed(1)}°C, ` +
      `${weatherData.weather_description}, humidity ${weatherData.humidity}%`
    );

  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        logger.error(
          `[Weather Collector] ❌ API Error (${duration}ms):`,
          error.response.status,
          error.response.data
        );
      } else if (error.request) {
        logger.error(`[Weather Collector] ❌ Network Error (${duration}ms): No response received`);
      } else {
        logger.error(`[Weather Collector] ❌ Request Error (${duration}ms):`, error.message);
      }
    } else {
      logger.error(`[Weather Collector] ❌ Unexpected Error (${duration}ms):`, error);
    }
  }
}
