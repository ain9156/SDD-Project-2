# Implementation Plan: Weather App

## Overview

This implementation plan breaks down the weather app into discrete coding steps, starting with project setup, then implementing core services, followed by UI components, and finally integration and testing. The approach is incremental, building from the foundation up and validating functionality at each checkpoint.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create project directory structure (src/services, src/components, src/types, src/utils)
  - Initialize TypeScript project with tsconfig.json
  - Install dependencies: TypeScript, fast-check for property testing, testing framework (Jest or Vitest)
  - Create index.html with basic structure
  - Set up build configuration (Vite, Webpack, or similar)
  - _Requirements: All requirements (foundational setup)_

- [x] 2. Define core type definitions and interfaces
  - Create src/types/models.ts with all domain models (Coordinates, WeatherData, WeatherDisplayData)
  - Create src/types/errors.ts with error types (GeocodingError, WeatherError, ErrorType)
  - Create src/types/api.ts with API response models (GeocodingApiResponse, WeatherApiResponse)
  - Create src/types/state.ts with UI state types (UIState)
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 4.1, 5.1, 6.1, 7.1, 7.2, 7.3, 8.1_

- [x] 3. Implement Geocoding Service
  - [x] 3.1 Create GeocodingService class with geocodeCity method
    - Implement HTTP client setup for Open-Meteo Geocoding API
    - Build API URL with query parameters (name, count=1, format=json)
    - Handle successful responses and extract coordinates from first result
    - Handle empty results (return CITY_NOT_FOUND error)
    - Handle HTTP errors (return SERVICE_UNAVAILABLE error)
    - Handle network errors (return NETWORK_ERROR error)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [-] 3.2 Write property test for coordinate extraction
    - **Property 3: Coordinate Extraction**
    - **Validates: Requirements 2.2**
    - Generate mock API responses with random coordinates
    - Verify extracted coordinates are within valid ranges (lat: -90 to 90, lon: -180 to 180)
  
  - [-] 3.3 Write property test for HTTP error handling
    - **Property 4: Geocoding HTTP Error Handling**
    - **Validates: Requirements 2.4**
    - Generate various HTTP error status codes (4xx, 5xx)
    - Verify SERVICE_UNAVAILABLE error is returned for all HTTP errors
  
  - [-] 3.4 Write unit tests for geocoding service edge cases
    - Test empty results array handling
    - Test malformed API responses
    - Test network timeout scenarios
    - _Requirements: 2.3, 2.4_

- [x] 4. Implement Weather Service
  - [x] 4.1 Create WeatherService class with getCurrentWeather method
    - Implement HTTP client for Open-Meteo Weather API
    - Build API URL with coordinates and required parameters (current: temperature_2m, relative_humidity_2m, precipitation)
    - Parse response and extract weather data from current object
    - Handle missing data fields (return DATA_UNAVAILABLE error)
    - Handle HTTP errors (return SERVICE_UNAVAILABLE error)
    - Handle network errors (return NETWORK_ERROR error)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [-] 4.2 Write property test for HTTP error handling
    - **Property 5: Weather Service HTTP Error Handling**
    - **Validates: Requirements 3.5**
    - Generate various HTTP error status codes (4xx, 5xx)
    - Verify appropriate error is returned for all HTTP failures
  
  - [x] 4.3 Write unit tests for weather service edge cases
    - Test missing temperature field in response
    - Test missing humidity field in response
    - Test missing precipitation field in response
    - Test malformed JSON responses
    - _Requirements: 3.5_

