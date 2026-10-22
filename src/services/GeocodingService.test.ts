import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeocodingService } from './GeocodingService';
import { GeocodingApiResponse } from '../types/api';

describe('GeocodingService', () => {
  let service: GeocodingService;

  beforeEach(() => {
    service = new GeocodingService();
    vi.clearAllMocks();
  });

  describe('geocodeCity', () => {
    it('should successfully geocode a city and return coordinates', async () => {
      // Mock successful API response
      const mockResponse: GeocodingApiResponse = {
        results: [{
          id: 1,
          name: 'Berlin',
          latitude: 52.52,
          longitude: 13.41,
          country: 'Germany'
        }]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.geocodeCity('Berlin');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.coordinates.latitude).toBe(52.52);
        expect(result.coordinates.longitude).toBe(13.41);
      }
    });

    it('should return CITY_NOT_FOUND error when results array is empty', async () => {
      // Mock API response with empty results
      const mockResponse: GeocodingApiResponse = {
        results: []
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.geocodeCity('NonExistentCity123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('CITY_NOT_FOUND');
      }
    });

    it('should return CITY_NOT_FOUND error when results is undefined', async () => {
      // Mock API response with no results field
      const mockResponse: GeocodingApiResponse = {};

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.geocodeCity('NonExistentCity');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('CITY_NOT_FOUND');
      }
    });

    it('should return SERVICE_UNAVAILABLE error for HTTP 4xx errors', async () => {
      // Mock HTTP 404 response
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404
      });

      const result = await service.geocodeCity('Berlin');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('SERVICE_UNAVAILABLE');
      }
    });

    it('should return SERVICE_UNAVAILABLE error for HTTP 5xx errors', async () => {
      // Mock HTTP 500 response
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      });

      const result = await service.geocodeCity('Berlin');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('SERVICE_UNAVAILABLE');
      }
    });

    it('should return NETWORK_ERROR for network failures', async () => {
      // Mock network error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network failure'));

      const result = await service.geocodeCity('Berlin');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('NETWORK_ERROR');
      }
    });

    it('should build correct API URL with query parameters', async () => {
      const mockResponse: GeocodingApiResponse = {
        results: [{
          id: 1,
          name: 'London',
          latitude: 51.51,
          longitude: -0.13,
          country: 'UK'
        }]
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });
      global.fetch = mockFetch;

      await service.geocodeCity('London');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('name=London')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('count=1')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('format=json')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('language=en')
      );
    });

    it('should extract coordinates from the first result only', async () => {
      // Mock response with multiple results
      const mockResponse: GeocodingApiResponse = {
        results: [
          {
            id: 1,
            name: 'Paris',
            latitude: 48.85,
            longitude: 2.35,
            country: 'France'
          },
          {
            id: 2,
            name: 'Paris',
            latitude: 33.66,
            longitude: -95.55,
            country: 'USA'
          }
        ]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await service.geocodeCity('Paris');

      expect(result.success).toBe(true);
      if (result.success) {
        // Should use first result (Paris, France)
        expect(result.coordinates.latitude).toBe(48.85);
        expect(result.coordinates.longitude).toBe(2.35);
      }
    });
  });
});
