// Weather Service for retrieving weather data from Open-Meteo API

import type { Coordinates, WeatherData } from '../types/models';
import type { WeatherError } from '../types/errors';
import type { WeatherApiResponse } from '../types/api';

export type WeatherResult = 
  | { success: true; data: WeatherData }
  | { success: false; error: WeatherError };

export class WeatherService {
  private readonly baseUrl = 'https://api.open-meteo.com/v1/forecast';

  /**
   * Retrieves current weather data for the given coordinates
   * @param coordinates The latitude and longitude to fetch weather for
   * @returns A promise resolving to either weather data or an error
   */
  async getCurrentWeather(coordinates: Coordinates): Promise<WeatherResult> {
    try {
      // Build API URL with coordinates and required parameters
      const url = this.buildApiUrl(coordinates);

      console.info(`[WeatherService] Calling Weather API for coordinates:`, coordinates);

      // Make HTTP request to Open-Meteo Weather API
      const response = await fetch(url);

      // Handle HTTP errors
      if (!response.ok) {
        console.error(`[WeatherService] HTTP error ${response.status} for coordinates (${coordinates.latitude}, ${coordinates.longitude})`);
        return {
          success: false,
          error: 'SERVICE_UNAVAILABLE'
        };
      }

      // Parse JSON response
      const data: WeatherApiResponse = await response.json();

      // Validate response structure and extract weather data
      const weatherData = this.extractWeatherData(data);

      if (!weatherData) {
        console.error('[WeatherService] Weather API returned incomplete data:', data);
        return {
          success: false,
          error: 'DATA_UNAVAILABLE'
        };
      }

      console.info('[WeatherService] Successfully retrieved weather data:', weatherData);

      return {
        success: true,
        data: weatherData
      };

    } catch (error) {
      // Handle network errors and other exceptions
      console.error('[WeatherService] Network error:', error);
      return {
        success: false,
        error: 'NETWORK_ERROR'
      };
    }
  }

  /**
   * Builds the API URL with the required parameters
   * @param coordinates The latitude and longitude
   * @returns The complete API URL
   */
  private buildApiUrl(coordinates: Coordinates): string {
    const params = new URLSearchParams({
      latitude: coordinates.latitude.toString(),
      longitude: coordinates.longitude.toString(),
      current: 'temperature_2m,relative_humidity_2m,precipitation',
      temperature_unit: 'celsius',
      timezone: 'auto'
    });

    return `${this.baseUrl}?${params.toString()}`;
  }

  /**
   * Extracts and validates weather data from API response
   * @param response The API response
   * @returns WeatherData if all fields are present, null otherwise
   */
  private extractWeatherData(response: WeatherApiResponse): WeatherData | null {
    // Check if current object exists
    if (!response.current) {
      return null;
    }

    const { temperature_2m, relative_humidity_2m, precipitation } = response.current;

    // Validate all required fields are present and valid numbers
    if (
      typeof temperature_2m !== 'number' ||
      typeof relative_humidity_2m !== 'number' ||
      typeof precipitation !== 'number'
    ) {
      return null;
    }

    return {
      temperature: temperature_2m,
      humidity: relative_humidity_2m,
      precipitation: precipitation,
      timestamp: new Date()
    };
  }
}