- [x] 5. Checkpoint - Verify services work independently
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement data formatting utilities
  - [x] 6.1 Create formatting functions for weather data display
    - Implement formatTemperature(temp: number): string (format to 1 decimal, add °C)
    - Implement formatHumidity(humidity: number): string (format to integer, add %)
    - Implement formatPrecipitation(precip: number): string (format to 1 decimal, add mm)
    - Implement createWeatherDisplayData(cityName: string, data: WeatherData): WeatherDisplayData
    - _Requirements: 4.2, 4.3, 5.2, 5.3, 6.2, 6.3_
  
  - [x] 6.2 Write property test for weather data formatting
    - **Property 6: Weather Data Formatting**
    - **Validates: Requirements 4.2, 4.3, 5.2, 5.3, 6.2, 6.3**
    - Generate random weather data values (temperature, humidity, precipitation)
    - Verify temperature has unit label and max 1 decimal
    - Verify humidity has % symbol and no decimals
    - Verify precipitation has mm unit and max 1 decimal
  
  - [x] 6.3 Write unit tests for formatting edge cases
    - Test negative temperatures
    - Test very large numbers
    - Test zero values
    - Test values with many decimal places
    - _Requirements: 4.3, 5.3, 6.3_

- [x] 7. Implement input validation
  - [x] 7.1 Create validation utilities
    - Implement validateCityName(input: string): ValidationResult
    - Check for empty strings
    - Check for whitespace-only strings
    - Return appropriate validation errors
    - _Requirements: 1.3_
  
  - [x] 7.2 Write property test for empty input validation
    - **Property 1: Empty Input Validation**
    - **Validates: Requirements 1.3**
    - Generate strings with only whitespace characters (spaces, tabs, newlines, empty)
    - Verify all are rejected with validation error

- [x] 8. Implement Weather App Controller
  - [x] 8.1 Create WeatherAppController class with core orchestration
    - Implement handleCitySearch(cityName: string): Promise<void> method
    - Implement input validation step
    - Implement state management (updateUIState method)
    - Implement error routing logic (map service errors to UI messages)
    - Orchestrate workflow: validate → geocode → fetch weather → format → update UI
    - _Requirements: 1.4, 2.1, 3.1, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3_
  
  - [x] 8.2 Write property test for valid input triggering geocoding
    - **Property 2: Valid Input Triggers Geocoding**
    - **Validates: Requirements 1.4**
    - Generate random non-empty strings with at least one non-whitespace character
    - Verify geocoding service is called for each valid input
  
  - [x] 8.3 Write unit tests for controller error handling
    - Test CITY_NOT_FOUND error routing to UI message
    - Test SERVICE_UNAVAILABLE error routing to UI message
    - Test validation error handling
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 9. Implement User Interface Components
  - [x] 9.1 Create HTML structure and CSS
    - Create input form with city name field (Requirements 1.1)
    - Create submit button (Requirements 1.2)
    - Create loading indicator element (initially hidden)
    - Create weather display section (initially hidden)
    - Create error display section (initially hidden)
    - Add CSS styling for layout and visual prominence of elements
    - _Requirements: 1.1, 1.2, 8.1, 9.2_
  
  - [x] 9.2 Create UserInterface class for DOM manipulation
    - Implement renderInputForm(): void
    - Implement showLoading(): void and hideLoading(): void
    - Implement renderWeatherData(data: WeatherDisplayData): void
    - Implement renderError(message: string): void
    - Implement disableSubmitButton(): void and enableSubmitButton(): void
    - Implement onSubmit event handler setup
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 6.1, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 9.1_
  
  - [x] 9.3 Write property test for weather data display completeness
    - **Property 7: Weather Data Display Completeness**
    - **Validates: Requirements 4.1, 5.1, 6.1, 9.1**
    - Generate random weather data with various city names
    - Verify rendered output contains city name, temperature, humidity, and precipitation values
  
  - [x] 9.4 Write property test for error message display
    - **Property 8: Error Message Display**
    - **Validates: Requirements 7.3**
    - Generate various weather service error types
    - Verify UI displays error message for each error type
  
  - [x] 9.5 Write property test for UI functional after errors
    - **Property 9: UI Functional After Errors**
    - **Validates: Requirements 7.4**
    - Generate various error states (geocoding and weather service errors)
    - Verify input field and submit button remain enabled after each error

