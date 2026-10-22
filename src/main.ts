// Main Application Entry Point
// Wires together all components and initializes the Weather App

import { GeocodingService } from './services/GeocodingService';
import { WeatherService } from './services/WeatherService';
import { WeatherAppController } from './controller/WeatherAppController';
import { UIState } from './types/state';

/**
 * Initialize and start the Weather App
 * Requirements: All requirements (integration)
 */
function initializeApp(): void {
  console.info('[Main] Initializing Weather App...');

  // Step 1: Instantiate services
  const geocodingService = new GeocodingService();
  const weatherService = new WeatherService();
  console.info('[Main] Services instantiated');

  // Step 2: Instantiate controller with service dependencies
  const controller = new WeatherAppController(geocodingService, weatherService);
  console.info('[Main] Controller instantiated');

  // Step 3: Get references to DOM elements
  const form = document.getElementById('weather-form') as HTMLFormElement;
  const cityInput = document.getElementById('city-input') as HTMLInputElement;
  const submitButton = document.getElementById('submit-button') as HTMLButtonElement;
  const loadingSection = document.getElementById('loading-section') as HTMLElement;
  const errorSection = document.getElementById('error-section') as HTMLElement;
  const errorMessage = document.getElementById('error-message') as HTMLElement;
  const weatherSection = document.getElementById('weather-section') as HTMLElement;
  const cityName = document.getElementById('city-name') as HTMLElement;
  const temperatureValue = document.getElementById('temperature-value') as HTMLElement;
  const humidityValue = document.getElementById('humidity-value') as HTMLElement;
  const precipitationValue = document.getElementById('precipitation-value') as HTMLElement;

  console.info('[Main] DOM elements cached');

  // Step 4: Wire up UI state change handler
  controller.onStateChange((state: UIState) => {
    console.debug('[Main] UI State changed to:', state.type);
    updateUI(state);
  });

  // Step 5: Wire up form submit event to controller.handleCitySearch
  form.addEventListener('submit', async (event: Event) => {
    event.preventDefault();
    
    const city = cityInput.value.trim();
    console.info(`[Main] Form submitted with city: "${city}"`);
    
    // Call controller to handle the city search
    await controller.handleCitySearch(city);
  });

  console.info('[Main] Event handlers wired');

  /**
   * Update the UI based on the current state
   * Handles rendering for all UI states: idle, loading, success, error
   * 
   * @param state The current UI state from the controller
   */
  function updateUI(state: UIState): void {
    // Hide all sections first
    loadingSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    weatherSection.classList.add('hidden');

    switch (state.type) {
      case 'idle':
        // Enable form for input
        submitButton.disabled = false;
        cityInput.disabled = false;
        break;

      case 'loading':
        // Show loading indicator (Requirement 8.1)
        // Disable submit button (Requirement 8.4)
        loadingSection.classList.remove('hidden');
        submitButton.disabled = true;
        cityInput.disabled = true;
        break;

      case 'success':
        // Hide loading indicator (Requirement 8.2)
        // Display weather data (Requirements 4.1, 5.1, 6.1, 9.1)
        weatherSection.classList.remove('hidden');
        
        // Display city name (Requirement 9.1)
        cityName.textContent = state.data.cityName;
        
        // Display temperature (Requirements 4.1, 4.2, 4.3)
        temperatureValue.textContent = state.data.temperature;
        
        // Display humidity (Requirements 5.1, 5.2, 5.3)
        humidityValue.textContent = state.data.humidity;
        
        // Display precipitation (Requirements 6.1, 6.2, 6.3)
        precipitationValue.textContent = state.data.precipitation;
        
        // Re-enable form (Requirement 7.4)
        submitButton.disabled = false;
        cityInput.disabled = false;
        break;

      case 'error':
        // Hide loading indicator (Requirement 8.3)
        // Display error message (Requirements 7.1, 7.2, 7.3)
        errorSection.classList.remove('hidden');
        errorMessage.textContent = state.message;
        
        // Re-enable form to allow retry (Requirement 7.4)
        submitButton.disabled = false;
        cityInput.disabled = false;
        break;

      default:
        console.warn('[Main] Unknown state type:', (state as any).type);
    }
  }

  console.info('[Main] Weather App initialized successfully');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already loaded
  initializeApp();
}
