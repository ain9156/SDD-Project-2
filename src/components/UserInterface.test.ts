// Unit tests for UserInterface component

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserInterface } from './UserInterface';
import { WeatherDisplayData } from '../types/models';

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
      
      // Don't call renderInputForm, so DOM elements don't exist
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
      
      // Don't call renderInputForm, so DOM elements don't exist
      const uiWithoutDOM = new UserInterface();
      
      uiWithoutDOM.renderError('Test error');

      expect(consoleSpy).toHaveBeenCalledWith('Error display element not found');
      consoleSpy.mockRestore();
    });

    it('should log error when trying to set up onSubmit without form element', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Don't call renderInputForm, so DOM elements don't exist
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
