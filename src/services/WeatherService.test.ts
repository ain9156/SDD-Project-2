// Unit tests for WeatherService

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WeatherService } from './WeatherService';
import type { Coordinates } from '../types/models';
import type { WeatherApiResponse } from '../types/api';

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(() => {
    service = new WeatherService();
    vi.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    const mockCoordinates: Coordinates = {
      latitude: 52.52,
      longitude: 13.41
    };

    it('should successfully fetch weather data with all required fields', async () => {
      const mockResponse: WeatherApiResponse = {
        latitude: 52.52,
        longitude: 13.41,
        current: {
          time: '2024-01-01T12:00:00Z',
          temperature_2m: 15.3,
          relative_humidity_2m: 65,
          precipitation: 0.0
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.getCurrentWeather(mockCoordinates);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.temperature).toBe(15.3);
        expect(result.data.humidity).toBe(65);
        expect(result.data.precipitation).toBe(0.0);
        expect(result.data.timestamp).toBeInstanceOf(Date);
      }
    });

    it('should build API URL with correct parameters', async () => {
      const mockResponse: WeatherApiResponse = {
        latitude: 52.52,
        longitude: 13.41,
        current: {
          time: '2024-01-01T12:00:00Z',
          temperature_2m: 20.0,
          relative_humidity_2m: 50,
          precipitation: 0.0
        }
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });
      global.fetch = fetchMock;

      await service.getCurrentWeather(mockCoordinates);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('https://api.open-meteo.com/v1/forecast')
      );
      
      const calledUrl = fetchMock.mock.calls[0][0];
      expect(calledUrl).toContain('latitude=52.52');
      expect(calledUrl).toContain('longitude=13.41');
      expect(calledUrl).toContain('current=temperature_2m%2Crelative_humidity_2m%2Cprecipitation');
      expect(calledUrl).toContain('temperature_unit=celsius');
    });

    it('should return DATA_UNAVAILABLE error when temperature field is missing', async () => {
      const mockResponse = {
        latitude: 52.52,
        longitude: 13.41,
        current: {
          time: '2024-01-01T12:00:00Z',
          relative_humidity_2m: 65,
          precipitation: 0.0
          // temperature_2m is missing
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.getCurrentWeather(mockCoordinates);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('DATA_UNAVAILABLE');
      }
    });

    it('should return DATA_UNAVAILABLE error when humidity field is missing', async () => {
      const mockResponse = {
        latitude: 52.52,
        longitude: 13.41,
        current: {
          time: '2024-01-01T12:00:00Z',
          temperature_2m: 15.3,
          precipitation: 0.0
          // relative_humidity_2m is missing
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.getCurrentWeather(mockCoordinates);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('DATA_UNAVAILABLE');
      }
    });

    it('should return DATA_UNAVAILABLE error when precipitation field is missing', async () => {
      const mockResponse = {
        latitude: 52.52,
        longitude: 13.41,
        current: {
          time: '2024-01-01T12:00:00Z',
          temperature_2m: 15.3,
          relative_humidity_2m: 65
          // precipitation is missing
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.getCurrentWeather(mockCoordinates);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('DATA_UNAVAILABLE');
      }
    });

    it('should return DATA_UNAVAILABLE error when current object is missing', async () => {
      const mockResponse = {
        latitude: 52.52,
        longitude: 13.41
        // current object is missing
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.getCurrentWeather(mockCoordinates);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('DATA_UNAVAILABLE');
      }
    });

    it('should return SERVICE_UNAVAILABLE error for HTTP 404 error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result = await service.getCurrentWeather(mockCoordinates);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('SERVICE_UNAVAILABLE');
      }
    });

    it('should return SERVICE_UNAVAILABLE error for HTTP 500 error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await service.getCurrentWeather(mockCoordinates);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('SERVICE_UNAVAILABLE');
      }
    });

    it('should return SERVICE_UNAVAILABLE error for HTTP 503 error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable'
      });

      const result = await service.getCurrentWeather(mockCoordinates);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('SERVICE_UNAVAILABLE');
      }
    });

    it('should return NETWORK_ERROR when fetch throws an error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network connection failed'));

      const result = await service.getCurrentWeather(mockCoordinates);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('NETWORK_ERROR');
      }
    });

    it('should return NETWORK_ERROR when JSON parsing fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      const result = await service.getCurrentWeather(mockCoordinates);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('NETWORK_ERROR');
      }
    });

    it('should handle negative temperatures correctly', async () => {
      const mockResponse: WeatherApiResponse = {
        latitude: 52.52,
        longitude: 13.41,
        current: {
          time: '2024-01-01T12:00:00Z',
          temperature_2m: -15.5,
          relative_humidity_2m: 80,
          precipitation: 5.2
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.getCurrentWeather(mockCoordinates);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.temperature).toBe(-15.5);
        expect(result.data.humidity).toBe(80);
        expect(result.data.precipitation).toBe(5.2);
      }
    });

    it('should handle zero values correctly', async () => {
      const mockResponse: WeatherApiResponse = {
        latitude: 52.52,
        longitude: 13.41,
        current: {
          time: '2024-01-01T12:00:00Z',
          temperature_2m: 0,
          relative_humidity_2m: 0,
          precipitation: 0
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.getCurrentWeather(mockCoordinates);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.temperature).toBe(0);
        expect(result.data.humidity).toBe(0);
        expect(result.data.precipitation).toBe(0);
      }
    });

    it('should handle extreme coordinate values', async () => {
      const extremeCoordinates: Coordinates = {
        latitude: -89.99,
        longitude: 179.99
      };

      const mockResponse: WeatherApiResponse = {
        latitude: -89.99,
        longitude: 179.99,
        current: {
          time: '2024-01-01T12:00:00Z',
          temperature_2m: -50.0,
          relative_humidity_2m: 100,
          precipitation: 0.0
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.getCurrentWeather(extremeCoordinates);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.temperature).toBe(-50.0);
        expect(result.data.humidity).toBe(100);
        expect(result.data.precipitation).toBe(0.0);
      }
    });
  });
});
