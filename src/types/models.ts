// Domain models for the Weather App

export interface Coordinates {
  latitude: number;   // Range: -90 to 90
  longitude: number;  // Range: -180 to 180
}

export interface WeatherData {
  temperature: number;      // Celsius, typically -50 to 50
  humidity: number;         // Percentage, 0 to 100
  precipitation: number;    // Millimeters, >= 0
  timestamp: Date;          // UTC timestamp
}

export interface WeatherDisplayData {
  cityName: string;
  temperature: string;       // Formatted: "15.3°C"
  humidity: string;          // Formatted: "65%"
  precipitation: string;     // Formatted: "0.0 mm"
}

export interface CitySearchRequest {
  cityName: string;
}
