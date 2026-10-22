// Weather App Controller - Orchestrates the weather search workflow

import { GeocodingService } from '../services/GeocodingService';
import { WeatherService } from '../services/WeatherService';
import { validateCityName } from '../utils/validation';
import { createWeatherDisplayData } from '../utils/formatting';
import { UIState } from '../types/state';
import { GeocodingError, WeatherError } from '../types/errors';

export class WeatherAppController {
  private currentState: UIState = { type: 'idle' };
  private stateChangeCallback?: (state: UIState) => void;

  constructor(
    private geocodingService: GeocodingService,
    private weatherService: WeatherService
  ) {}

  /**
   * Register a callback to be notified of state changes
   * @param callback Function to call when state changes
   */
  onStateChange(callback: (state: UIState) => void): void {
    this.stateChangeCallback = callback;
  }

  /**
   * Get the current UI state
   */
  getState(): UIState {
    return this.currentState;
  }

  /**
   * Main workflow method: handles city search from user input
   * Orchestrates: validate → geocode → fetch weather → format → update UI
   * 
   * Requirements: 1.4, 2.1, 3.1, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3
   * 
   * @param cityName The city name entered by the user
   */
  async handleCitySearch(cityName: string): Promise<void> {
    try {
      // Step 1: Input validation (Requirement 1.3)
      console.info(`[Controller] Starting city search for: "${cityName}"`);
      const validationResult = validateCityName(cityName);
      
      if (!validationResult.isValid) {
        console.warn(`[Controller] Validation failed: ${validationResult.error}`);
        this.updateUIState({
          type: 'error',
          message: validationResult.error || 'El nombre de la ciudad es requerido'
        });
        return;
      }

      // Step 2: Update UI to loading state (Requirement 8.1)
      this.updateUIState({ type: 'loading' });

      // Step 3: Geocode the city name (Requirement 2.1)
      console.info(`[Controller] Geocoding city: ${cityName}`);
      const geocodingResult = await this.geocodingService.geocodeCity(cityName);

      if (!geocodingResult.success) {
        console.error(`[Controller] Geocoding failed: ${geocodingResult.error}`);
        const errorMessage = this.mapGeocodingErrorToMessage(geocodingResult.error, cityName);
        this.updateUIState({
          type: 'error',
          message: errorMessage
        });
        return;
      }

      // Step 4: Fetch weather data with coordinates (Requirement 3.1)
      console.info(`[Controller] Fetching weather for coordinates:`, geocodingResult.coordinates);
      const weatherResult = await this.weatherService.getCurrentWeather(geocodingResult.coordinates);

      if (!weatherResult.success) {
        console.error(`[Controller] Weather fetch failed: ${weatherResult.error}`);
        const errorMessage = this.mapWeatherErrorToMessage(weatherResult.error);
        this.updateUIState({
          type: 'error',
          message: errorMessage
        });
        return;
      }

      // Step 5: Format weather data for display (Requirements 4.2, 5.2, 6.2)
      console.info(`[Controller] Successfully retrieved weather data`);
      const displayData = createWeatherDisplayData(cityName, weatherResult.data);

      // Step 6: Update UI to success state (Requirement 8.2)
      this.updateUIState({
        type: 'success',
        data: displayData
      });

    } catch (error) {
      // Handle unexpected errors
      console.error(`[Controller] Unexpected error during city search:`, error);
      this.updateUIState({
        type: 'error',
        message: 'Ocurrió un error inesperado. Por favor intenta nuevamente.'
      });
    }
  }

  /**
   * Update the UI state and notify listeners
   * Implements state management for the application
   * 
   * Requirements: 8.1, 8.2, 8.3
   * 
   * @param newState The new UI state
   */
  private updateUIState(newState: UIState): void {
    console.debug(`[Controller] State transition: ${this.currentState.type} → ${newState.type}`);
    this.currentState = newState;

    // Notify callback if registered
    if (this.stateChangeCallback) {
      this.stateChangeCallback(newState);
    }
  }

  /**
   * Map geocoding service errors to user-friendly messages
   * Implements error routing logic for geocoding errors
   * 
   * Requirements: 7.1, 7.2
   * 
   * @param error The geocoding error type
   * @param cityName The city name that was searched
   * @returns User-friendly error message in Spanish
   */
  private mapGeocodingErrorToMessage(error: GeocodingError, cityName: string): string {
    switch (error) {
      case 'CITY_NOT_FOUND':
        // Requirement 7.1: City not found error message
        return `No se pudo encontrar la ciudad "${cityName}". Por favor verifica el nombre.`;
      
      case 'SERVICE_UNAVAILABLE':
        // Requirement 7.2: Service unavailable error message
        return 'El servicio de geocodificación no está disponible temporalmente. Por favor intenta más tarde.';
      
      case 'NETWORK_ERROR':
        return 'Error de conexión. Por favor verifica tu conexión a internet e intenta nuevamente.';
      
      default:
        return 'Ocurrió un error al buscar la ciudad. Por favor intenta nuevamente.';
    }
  }

  /**
   * Map weather service errors to user-friendly messages
   * Implements error routing logic for weather service errors
   * 
   * Requirements: 7.3
   * 
   * @param error The weather service error type
   * @returns User-friendly error message in Spanish
   */
  private mapWeatherErrorToMessage(error: WeatherError): string {
    switch (error) {
      case 'DATA_UNAVAILABLE':
        // Requirement 7.3: Weather data unavailable error
        return 'Los datos meteorológicos están incompletos. Por favor intenta nuevamente.';
      
      case 'SERVICE_UNAVAILABLE':
        // Requirement 7.3: Weather service unavailable error
        return 'Los datos meteorológicos no están disponibles en este momento. Por favor intenta más tarde.';
      
      case 'NETWORK_ERROR':
        return 'Error de conexión. Por favor verifica tu conexión a internet e intenta nuevamente.';
      
      default:
        return 'No se pudieron obtener los datos meteorológicos. Por favor intenta nuevamente.';
    }
  }
}
