// Unit tests for WeatherAppController

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WeatherAppController } from './WeatherAppController';
import { GeocodingService } from '../services/GeocodingService';
import { WeatherService } from '../services/WeatherService';
import { UIState } from '../types/state';

describe('WeatherAppController', () => {
  let controller: WeatherAppController;
  let mockGeocodingService: GeocodingService;
  let mockWeatherService: WeatherService;
  let stateChanges: UIState[];

  beforeEach(() => {
    // Create mock services
    mockGeocodingService = new GeocodingService();
    mockWeatherService = new WeatherService();
    
    // Create controller
    controller = new WeatherAppController(mockGeocodingService, mockWeatherService);
    
    // Track state changes
    stateChanges = [];
    controller.onStateChange((state) => {
      stateChanges.push(state);
    });
  });

  describe('Input Validation', () => {
    it('should reject empty city name', async () => {
      await controller.handleCitySearch('');
      
      expect(stateChanges).toHaveLength(1);
      expect(stateChanges[0].type).toBe('error');
      if (stateChanges[0].type === 'error') {
        expect(stateChanges[0].message).toContain('requerido');
      }
    });

    it('should reject whitespace-only city name', async () => {
      await controller.handleCitySearch('   ');
      
      expect(stateChanges).toHaveLength(1);
      expect(stateChanges[0].type).toBe('error');
      if (stateChanges[0].type === 'error') {
        expect(stateChanges[0].message).toContain('requerido');
      }
    });

    it('should reject city name with only tabs and newlines', async () => {
      await controller.handleCitySearch('\t\n\t');
      
      expect(stateChanges).toHaveLength(1);
      expect(stateChanges[0].type).toBe('error');
      if (stateChanges[0].type === 'error') {
        expect(stateChanges[0].message).toContain('requerido');
      }
    });

    it('should not call geocoding service when validation fails', async () => {
      const geocodeSpy = vi.spyOn(mockGeocodingService, 'geocodeCity');
      
      await controller.handleCitySearch('');
      
      expect(geocodeSpy).not.toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    it('should start in idle state', () => {
      const state = controller.getState();
      expect(state.type).toBe('idle');
    });

    it('should transition to loading state on valid input', async () => {
      // Mock geocoding to return an error to stop workflow quickly
      vi.spyOn(mockGeocodingService, 'geocodeCity').mockResolvedValue({
        success: false,
        error: 'CITY_NOT_FOUND'
      });

      await controller.handleCitySearch('Berlin');
      
      // Should have loading state, then error state
      expect(stateChanges.length).toBeGreaterThanOrEqual(1);
      expect(stateChanges[0].type).toBe('loading');
    });

    it('should transition to success state on successful weather retrieval', async () => {
      // Mock successful geocoding
      vi.spyOn(mockGeocodingService, 'geocodeCity').mockResolvedValue({
        success: true,
        coordinates: { latitude: 52.52, longitude: 13.405 }
      });

      // Mock successful weather retrieval
      vi.spyOn(mockWeatherService, 'getCurrentWeather').mockResolvedValue({
        success: true,
        data: {
          temperature: 15.3,
          humidity: 65,
          precipitation: 0.0,
          timestamp: new Date()
        }
      });

      await controller.handleCitySearch('Berlin');
      
      // Should transition: loading → success
      expect(stateChanges).toHaveLength(2);
      expect(stateChanges[0].type).toBe('loading');
      expect(stateChanges[1].type).toBe('success');
      
      if (stateChanges[1].type === 'success') {
        expect(stateChanges[1].data.cityName).toBe('Berlin');
        expect(stateChanges[1].data.temperature).toContain('°C');
        expect(stateChanges[1].data.humidity).toContain('%');
        expect(stateChanges[1].data.precipitation).toContain('mm');
      }
    });

    it('should transition to error state on geocoding failure', async () => {
      // Mock geocoding failure
      vi.spyOn(mockGeocodingService, 'geocodeCity').mockResolvedValue({
        success: false,
        error: 'CITY_NOT_FOUND'
      });

      await controller.handleCitySearch('UnknownCity');
      
      // Should transition: loading → error
      expect(stateChanges).toHaveLength(2);
      expect(stateChanges[0].type).toBe('loading');
      expect(stateChanges[1].type).toBe('error');
    });

    it('should transition to error state on weather service failure', async () => {
      // Mock successful geocoding
      vi.spyOn(mockGeocodingService, 'geocodeCity').mockResolvedValue({
        success: true,
        coordinates: { latitude: 52.52, longitude: 13.405 }
      });

      // Mock weather service failure
      vi.spyOn(mockWeatherService, 'getCurrentWeather').mockResolvedValue({
        success: false,
        error: 'SERVICE_UNAVAILABLE'
      });

      await controller.handleCitySearch('Berlin');
      
      // Should transition: loading → error
      expect(stateChanges).toHaveLength(2);
      expect(stateChanges[0].type).toBe('loading');
      expect(stateChanges[1].type).toBe('error');
    });
  });

  describe('Error Routing - Geocoding Errors', () => {
    it('should map CITY_NOT_FOUND error to user-friendly message', async () => {
      // Mock city not found error
      vi.spyOn(mockGeocodingService, 'geocodeCity').mockResolvedValue({
        success: false,
        error: 'CITY_NOT_FOUND'
      });

      await controller.handleCitySearch('UnknownCity');
      
      const errorState = stateChanges[stateChanges.length - 1];
      expect(errorState.type).toBe('error');
      if (errorState.type === 'error') {
        expect(errorState.message).toContain('No se pudo encontrar la ciudad');
        expect(errorState.message).toContain('UnknownCity');
      }
    });

    it('should map SERVICE_UNAVAILABLE error to user-friendly message', async () => {
      // Mock service unavailable error
      vi.spyOn(mockGeocodingService, 'geocodeCity').mockResolvedValue({
        success: false,
        error: 'SERVICE_UNAVAILABLE'
      });

      await controller.handleCitySearch('Berlin');
      
      const errorState = stateChanges[stateChanges.length - 1];
      expect(errorState.type).toBe('error');
      if (errorState.type === 'error') {
        expect(errorState.message).toContain('geocodificación');
        expect(errorState.message).toContain('temporalmente');
      }
    });

    it('should map NETWORK_ERROR to user-friendly message', async () => {
      // Mock network error
      vi.spyOn(mockGeocodingService, 'geocodeCity').mockResolvedValue({
        success: false,
        error: 'NETWORK_ERROR'
      });

      await controller.handleCitySearch('Berlin');
      
      const errorState = stateChanges[stateChanges.length - 1];
      expect(errorState.type).toBe('error');
      if (errorState.type === 'error') {
        expect(errorState.message).toContain('conexión');
      }
    });
  });

  describe('Error Routing - Weather Service Errors', () => {
    beforeEach(() => {
      // Mock successful geocoding for all weather service tests
      vi.spyOn(mockGeocodingService, 'geocodeCity').mockResolvedValue({
        success: true,
        coordinates: { latitude: 52.52, longitude: 13.405 }
      });
    });

    it('should map DATA_UNAVAILABLE error to user-friendly message', async () => {
      // Mock data unavailable error
      vi.spyOn(mockWeatherService, 'getCurrentWeather').mockResolvedValue({
        success: false,
        error: 'DATA_UNAVAILABLE'
      });

      await controller.handleCitySearch('Berlin');
      
      const errorState = stateChanges[stateChanges.length - 1];
      expect(errorState.type).toBe('error');
      if (errorState.type === 'error') {
        expect(errorState.message).toContain('meteorológicos');
        expect(errorState.message).toContain('incompletos');
      }
    });

    it('should map SERVICE_UNAVAILABLE error to user-friendly message', async () => {
      // Mock service unavailable error
      vi.spyOn(mockWeatherService, 'getCurrentWeather').mockResolvedValue({
        success: false,
        error: 'SERVICE_UNAVAILABLE'
      });

      await controller.handleCitySearch('Berlin');
      
      const errorState = stateChanges[stateChanges.length - 1];
      expect(errorState.type).toBe('error');
      if (errorState.type === 'error') {
        expect(errorState.message).toContain('meteorológicos');
        expect(errorState.message).toContain('no están disponibles');
      }
    });

    it('should map NETWORK_ERROR to user-friendly message', async () => {
      // Mock network error
      vi.spyOn(mockWeatherService, 'getCurrentWeather').mockResolvedValue({
        success: false,
        error: 'NETWORK_ERROR'
      });

      await controller.handleCitySearch('Berlin');
      
      const errorState = stateChanges[stateChanges.length - 1];
      expect(errorState.type).toBe('error');
      if (errorState.type === 'error') {
        expect(errorState.message).toContain('conexión');
      }
    });
  });

  describe('Workflow Orchestration', () => {
    it('should call services in correct order: geocode then weather', async () => {
      const geocodeCallOrder: number[] = [];
      const weatherCallOrder: number[] = [];
      let callCounter = 0;

      // Mock geocoding to track call order
      vi.spyOn(mockGeocodingService, 'geocodeCity').mockImplementation(async () => {
        geocodeCallOrder.push(++callCounter);
        return {
          success: true,
          coordinates: { latitude: 52.52, longitude: 13.405 }
        };
      });

      // Mock weather service to track call order
      vi.spyOn(mockWeatherService, 'getCurrentWeather').mockImplementation(async () => {
        weatherCallOrder.push(++callCounter);
        return {
          success: true,
          data: {
            temperature: 15.3,
            humidity: 65,
            precipitation: 0.0,
            timestamp: new Date()
          }
        };
      });

      await controller.handleCitySearch('Berlin');
      
      expect(geocodeCallOrder).toHaveLength(1);
      expect(weatherCallOrder).toHaveLength(1);
      expect(geocodeCallOrder[0]).toBeLessThan(weatherCallOrder[0]);
    });

    it('should not call weather service if geocoding fails', async () => {
      // Mock geocoding failure
      vi.spyOn(mockGeocodingService, 'geocodeCity').mockResolvedValue({
        success: false,
        error: 'CITY_NOT_FOUND'
      });

      const weatherSpy = vi.spyOn(mockWeatherService, 'getCurrentWeather');

      await controller.handleCitySearch('UnknownCity');
      
      expect(weatherSpy).not.toHaveBeenCalled();
    });

    it('should pass coordinates from geocoding to weather service', async () => {
      const expectedCoordinates = { latitude: 52.52, longitude: 13.405 };

      // Mock geocoding
      vi.spyOn(mockGeocodingService, 'geocodeCity').mockResolvedValue({
        success: true,
        coordinates: expectedCoordinates
      });

      const weatherSpy = vi.spyOn(mockWeatherService, 'getCurrentWeather').mockResolvedValue({
        success: true,
        data: {
          temperature: 15.3,
          humidity: 65,
          precipitation: 0.0,
          timestamp: new Date()
        }
      });

      await controller.handleCitySearch('Berlin');
      
      expect(weatherSpy).toHaveBeenCalledWith(expectedCoordinates);
    });

    it('should format weather data with city name before updating UI', async () => {
      const cityName = 'Berlin';
      
      // Mock successful workflow
      vi.spyOn(mockGeocodingService, 'geocodeCity').mockResolvedValue({
        success: true,
        coordinates: { latitude: 52.52, longitude: 13.405 }
      });

      vi.spyOn(mockWeatherService, 'getCurrentWeather').mockResolvedValue({
        success: true,
        data: {
          temperature: 15.3,
          humidity: 65,
          precipitation: 0.0,
          timestamp: new Date()
        }
      });

      await controller.handleCitySearch(cityName);
      
      const successState = stateChanges[stateChanges.length - 1];
      expect(successState.type).toBe('success');
      if (successState.type === 'success') {
        expect(successState.data.cityName).toBe(cityName);
        // Verify formatting is applied
        expect(successState.data.temperature).toBe('15.3°C');
        expect(successState.data.humidity).toBe('65%');
        expect(successState.data.precipitation).toBe('0.0 mm');
      }
    });
  });

  describe('Unexpected Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      // Mock geocoding to throw an unexpected error
      vi.spyOn(mockGeocodingService, 'geocodeCity').mockRejectedValue(
        new Error('Unexpected error')
      );

      await controller.handleCitySearch('Berlin');
      
      const errorState = stateChanges[stateChanges.length - 1];
      expect(errorState.type).toBe('error');
      if (errorState.type === 'error') {
        expect(errorState.message).toContain('inesperado');
      }
    });

    it('should handle unknown geocoding error types with default message', async () => {
      // Mock geocoding with an invalid error type (by force-casting)
      vi.spyOn(mockGeocodingService, 'geocodeCity').mockResolvedValue({
        success: false,
        error: 'UNKNOWN_ERROR' as any
      });

      await controller.handleCitySearch('Berlin');
      
      const errorState = stateChanges[stateChanges.length - 1];
      expect(errorState.type).toBe('error');
      if (errorState.type === 'error') {
        expect(errorState.message).toContain('error al buscar la ciudad');
      }
    });

    it('should handle unknown weather error types with default message', async () => {
      // Mock successful geocoding
      vi.spyOn(mockGeocodingService, 'geocodeCity').mockResolvedValue({
        success: true,
        coordinates: { latitude: 52.52, longitude: 13.405 }
      });

      // Mock weather service with an invalid error type (by force-casting)
      vi.spyOn(mockWeatherService, 'getCurrentWeather').mockResolvedValue({
        success: false,
        error: 'UNKNOWN_ERROR' as any
      });

      await controller.handleCitySearch('Berlin');
      
      const errorState = stateChanges[stateChanges.length - 1];
      expect(errorState.type).toBe('error');
      if (errorState.type === 'error') {
        expect(errorState.message).toContain('No se pudieron obtener los datos meteorológicos');
      }
    });
  });
});
