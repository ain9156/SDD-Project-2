// Unit tests for formatting utilities

import { describe, test, expect } from 'vitest';
import fc from 'fast-check';
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

describe('formatTemperature - Edge Cases (Task 6.3)', () => {
  test('handles very large positive temperatures', () => {
    expect(formatTemperature(100.5)).toBe('100.5°C');
    expect(formatTemperature(999.9)).toBe('999.9°C');
  });

  test('handles very large negative temperatures', () => {
    expect(formatTemperature(-100.5)).toBe('-100.5°C');
    expect(formatTemperature(-273.15)).toBe('-273.1°C'); // Absolute zero
  });

  test('handles values with many decimal places', () => {
    expect(formatTemperature(15.123456789)).toBe('15.1°C');
    expect(formatTemperature(-5.987654321)).toBe('-6.0°C');
    expect(formatTemperature(0.999999999)).toBe('1.0°C');
  });

  test('handles rounding edge cases precisely', () => {
    expect(formatTemperature(15.05)).toBe('15.1°C');
    expect(formatTemperature(15.04)).toBe('15.0°C');
    expect(formatTemperature(-15.05)).toBe('-15.1°C');
    expect(formatTemperature(-15.04)).toBe('-15.0°C');
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

describe('formatHumidity - Edge Cases (Task 6.3)', () => {
  test('handles values with many decimal places', () => {
    expect(formatHumidity(45.123456789)).toBe('45%');
    expect(formatHumidity(89.987654321)).toBe('90%');
    expect(formatHumidity(0.999999999)).toBe('1%');
  });

  test('handles rounding edge cases precisely', () => {
    expect(formatHumidity(50.5)).toBe('51%'); // Math.round rounds 0.5 up
    expect(formatHumidity(50.4)).toBe('50%');
    expect(formatHumidity(99.5)).toBe('100%');
    expect(formatHumidity(0.5)).toBe('1%');
  });

  test('handles very small positive values', () => {
    expect(formatHumidity(0.1)).toBe('0%');
    expect(formatHumidity(0.4)).toBe('0%');
    expect(formatHumidity(0.6)).toBe('1%');
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

describe('formatPrecipitation - Edge Cases (Task 6.3)', () => {
  test('handles very large precipitation values', () => {
    expect(formatPrecipitation(500.5)).toBe('500.5 mm');
    expect(formatPrecipitation(1000.0)).toBe('1000.0 mm');
    expect(formatPrecipitation(9999.9)).toBe('9999.9 mm');
  });

  test('handles values with many decimal places', () => {
    expect(formatPrecipitation(3.123456789)).toBe('3.1 mm');
    expect(formatPrecipitation(0.987654321)).toBe('1.0 mm');
    expect(formatPrecipitation(25.555555555)).toBe('25.6 mm');
  });

  test('handles rounding edge cases precisely', () => {
    expect(formatPrecipitation(5.05)).toBe('5.0 mm'); // toFixed rounds 5.05 down due to floating point
    expect(formatPrecipitation(5.04)).toBe('5.0 mm');
    expect(formatPrecipitation(0.05)).toBe('0.1 mm');
    expect(formatPrecipitation(0.04)).toBe('0.0 mm');
  });

  test('handles very small non-zero values', () => {
    expect(formatPrecipitation(0.01)).toBe('0.0 mm');
    expect(formatPrecipitation(0.09)).toBe('0.1 mm');
    expect(formatPrecipitation(0.001)).toBe('0.0 mm');
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

describe('createWeatherDisplayData - Edge Cases (Task 6.3)', () => {
  test('handles very large temperature values', () => {
    const weatherData: WeatherData = {
      temperature: 150.999,
      humidity: 10,
      precipitation: 0,
      timestamp: new Date(),
    };

    const result = createWeatherDisplayData('Extreme City', weatherData);

    expect(result.temperature).toBe('151.0°C');
  });

  test('handles very large negative temperature values', () => {
    const weatherData: WeatherData = {
      temperature: -200.555,
      humidity: 90,
      precipitation: 0,
      timestamp: new Date(),
    };

    const result = createWeatherDisplayData('Arctic', weatherData);

    expect(result.temperature).toBe('-200.6°C');
  });

  test('handles very large precipitation values', () => {
    const weatherData: WeatherData = {
      temperature: 25,
      humidity: 95,
      precipitation: 1500.888,
      timestamp: new Date(),
    };

    const result = createWeatherDisplayData('Monsoon City', weatherData);

    expect(result.precipitation).toBe('1500.9 mm');
  });

  test('handles all values with many decimal places simultaneously', () => {
    const weatherData: WeatherData = {
      temperature: 23.987654321,
      humidity: 67.123456789,
      precipitation: 8.555555555,
      timestamp: new Date(),
    };

    const result = createWeatherDisplayData('Precise City', weatherData);

    expect(result.temperature).toBe('24.0°C');
    expect(result.humidity).toBe('67%');
    expect(result.precipitation).toBe('8.6 mm');
  });

  test('handles extreme zero-like values', () => {
    const weatherData: WeatherData = {
      temperature: 0.001,
      humidity: 0.001,
      precipitation: 0.001,
      timestamp: new Date(),
    };

    const result = createWeatherDisplayData('Near Zero', weatherData);

    expect(result.temperature).toBe('0.0°C');
    expect(result.humidity).toBe('0%');
    expect(result.precipitation).toBe('0.0 mm');
  });
});

// **Property 6: Weather Data Formatting**
// **Validates: Requirements 4.2, 4.3, 5.2, 5.3, 6.2, 6.3**
// Feature: weather-app, Property 6: Weather Data Formatting
describe('property test: weather data formatting', () => {
  test('should format all weather data values according to their specific rules', () => {
    fc.assert(
      fc.property(
        // Generate random weather data values
        fc.record({
          temperature: fc.double({ min: -50, max: 50, noNaN: true }),  // Typical temperature range
          humidity: fc.double({ min: 0, max: 100, noNaN: true }),      // Valid humidity range
          precipitation: fc.double({ min: 0, max: 500, noNaN: true }), // Valid precipitation range (0+ mm)
        }),
        (weatherValues) => {
          // Format each value
          const tempFormatted = formatTemperature(weatherValues.temperature);
          const humidityFormatted = formatHumidity(weatherValues.humidity);
          const precipFormatted = formatPrecipitation(weatherValues.precipitation);

          // Verify temperature has unit label and max 1 decimal
          expect(tempFormatted).toMatch(/^-?\d+\.\d°C$/);
          expect(tempFormatted).toContain('°C');
          
          // Extract the numeric part and verify it has exactly 1 decimal place
          const tempNumeric = tempFormatted.replace('°C', '');
          const tempDecimalPart = tempNumeric.split('.')[1];
          expect(tempDecimalPart).toBeDefined();
          expect(tempDecimalPart.length).toBe(1);

          // Verify humidity has % symbol and no decimals
          expect(humidityFormatted).toMatch(/^\d+%$/);
          expect(humidityFormatted).toContain('%');
          expect(humidityFormatted).not.toContain('.');

          // Verify precipitation has mm unit and max 1 decimal
          expect(precipFormatted).toMatch(/^\d+\.\d mm$/);
          expect(precipFormatted).toContain(' mm');
          
          // Extract the numeric part and verify it has exactly 1 decimal place
          const precipNumeric = precipFormatted.replace(' mm', '');
          const precipDecimalPart = precipNumeric.split('.')[1];
          expect(precipDecimalPart).toBeDefined();
          expect(precipDecimalPart.length).toBe(1);
        }
      ),
      { numRuns: 100 }  // Run 100 iterations as specified in design
    );
  });

  test('should format complete weather display data with all formatting rules applied', () => {
    fc.assert(
      fc.property(
        // Generate random city name and weather data
        fc.record({
          cityName: fc.string({ minLength: 1 }),
          temperature: fc.double({ min: -50, max: 50, noNaN: true }),
          humidity: fc.double({ min: 0, max: 100, noNaN: true }),
          precipitation: fc.double({ min: 0, max: 500, noNaN: true }),
        }),
        (data) => {
          const weatherData: WeatherData = {
            temperature: data.temperature,
            humidity: data.humidity,
            precipitation: data.precipitation,
            timestamp: new Date(),
          };

          const displayData = createWeatherDisplayData(data.cityName, weatherData);

          // Verify city name is preserved
          expect(displayData.cityName).toBe(data.cityName);

          // Verify temperature formatting
          expect(displayData.temperature).toMatch(/^-?\d+\.\d°C$/);
          expect(displayData.temperature).toContain('°C');
          const tempDecimalPart = displayData.temperature.replace('°C', '').split('.')[1];
          expect(tempDecimalPart.length).toBe(1);

          // Verify humidity formatting
          expect(displayData.humidity).toMatch(/^\d+%$/);
          expect(displayData.humidity).not.toContain('.');

          // Verify precipitation formatting
          expect(displayData.precipitation).toMatch(/^\d+\.\d mm$/);
          const precipDecimalPart = displayData.precipitation.replace(' mm', '').split('.')[1];
          expect(precipDecimalPart.length).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
