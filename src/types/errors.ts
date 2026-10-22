// Error types for the Weather App

export type GeocodingError = 
  | 'CITY_NOT_FOUND'
  | 'SERVICE_UNAVAILABLE'
  | 'NETWORK_ERROR';

export type WeatherError = 
  | 'DATA_UNAVAILABLE'
  | 'SERVICE_UNAVAILABLE'
  | 'NETWORK_ERROR';

export type ErrorType = 
  | 'VALIDATION_ERROR'
  | 'CITY_NOT_FOUND'
  | 'SERVICE_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface ErrorResponse {
  type: ErrorType;
  message: string;           // User-friendly message
  technicalDetails?: string; // Optional technical details for logging
}
