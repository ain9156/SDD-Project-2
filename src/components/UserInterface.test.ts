// Unit tests for User Interface component

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fc from 'fast-check';
import { UserInterface } from './UserInterface';
import { WeatherDisplayData } from '../types/models';
import { GeocodingService } from '../services/GeocodingService';
import { WeatherService } from '../services/WeatherService';
import { WeatherAppController } from '../controller/WeatherAppController';
import { WeatherError } from '../types/errors';

describe('UserInterface', () => {
  let ui: UserInterface;

  beforeEach(() => {
    // Clear document body before each test
    document.body.innerHTML = '';
    ui = new UserInterface();
  });

  describe('renderInputForm', () => {
    it('should create and render input form with city input field', () => {
      ui.renderInputForm();

      const inputElement = document.getElementById('city-input') as HTMLInputElement;
      expect(inputElement).toBeTruthy();
      expect(inputElement.type).toBe('text');
      expect(inputElement.placeholder).toContain('ciudad');
    });

    it('should create and render submit button', () => {
      ui.renderInputForm();

      const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
      expect(submitButton).toBeTruthy();
      expect(submitButton.type).toBe('submit');
      expect(submitButton.textContent).toContain('Buscar');
    });

    it('should create loading indicator (initially hidden)', () => {
      ui.renderInputForm();

      const loadingIndicator = document.getElementById('loading-indicator');
      expect(loadingIndicator).toBeTruthy();
      expect(loadingIndicator?.style.display).toBe('none');
    });

    it('should create weather display section (initially hidden)', () => {
      ui.renderInputForm();

      const weatherDisplay = document.getElementById('weather-display');
      expect(weatherDisplay).toBeTruthy();
      expect(weatherDisplay?.style.display).toBe('none');
    });

    it('should create error display section (initially hidden)', () => {
      ui.renderInputForm();

      const errorDisplay = document.getElementById('error-display');
      expect(errorDisplay).toBeTruthy();
      expect(errorDisplay?.style.display).toBe('none');
    });
  });

  describe('showLoading', () => {
    it('should display loading indicator', () => {
      ui.renderInputForm();
      ui.showLoading();

      const loadingIndicator = document.getElementById('loading-indicator');
      expect(loadingIndicator?.style.display).toBe('block');
    });

    it('should hide weather and error displays when showing loading', () => {
      ui.renderInputForm();
      
      // First show weather data
      ui.renderWeatherData({
        cityName: 'Berlin',
        temperature: '15.3°C',
        humidity: '65%',
        precipitation: '0.0 mm'
      });

      // Then show loading
      ui.showLoading();

      const weatherDisplay = document.getElementById('weather-display');
      const errorDisplay = document.getElementById('error-display');
      expect(weatherDisplay?.style.display).toBe('none');
      expect(errorDisplay?.style.display).toBe('none');
    });
  });

  describe('hideLoading', () => {
    it('should hide loading indicator', () => {
      ui.renderInputForm();
      ui.showLoading();
      ui.hideLoading();

      const loadingIndicator = document.getElementById('loading-indicator');
      expect(loadingIndicator?.style.display).toBe('none');
    });
  });

  describe('renderWeatherData', () => {
    it('should display city name prominently', () => {
      ui.renderInputForm();
      
      const data: WeatherDisplayData = {
        cityName: 'Berlin',
        temperature: '15.3°C',
        humidity: '65%',
        precipitation: '0.0 mm'
      };

      ui.renderWeatherData(data);

      const weatherDisplay = document.getElementById('weather-display');
      expect(weatherDisplay?.style.display).toBe('block');
      expect(weatherDisplay?.innerHTML).toContain('Berlin');
      expect(weatherDisplay?.querySelector('.city-name')?.textContent).toBe('Berlin');
    });

    it('should display temperature with unit', () => {
      ui.renderInputForm();
      
      const data: WeatherDisplayData = {
        cityName: 'Berlin',
        temperature: '15.3°C',
        humidity: '65%',
        precipitation: '0.0 mm'
      };

      ui.renderWeatherData(data);

      const weatherDisplay = document.getElementById('weather-display');
      expect(weatherDisplay?.innerHTML).toContain('15.3°C');
      expect(weatherDisplay?.innerHTML).toContain('Temperatura');
    });

    it('should display humidity as percentage', () => {
      ui.renderInputForm();
      
      const data: WeatherDisplayData = {
        cityName: 'Berlin',
        temperature: '15.3°C',
        humidity: '65%',
        precipitation: '0.0 mm'
      };

      ui.renderWeatherData(data);

      const weatherDisplay = document.getElementById('weather-display');
      expect(weatherDisplay?.innerHTML).toContain('65%');
      expect(weatherDisplay?.innerHTML).toContain('Humedad');
    });

    it('should display precipitation with unit', () => {
      ui.renderInputForm();
      
      const data: WeatherDisplayData = {
        cityName: 'Berlin',
        temperature: '15.3°C',
        humidity: '65%',
        precipitation: '0.0 mm'
      };

      ui.renderWeatherData(data);

      const weatherDisplay = document.getElementById('weather-display');
      expect(weatherDisplay?.innerHTML).toContain('0.0 mm');
      expect(weatherDisplay?.innerHTML).toContain('Precipitación');
    });

    it('should hide loading and error displays when showing weather data', () => {
      ui.renderInputForm();
      ui.showLoading();
      ui.renderError('Test error');

      const data: WeatherDisplayData = {
        cityName: 'Berlin',
        temperature: '15.3°C',
        humidity: '65%',
        precipitation: '0.0 mm'
      };

      ui.renderWeatherData(data);

      const loadingIndicator = document.getElementById('loading-indicator');
      const errorDisplay = document.getElementById('error-display');
      expect(loadingIndicator?.style.display).toBe('none');
      expect(errorDisplay?.style.display).toBe('none');
    });

    it('should escape HTML in city name to prevent XSS', () => {
      ui.renderInputForm();
      
      const data: WeatherDisplayData = {
        cityName: '<script>alert("xss")</script>',
        temperature: '15.3°C',
        humidity: '65%',
        precipitation: '0.0 mm'
      };

      ui.renderWeatherData(data);

      const weatherDisplay = document.getElementById('weather-display');
      expect(weatherDisplay?.innerHTML).not.toContain('<script>');
      expect(weatherDisplay?.innerHTML).toContain('&lt;script&gt;');
    });
  });

  describe('renderError', () => {
    it('should display error message', () => {
      ui.renderInputForm();
      
      const errorMessage = 'No se pudo encontrar la ciudad';
      ui.renderError(errorMessage);

      const errorDisplay = document.getElementById('error-display');
      expect(errorDisplay?.style.display).toBe('block');
      expect(errorDisplay?.innerHTML).toContain(errorMessage);
    });

    it('should hide loading and weather displays when showing error', () => {
      ui.renderInputForm();
      ui.showLoading();

      ui.renderError('Test error');

      const loadingIndicator = document.getElementById('loading-indicator');
      const weatherDisplay = document.getElementById('weather-display');
      expect(loadingIndicator?.style.display).toBe('none');
      expect(weatherDisplay?.style.display).toBe('none');
    });

    it('should escape HTML in error message to prevent XSS', () => {
      ui.renderInputForm();
      
      const errorMessage = '<script>alert("xss")</script>';
      ui.renderError(errorMessage);

      const errorDisplay = document.getElementById('error-display');
      expect(errorDisplay?.innerHTML).not.toContain('<script>');
      expect(errorDisplay?.innerHTML).toContain('&lt;script&gt;');
    });
  });

  describe('disableSubmitButton', () => {
    it('should disable submit button', () => {
      ui.renderInputForm();
      ui.disableSubmitButton();

      const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);
      expect(submitButton.classList.contains('disabled')).toBe(true);
    });
  });

  describe('enableSubmitButton', () => {
    it('should enable submit button', () => {
      ui.renderInputForm();
      ui.disableSubmitButton();
      ui.enableSubmitButton();

      const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
      expect(submitButton.disabled).toBe(false);
      expect(submitButton.classList.contains('disabled')).toBe(false);
    });
  });

  describe('onSubmit', () => {
    it('should call callback with city name when form is submitted', () => {
      ui.renderInputForm();
      
      const callback = vi.fn();
      ui.onSubmit(callback);

      const inputElement = document.getElementById('city-input') as HTMLInputElement;
      const formElement = document.getElementById('weather-form') as HTMLFormElement;

      inputElement.value = 'Berlin';
      formElement.dispatchEvent(new Event('submit'));

      expect(callback).toHaveBeenCalledWith('Berlin');
    });

    it('should trim whitespace from city name', () => {
      ui.renderInputForm();
      
      const callback = vi.fn();
      ui.onSubmit(callback);

      const inputElement = document.getElementById('city-input') as HTMLInputElement;
      const formElement = document.getElementById('weather-form') as HTMLFormElement;

      inputElement.value = '  Berlin  ';
      formElement.dispatchEvent(new Event('submit'));

      expect(callback).toHaveBeenCalledWith('Berlin');
    });

    it('should call callback with empty string when input is empty', () => {
      ui.renderInputForm();
      
      const callback = vi.fn();
      ui.onSubmit(callback);

      const inputElement = document.getElementById('city-input') as HTMLInputElement;
      const formElement = document.getElementById('weather-form') as HTMLFormElement;

      inputElement.value = '';
      formElement.dispatchEvent(new Event('submit'));

      expect(callback).toHaveBeenCalledWith('');
    });

    it('should prevent default form submission', () => {
      ui.renderInputForm();
      
      const callback = vi.fn();
      ui.onSubmit(callback);

      const formElement = document.getElementById('weather-form') as HTMLFormElement;
      const submitEvent = new Event('submit', { cancelable: true });
      
      formElement.dispatchEvent(submitEvent);

      expect(submitEvent.defaultPrevented).toBe(true);
    });
  });

  describe('clearInput', () => {
    it('should clear input field value', () => {
      ui.renderInputForm();

      const inputElement = document.getElementById('city-input') as HTMLInputElement;
      inputElement.value = 'Berlin';

      ui.clearInput();

      expect(inputElement.value).toBe('');
    });
  });

  describe('getInputValue', () => {
    it('should return trimmed input value', () => {
      ui.renderInputForm();

      const inputElement = document.getElementById('city-input') as HTMLInputElement;
      inputElement.value = '  Berlin  ';

      expect(ui.getInputValue()).toBe('Berlin');
    });

    it('should return empty string when input is empty', () => {
      ui.renderInputForm();

      expect(ui.getInputValue()).toBe('');
    });
  });

  describe('Error handling for missing DOM elements', () => {
    it('should log error when trying to render weather data without weather display element', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const uiWithoutDOM = new UserInterface();
      
      uiWithoutDOM.renderWeatherData({
        cityName: 'Berlin',
        temperature: '15.3°C',
        humidity: '65%',
        precipitation: '0.0 mm'
      });

      expect(consoleSpy).toHaveBeenCalledWith('Weather display element not found');
      consoleSpy.mockRestore();
    });

    it('should log error when trying to render error without error display element', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const uiWithoutDOM = new UserInterface();
      
      uiWithoutDOM.renderError('Test error');

      expect(consoleSpy).toHaveBeenCalledWith('Error display element not found');
      consoleSpy.mockRestore();
    });

    it('should log error when trying to set up onSubmit without form element', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const uiWithoutDOM = new UserInterface();
      
      uiWithoutDOM.onSubmit(() => {});

      expect(consoleSpy).toHaveBeenCalledWith('Form element not found');
      consoleSpy.mockRestore();
    });
  });

  describe('UI state transitions', () => {
    it('should transition from idle to loading to success', () => {
      ui.renderInputForm();

      // Initial state (idle)
      expect(document.getElementById('loading-indicator')?.style.display).toBe('none');
      expect(document.getElementById('weather-display')?.style.display).toBe('none');

      // Loading state
      ui.showLoading();
      ui.disableSubmitButton();
      expect(document.getElementById('loading-indicator')?.style.display).toBe('block');
      expect((document.getElementById('submit-button') as HTMLButtonElement).disabled).toBe(true);

      // Success state
      ui.renderWeatherData({
        cityName: 'Berlin',
        temperature: '15.3°C',
        humidity: '65%',
        precipitation: '0.0 mm'
      });
      ui.enableSubmitButton();

      expect(document.getElementById('loading-indicator')?.style.display).toBe('none');
      expect(document.getElementById('weather-display')?.style.display).toBe('block');
      expect((document.getElementById('submit-button') as HTMLButtonElement).disabled).toBe(false);
    });

    it('should transition from loading to error', () => {
      ui.renderInputForm();

      // Loading state
      ui.showLoading();
      ui.disableSubmitButton();
      expect(document.getElementById('loading-indicator')?.style.display).toBe('block');

      // Error state
      ui.renderError('Test error');
      ui.enableSubmitButton();

      expect(document.getElementById('loading-indicator')?.style.display).toBe('none');
      expect(document.getElementById('error-display')?.style.display).toBe('block');
      expect((document.getElementById('submit-button') as HTMLButtonElement).disabled).toBe(false);
    });

    it('should allow new search after error', () => {
      ui.renderInputForm();

      // Show error
      ui.renderError('Test error');
      ui.enableSubmitButton();

      // Verify input and button are enabled
      const inputElement = document.getElementById('city-input') as HTMLInputElement;
      const submitButton = document.getElementById('submit-button') as HTMLButtonElement;

      expect(inputElement.disabled).toBe(false);
      expect(submitButton.disabled).toBe(false);

      // Verify can enter new city name
      inputElement.value = 'New City';
      expect(inputElement.value).toBe('New City');
    });
  });
});

