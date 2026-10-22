// API response models for Open-Meteo APIs

export interface GeocodingApiResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
    // ... other fields not used
  }>;
}

export interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  current: {
    time: string;                    // ISO 8601 timestamp
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
  };
  // ... other fields not used
}
