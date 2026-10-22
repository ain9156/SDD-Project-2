// Formatting utilities for weather data display

import { WeatherData, WeatherDisplayData } from '../types/models';

/**
 * Format temperature value to one decimal place with Celsius unit
 * @param temp Temperature in Celsius
 * @returns Formatted string like "15.3°C"
 */
export function formatTemperature(temp: number): string {
  return `${temp.toFixed(1)}°C`;
}

/**
 * Format humidity value to integer with percentage symbol
 * @param humidity Humidity percentage (0-100)
 * @returns Formatted string like "65%"
 */
export function formatHumidity(humidity: number): string {
  return `${Math.round(humidity)}%`;
}

/**
 * Format precipitation value to one decimal place with millimeters unit
 * @param precip Precipitation in millimeters
 * @returns Formatted string like "0.0 mm"
 */
export function formatPrecipitation(precip: number): string {
  return `${precip.toFixed(1)} mm`;
}

/**
 * Create weather display data by formatting weather data with city name
 * @param cityName Name of the city
 * @param data Raw weather data
 * @returns Formatted weather display data ready for UI
 */
export function createWeatherDisplayData(
  cityName: string,
  data: WeatherData
): WeatherDisplayData {
  console.debug(`[Formatting] Formatting weather data for ${cityName}:`, data);
  
  const displayData = {
    cityName,
    temperature: formatTemperature(data.temperature),
    humidity: formatHumidity(data.humidity),
    precipitation: formatPrecipitation(data.precipitation),
  };
  
  console.debug(`[Formatting] Formatted display data:`, displayData);
  
  return displayData;
}
