import { describe, test, expect } from 'vitest';
import { validateCityName } from './validation';

describe('validateCityName', () => {
  describe('empty string validation', () => {
    test('should reject empty string', () => {
      const result = validateCityName('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El nombre de la ciudad es requerido');
    });
  });

  describe('whitespace-only validation', () => {
    test('should reject single space', () => {
      const result = validateCityName(' ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El nombre de la ciudad es requerido');
    });

    test('should reject multiple spaces', () => {
      const result = validateCityName('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El nombre de la ciudad es requerido');
    });

    test('should reject tab character', () => {
      const result = validateCityName('\t');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El nombre de la ciudad es requerido');
    });

    test('should reject newline character', () => {
      const result = validateCityName('\n');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El nombre de la ciudad es requerido');
    });

    test('should reject mixed whitespace characters', () => {
      const result = validateCityName(' \t\n ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El nombre de la ciudad es requerido');
    });
  });

  describe('valid input validation', () => {
    test('should accept single character city name', () => {
      const result = validateCityName('A');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should accept regular city name', () => {
      const result = validateCityName('Berlin');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should accept city name with spaces', () => {
      const result = validateCityName('New York');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should accept city name with leading/trailing spaces', () => {
      const result = validateCityName('  Berlin  ');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should accept city name with special characters', () => {
      const result = validateCityName('São Paulo');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should accept city name with numbers', () => {
      const result = validateCityName('District 9');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});
