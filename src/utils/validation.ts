// Validation utilities for the Weather App

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a city name input
 * 
 * Requirements: 1.3
 * - Checks for empty strings
 * - Checks for whitespace-only strings
 * - Returns appropriate validation errors
 * 
 * @param input - The city name to validate
 * @returns ValidationResult indicating if the input is valid
 */
export function validateCityName(input: string): ValidationResult {
  // Check for empty strings
  if (input === '') {
    console.warn('[Validation] Empty city name provided');
    return {
      isValid: false,
      error: 'El nombre de la ciudad es requerido'
    };
  }
  
  // Check for whitespace-only strings
  if (input.trim() === '') {
    console.warn('[Validation] Whitespace-only city name provided');
    return {
      isValid: false,
      error: 'El nombre de la ciudad es requerido'
    };
  }
  
  // Input is valid
  console.debug(`[Validation] City name validated successfully: "${input}"`);
  return {
    isValid: true
  };
}
