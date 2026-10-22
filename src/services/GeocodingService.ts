import { Coordinates } from '../types/models';
import { GeocodingError } from '../types/errors';
import { GeocodingApiResponse } from '../types/api';

export type GeocodingResult = 
  | { success: true; coordinates: Coordinates }
  | { success: false; error: GeocodingError };

export class GeocodingService {
  private readonly baseUrl = 'https://geocoding-api.open-meteo.com/v1/search';

  /**
   * Convert a city name to geographic coordinates using Open-Meteo Geocoding API
   * @param cityName - The name of the city to geocode
   * @returns Promise with geocoding result (coordinates or error)
   */
  async geocodeCity(cityName: string): Promise<GeocodingResult> {
    try {
      // Build API URL with query parameters
      const url = new URL(this.baseUrl);
      url.searchParams.append('name', cityName);
      url.searchParams.append('count', '1');
      url.searchParams.append('language', 'en');
      url.searchParams.append('format', 'json');

      console.info(`[GeocodingService] Calling API for city: ${cityName}`);

      // Make HTTP request
      const response = await fetch(url.toString());

      // Handle HTTP errors (4xx, 5xx status codes)
      if (!response.ok) {
        console.error(`[GeocodingService] HTTP error ${response.status} for city: ${cityName}`);
        return {
          success: false,
          error: 'SERVICE_UNAVAILABLE'
        };
      }

      // Parse JSON response
      const data: GeocodingApiResponse = await response.json();

      // Handle empty results - city not found
      if (!data.results || data.results.length === 0) {
        console.warn(`[GeocodingService] City not found: ${cityName}`);
        return {
          success: false,
          error: 'CITY_NOT_FOUND'
        };
      }

      // Extract coordinates from first result
      const firstResult = data.results[0];
      const coordinates: Coordinates = {
        latitude: firstResult.latitude,
        longitude: firstResult.longitude
      };

      console.info(`[GeocodingService] Successfully geocoded ${cityName} to`, coordinates);

      return {
        success: true,
        coordinates
      };

    } catch (error) {
      // Handle network errors (fetch failures, connection issues, etc.)
      console.error(`[GeocodingService] Network error for city ${cityName}:`, error);
      return {
        success: false,
        error: 'NETWORK_ERROR'
      };
    }
  }
}