// Property-Based Tests
describe('UserInterface - Property-Based Tests', () => {
  // **Property 8: Error Message Display**
  // **Validates: Requirements 7.3**
  // Feature: weather-app, Property 8: Error Message Display
  describe('property test: error message display', () => {
    it('should display error message for any weather service error type', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate various weather service error types
          fc.constantFrom<WeatherError>('DATA_UNAVAILABLE', 'SERVICE_UNAVAILABLE', 'NETWORK_ERROR'),
          async (weatherError) => {
            // Setup - Clear DOM
            document.body.innerHTML = '';
            
            // Create UI and render form
            const ui = new UserInterface();
            ui.renderInputForm();

            // Create mock services
            // Geocoding service that succeeds
            const mockGeocodingService = {
              geocodeCity: vi.fn().mockResolvedValue({
                success: true,
                coordinates: { latitude: 52.52, longitude: 13.405 }
              })
            } as unknown as GeocodingService;

            // Weather service that returns the generated error
            const mockWeatherService = {
              getCurrentWeather: vi.fn().mockResolvedValue({
                success: false,
                error: weatherError
              })
            } as unknown as WeatherService;

            // Create controller and wire it to the UI
            const controller = new WeatherAppController(mockGeocodingService, mockWeatherService);
            
            controller.onStateChange((state) => {
              if (state.type === 'loading') {
                ui.showLoading();
                ui.disableSubmitButton();
              } else if (state.type === 'success') {
                ui.hideLoading();
                ui.renderWeatherData(state.data);
                ui.enableSubmitButton();
              } else if (state.type === 'error') {
                ui.hideLoading();
                ui.renderError(state.message);
                ui.enableSubmitButton();
              }
            });

            // Execute - Search for a city (will trigger the weather error)
            await controller.handleCitySearch('Berlin');

            // Verify - Error display should be visible with a message
            const errorDisplay = document.getElementById('error-display');
            expect(errorDisplay?.style.display).toBe('block');
            
            // Verify that error display contains some error message text
            const errorMessage = errorDisplay?.textContent || '';
            expect(errorMessage.length).toBeGreaterThan(0);
            
            // Verify that the error message indicates weather data issue
            // (All weather errors should mention data/service availability)
            const hasWeatherErrorContent = 
              errorMessage.includes('datos meteorológicos') ||
              errorMessage.includes('disponible') ||
              errorMessage.includes('intenta');
            
            expect(hasWeatherErrorContent).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

// **Property 9: UI Functional After Errors**
// **Validates: Requirements 7.4**
// Feature: weather-app, Property 9: UI Functional After Errors
describe('Property 9: UI Functional After Errors', () => {
  let ui: UserInterface;

  beforeEach(() => {
    document.body.innerHTML = '';
    ui = new UserInterface();
    ui.renderInputForm();
  });

  it('should keep input and submit button enabled after geocoding errors', () => {
    // Generate various geocoding error messages
    const geocodingErrorGen = fc.oneof(
      fc.constant('No se pudo encontrar la ciudad'),
      fc.constant('El servicio de geocodificación no está disponible temporalmente'),
      fc.constant('Error de conexión. Por favor verifica tu conexión a internet')
    );

    fc.assert(
      fc.property(geocodingErrorGen, (errorMessage) => {
        // Simulate the error flow: loading -> error -> enable
        ui.showLoading();
        ui.disableSubmitButton();
        ui.renderError(errorMessage);
        ui.enableSubmitButton();

        // Get DOM elements
        const inputElement = document.getElementById('city-input') as HTMLInputElement;
        const submitButton = document.getElementById('submit-button') as HTMLButtonElement;

        // Verify input field is not disabled (it should never be disabled)
        expect(inputElement.disabled).toBe(false);
        
        // Verify submit button is enabled after error
        expect(submitButton.disabled).toBe(false);

        // Verify user can enter new city name
        const testCityName = 'NewCity';
        inputElement.value = testCityName;
        expect(inputElement.value).toBe(testCityName);

        // Verify error is displayed
        const errorDisplay = document.getElementById('error-display');
        expect(errorDisplay?.style.display).toBe('block');
        expect(errorDisplay?.textContent).toContain(errorMessage);
      }),
      { numRuns: 100 }
    );
  });

  it('should keep input and submit button enabled after weather service errors', () => {
    // Generate various weather service error messages
    const weatherErrorGen = fc.oneof(
      fc.constant('Los datos meteorológicos están incompletos'),
      fc.constant('Los datos meteorológicos no están disponibles en este momento'),
      fc.constant('No se pudieron obtener los datos meteorológicos')
    );

    fc.assert(
      fc.property(weatherErrorGen, (errorMessage) => {
        // Simulate the error flow: loading -> error -> enable
        ui.showLoading();
        ui.disableSubmitButton();
        ui.renderError(errorMessage);
        ui.enableSubmitButton();

        // Get DOM elements
        const inputElement = document.getElementById('city-input') as HTMLInputElement;
        const submitButton = document.getElementById('submit-button') as HTMLButtonElement;

        // Verify input field is not disabled
        expect(inputElement.disabled).toBe(false);
        
        // Verify submit button is enabled after error
        expect(submitButton.disabled).toBe(false);

        // Verify error is displayed
        const errorDisplay = document.getElementById('error-display');
        expect(errorDisplay?.style.display).toBe('block');
      }),
      { numRuns: 100 }
    );
  });

  it('should keep input and submit button enabled after any error type', () => {
    // Generate various error messages covering all error types
    const allErrorsGen = fc.oneof(
      // Geocoding errors
      fc.constant('No se pudo encontrar la ciudad "InvalidCity". Por favor verifica el nombre.'),
      fc.constant('El servicio de geocodificación no está disponible temporalmente. Por favor intenta más tarde.'),
      // Weather errors
      fc.constant('Los datos meteorológicos están incompletos. Por favor intenta nuevamente.'),
      fc.constant('Los datos meteorológicos no están disponibles en este momento. Por favor intenta más tarde.'),
      // Network errors
      fc.constant('Error de conexión. Por favor verifica tu conexión a internet e intenta nuevamente.'),
      // Validation errors
      fc.constant('El nombre de la ciudad es requerido'),
      // Unknown errors
      fc.constant('Ocurrió un error inesperado. Por favor intenta nuevamente.')
    );

    fc.assert(
      fc.property(allErrorsGen, (errorMessage) => {
        // Simulate the complete error flow
        ui.showLoading();
        ui.disableSubmitButton();
        ui.renderError(errorMessage);
        ui.enableSubmitButton();

        // Get DOM elements
        const inputElement = document.getElementById('city-input') as HTMLInputElement;
        const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
        const errorDisplay = document.getElementById('error-display');

        // Property: Input field remains enabled (never disabled)
        expect(inputElement.disabled).toBe(false);
        
        // Property: Submit button is enabled after error
        expect(submitButton.disabled).toBe(false);

        // Property: Error is visible
        expect(errorDisplay?.style.display).toBe('block');

        // Property: Loading indicator is hidden
        const loadingIndicator = document.getElementById('loading-indicator');
        expect(loadingIndicator?.style.display).toBe('none');

        // Property: Weather display is hidden
        const weatherDisplay = document.getElementById('weather-display');
        expect(weatherDisplay?.style.display).toBe('none');

        // Property: User can interact with the input field
        const newCityName = 'AnotherCity';
        inputElement.value = newCityName;
        expect(inputElement.value).toBe(newCityName);
        expect(ui.getInputValue()).toBe(newCityName);
      }),
      { numRuns: 100 }
    );
  });

  it('should allow submitting new search after error', () => {
    // Test that the full workflow can restart after an error
    const errorMessageGen = fc.string({ minLength: 5, maxLength: 100 });
    const cityNameGen = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0);

    fc.assert(
      fc.property(errorMessageGen, cityNameGen, (errorMessage, newCityName) => {
        // Simulate error state
        ui.renderError(errorMessage);
        ui.enableSubmitButton();

        // Simulate user entering new city name
        const inputElement = document.getElementById('city-input') as HTMLInputElement;
        inputElement.value = newCityName;

        // Verify form is ready for new submission
        const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
        expect(submitButton.disabled).toBe(false);
        expect(inputElement.disabled).toBe(false);

        // Simulate starting a new search (transition to loading)
        ui.showLoading();
        ui.disableSubmitButton();

        // Verify loading state is active
        const loadingIndicator = document.getElementById('loading-indicator');
        expect(loadingIndicator?.style.display).toBe('block');
        expect(submitButton.disabled).toBe(true);

        // Verify error display is hidden during new search
        const errorDisplay = document.getElementById('error-display');
        expect(errorDisplay?.style.display).toBe('none');
      }),
      { numRuns: 100 }
    );
  });
});