- [x] 10. Implement UI state management and transitions
  - [x] 10.1 Implement state transition logic in controller
    - Implement idle → loading transition on submit
    - Implement loading → success transition on successful weather retrieval
    - Implement loading → error transition on any error
    - Implement success/error → loading transition on new submit
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [-] 10.2 Write property test for loading state transitions
    - **Property 10: Loading State Transitions**
    - **Validates: Requirements 8.1, 8.2, 8.3**
    - Generate random city search requests (both successful and failing)
    - Verify state transitions follow correct order: idle → loading → success/error
    - Verify loading indicator visibility matches expected state
  
  - [-] 10.3 Write property test for submit button disabled during loading
    - **Property 11: Submit Button Disabled During Loading**
    - **Validates: Requirements 8.4**
    - Generate various scenarios that trigger loading state
    - Verify submit button is disabled whenever loading indicator is visible

- [x] 11. Checkpoint - Test individual components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Wire everything together in main application
  - [x] 12.1 Create main application entry point (index.ts or main.ts)
    - Instantiate GeocodingService
    - Instantiate WeatherService
    - Instantiate UserInterface
    - Instantiate WeatherAppController with service dependencies
    - Wire UI submit event to controller.handleCitySearch
    - Initialize the application
    - _Requirements: All requirements (integration)_
  
  - [~] 12.2 Write integration tests for complete workflows
    - Test successful city search flow (Berlin example)
    - Test city not found flow
    - Test geocoding service unavailable flow
    - Test weather service unavailable flow
    - Test network failure scenarios
    - _Requirements: All requirements_

- [x] 13. Implement error logging
  - [x] 13.1 Add console logging throughout the application
    - Add error logs for API failures
    - Add warning logs for validation failures and empty results
    - Add info logs for successful operations
    - Add debug logs for state transitions
    - Include timestamps and relevant context in logs
    - _Requirements: 2.4, 3.5, 7.1, 7.2, 7.3_

- [x] 14. Final testing and validation
  - [x] 14.1 Run all property-based tests
    - Verify all 11 properties pass with 100+ iterations
    - Review any failures and fix issues
    - _Requirements: All requirements_
  
  - [x] 14.2 Run all unit tests
    - Verify 90%+ code coverage for business logic
    - Review coverage report and add tests for uncovered paths
    - _Requirements: All requirements_
  
  - [x] 14.3 Run all integration tests
    - Verify all user flows work end-to-end
    - Test with real API calls (optional, use sparingly)
    - _Requirements: All requirements_

- [x] 15. Final checkpoint - Complete verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- The implementation uses TypeScript as specified in the design document
- All property-based tests use fast-check library with minimum 100 iterations
- Each property test includes a comment with the property number and validated requirements
- Service implementations are independent and can be developed in parallel after type definitions are complete
- UI components depend on formatting utilities and controller implementation
- Integration happens in stages: services first, then controller, then UI, then wiring
- Manual testing will be required for visual layout verification (Requirement 9.2)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["3.1", "4.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "3.4", "4.2", "4.3"] },
    { "id": 3, "tasks": ["6.1", "7.1"] },
    { "id": 4, "tasks": ["6.2", "6.3", "7.2"] },
    { "id": 5, "tasks": ["8.1"] },
    { "id": 6, "tasks": ["8.2", "8.3", "9.1"] },
    { "id": 7, "tasks": ["9.2"] },
    { "id": 8, "tasks": ["9.3", "9.4", "9.5", "10.1"] },
    { "id": 9, "tasks": ["10.2", "10.3"] },
    { "id": 10, "tasks": ["12.1"] },
    { "id": 11, "tasks": ["12.2", "13.1"] },
    { "id": 12, "tasks": ["14.1", "14.2", "14.3"] }
  ]
}
```
