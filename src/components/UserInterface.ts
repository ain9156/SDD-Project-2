// User Interface Component for the Weather App
// Responsible for rendering the UI and handling DOM manipulations

import { WeatherDisplayData } from '../types/models';

export class UserInterface {
  private inputElement: HTMLInputElement | null = null;
  private submitButton: HTMLButtonElement | null = null;
  private loadingIndicator: HTMLElement | null = null;
  private weatherDisplay: HTMLElement | null = null;
  private errorDisplay: HTMLElement | null = null;
  private formElement: HTMLFormElement | null = null;

  /**
   * Render the input form with city name field and submit button
   * Requirements: 1.1, 1.2
   */
  renderInputForm(): void {
    // Get or create form container
    let formContainer = document.getElementById('weather-form-container');
    if (!formContainer) {
      formContainer = document.createElement('div');
      formContainer.id = 'weather-form-container';
      document.body.appendChild(formContainer);
    }

    // Create form HTML structure
    formContainer.innerHTML = `
      <form id="weather-form" class="weather-form">
        <div class="form-group">
          <label for="city-input">Ciudad:</label>
          <input 
            type="text" 
            id="city-input" 
            name="city" 
            placeholder="Ingresa el nombre de una ciudad"
            autocomplete="off"
          />
        </div>
        <button type="submit" id="submit-button" class="submit-button">
          Buscar Clima
        </button>
      </form>
      <div id="loading-indicator" class="loading-indicator" style="display: none;">
        <div class="spinner"></div>
        <p>Cargando datos del clima...</p>
      </div>
      <div id="weather-display" class="weather-display" style="display: none;"></div>
      <div id="error-display" class="error-display" style="display: none;"></div>
    `;

    // Cache DOM element references
    this.formElement = document.getElementById('weather-form') as HTMLFormElement;
    this.inputElement = document.getElementById('city-input') as HTMLInputElement;
    this.submitButton = document.getElementById('submit-button') as HTMLButtonElement;
    this.loadingIndicator = document.getElementById('loading-indicator');
    this.weatherDisplay = document.getElementById('weather-display');
    this.errorDisplay = document.getElementById('error-display');
  }

  /**
   * Show loading indicator
   * Requirements: 8.1
   */
  showLoading(): void {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'block';
    }
    // Hide other displays
    this.hideWeatherData();
    this.hideError();
  }

  /**
   * Hide loading indicator
   * Requirements: 8.2, 8.3
   */
  hideLoading(): void {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'none';
    }
  }

  /**
   * Render weather data in the UI
   * Requirements: 4.1, 5.1, 6.1, 9.1
   */
  renderWeatherData(data: WeatherDisplayData): void {
    if (!this.weatherDisplay) {
      console.error('Weather display element not found');
      return;
    }

    // Hide loading and error displays
    this.hideLoading();
    this.hideError();

    // Create weather data HTML
    this.weatherDisplay.innerHTML = `
      <div class="weather-card">
        <h2 class="city-name">${this.escapeHtml(data.cityName)}</h2>
        <div class="weather-info">
          <div class="weather-item">
            <span class="weather-label">Temperatura:</span>
            <span class="weather-value">${this.escapeHtml(data.temperature)}</span>
          </div>
          <div class="weather-item">
            <span class="weather-label">Humedad:</span>
            <span class="weather-value">${this.escapeHtml(data.humidity)}</span>
          </div>
          <div class="weather-item">
            <span class="weather-label">Precipitación:</span>
            <span class="weather-value">${this.escapeHtml(data.precipitation)}</span>
          </div>
        </div>
      </div>
    `;

    this.weatherDisplay.style.display = 'block';
  }

  /**
   * Render error message in the UI
   * Requirements: 7.1, 7.2, 7.3
   */
  renderError(message: string): void {
    if (!this.errorDisplay) {
      console.error('Error display element not found');
      return;
    }

    // Hide loading and weather displays
    this.hideLoading();
    this.hideWeatherData();

    // Create error message HTML
    this.errorDisplay.innerHTML = `
      <div class="error-card">
        <span class="error-icon">⚠️</span>
        <p class="error-message">${this.escapeHtml(message)}</p>
      </div>
    `;

    this.errorDisplay.style.display = 'block';
  }

  /**
   * Disable submit button
   * Requirements: 8.4
   */
  disableSubmitButton(): void {
    if (this.submitButton) {
      this.submitButton.disabled = true;
      this.submitButton.classList.add('disabled');
    }
  }

  /**
   * Enable submit button
   * Requirements: 7.4
   */
  enableSubmitButton(): void {
    if (this.submitButton) {
      this.submitButton.disabled = false;
      this.submitButton.classList.remove('disabled');
    }
  }

  /**
   * Set up onSubmit event handler
   * The callback receives the city name from the input field
   * Requirements: 1.2, 1.4
   */
  onSubmit(callback: (cityName: string) => void): void {
    if (!this.formElement) {
      console.error('Form element not found');
      return;
    }

    this.formElement.addEventListener('submit', (event: Event) => {
      event.preventDefault();
      
      const cityName = this.inputElement?.value.trim() || '';
      callback(cityName);
    });
  }

  /**
   * Clear input field
   */
  clearInput(): void {
    if (this.inputElement) {
      this.inputElement.value = '';
    }
  }

  /**
   * Get current input value
   */
  getInputValue(): string {
    return this.inputElement?.value.trim() || '';
  }

  // Private helper methods

  private hideWeatherData(): void {
    if (this.weatherDisplay) {
      this.weatherDisplay.style.display = 'none';
    }
  }

  private hideError(): void {
    if (this.errorDisplay) {
      this.errorDisplay.style.display = 'none';
    }
  }

  /**
   * Escape HTML to prevent XSS attacks
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
