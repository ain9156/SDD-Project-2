// Unit tests for formatting utilities

import { describe, test, expect } from 'vitest';
import {
  formatTemperature,
  formatHumidity,
  formatPrecipitation,
  createWeatherDisplayData,
} from './formatting';
import { WeatherData } from '../types/models';

describe('formatTemperature', () => {
  test('formats positive temperature to 1 decimal place with °C unit', () => {
    expect(formatTemperature(15.3)).toBe('15.3°C');
  });

  test('formats negative temperature to 1 decimal place with °C unit', () => {
    expect(formatTemperature(-5.7)).toBe('-5.7°C');
  });

  test('formats zero temperature correctly', () => {
    expect(formatTemperature(0)).toBe('0.0°C');
  });

  test('rounds temperature to 1 decimal place when given more decimals', () => {
    expect(formatTemperature(15.346)).toBe('15.3°C');
    expect(formatTemperature(15.356)).toBe('15.4°C');
  });

  test('formats large temperature values correctly', () => {
    expect(formatTemperature(50.0)).toBe('50.0°C');
    expect(formatTemperature(-50.0)).toBe('-50.0°C');
  });
});

describe('formatHumidity', () => {
  test('formats humidity as integer with % symbol', () => {
    expect(formatHumidity(65)).toBe('65%');
  });

  test('rounds humidity to integer (no decimal places)', () => {
    expect(formatHumidity(65.4)).toBe('65%');
    expect(formatHumidity(65.6)).toBe('66%');
  });

  test('formats zero humidity correctly', () => {
    expect(formatHumidity(0)).toBe('0%');
  });

  test('formats 100% humidity correctly', () => {
    expect(formatHumidity(100)).toBe('100%');
  });

  test('rounds fractional humidity values properly', () => {
    expect(formatHumidity(33.33)).toBe('33%');
    expect(formatHumidity(66.67)).toBe('67%');
  });
});

describe('formatPrecipitation', () => {
  test('formats precipitation to 1 decimal place with mm unit', () => {
    expect(formatPrecipitation(0.0)).toBe('0.0 mm');
  });

  test('formats non-zero precipitation correctly', () => {
    expect(formatPrecipitation(5.3)).toBe('5.3 mm');
  });

  test('rounds precipitation to 1 decimal place when given more decimals', () => {
    expect(formatPrecipitation(2.346)).toBe('2.3 mm');
    expect(formatPrecipitation(2.356)).toBe('2.4 mm');
  });

  test('formats large precipitation values correctly', () => {
    expect(formatPrecipitation(125.7)).toBe('125.7 mm');
  });

  test('formats very small precipitation values correctly', () => {
    expect(formatPrecipitation(0.1)).toBe('0.1 mm');
  });
});

describe('createWeatherDisplayData', () => {
  test('creates formatted weather display data with all fields', () => {
    const weatherData: WeatherData = {
      temperature: 15.3,
      humidity: 65,
      precipitation: 0.0,
      timestamp: new Date(),
    };

    const result = createWeatherDisplayData('Berlin', weatherData);

    expect(result).toEqual({
      cityName: 'Berlin',
      temperature: '15.3°C',
      humidity: '65%',
      precipitation: '0.0 mm',
    });
  });

  test('formats all values according to their specific rules', () => {
    const weatherData: WeatherData = {
      temperature: 22.567, // Should round to 1 decimal
      humidity: 78.432,    // Should round to integer
      precipitation: 3.987, // Should round to 1 decimal
      timestamp: new Date(),
    };

    const result = createWeatherDisplayData('Tokyo', weatherData);

    expect(result).toEqual({
      cityName: 'Tokyo',
      temperature: '22.6°C',
      humidity: '78%',
      precipitation: '4.0 mm',
    });
  });

  test('handles negative temperatures correctly', () => {
    const weatherData: WeatherData = {
      temperature: -10.5,
      humidity: 45,
      precipitation: 0.0,
      timestamp: new Date(),
    };

    const result = createWeatherDisplayData('Moscow', weatherData);

    expect(result.temperature).toBe('-10.5°C');
  });

  test('handles edge case values', () => {
    const weatherData: WeatherData = {
      temperature: 0,
      humidity: 0,
      precipitation: 0,
      timestamp: new Date(),
    };

    const result = createWeatherDisplayData('TestCity', weatherData);

    expect(result).toEqual({
      cityName: 'TestCity',
      temperature: '0.0°C',
      humidity: '0%',
      precipitation: '0.0 mm',
    });
  });

  test('preserves city name as provided', () => {
    const weatherData: WeatherData = {
      temperature: 20,
      humidity: 50,
      precipitation: 1.5,
      timestamp: new Date(),
    };

    const result = createWeatherDisplayData('New York', weatherData);

    expect(result.cityName).toBe('New York');
  });
});
