# Design Document

## Overview

Esta aplicación web de pronóstico del clima permite a los usuarios consultar información meteorológica de cualquier ciudad del mundo. La aplicación sigue una arquitectura de tres capas con separación clara entre la presentación (UI), la lógica de negocio (servicios) y la integración con APIs externas.

### Key Design Decisions

1. **Arquitectura de Servicios**: Implementación de servicios separados para geocodificación y datos meteorológicos, permitiendo mantenimiento independiente y reutilización
2. **Gestión de Estado de UI**: Uso de estados explícitos (loading, success, error) para proporcionar feedback claro al usuario
3. **Manejo de Errores en Capas**: Cada capa maneja y transforma errores apropiadamente, desde errores técnicos de HTTP hasta mensajes amigables para el usuario
4. **Sin Caché**: Implementación inicial sin caché para simplificar, pero el diseño permite agregar caché fácilmente en el futuro
5. **API Pública**: Uso de Open-Meteo API que no requiere autenticación, simplificando la implementación

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │   Input    │  │   Loading    │  │  Weather Display  │   │
│  │   Form     │  │  Indicator   │  │   / Error         │   │
│  └────────────┘  └──────────────┘  └───────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ├─ User Input Events
                           ├─ Display Updates
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    Application Logic Layer                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Weather App Controller                  │    │
│  │  - Orchestrates service calls                        │    │
│  │  - Manages UI state transitions                      │    │
│  │  - Transforms data for display                       │    │
│  └─────────────────────────────────────────────────────┘    │
│           │                              │                   │
│  ┌────────┴────────┐          ┌─────────┴───────┐          │
│  │   Geocoding     │          │     Weather     │          │
│  │    Service      │          │     Service     │          │
│  └────────┬────────┘          └─────────┬───────┘          │
└───────────┼──────────────────────────────┼──────────────────┘
            │                              │
            │                              │
┌───────────┴──────────────────────────────┴──────────────────┐
│                    External APIs Layer                       │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │  Open-Meteo          │    │  Open-Meteo          │      │
│  │  Geocoding API       │    │  Weather API         │      │
│  │  /v1/search          │    │  /v1/forecast        │      │
│  └──────────────────────┘    └──────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

**User Interface Layer**
- Captura entrada del usuario (nombre de ciudad)
- Muestra indicadores de carga durante procesamiento
- Presenta datos meteorológicos en formato legible
- Muestra mensajes de error comprensibles
- Maneja interacciones del usuario (submit, disable/enable)

**Application Logic Layer**
- Orquesta el flujo de datos entre UI y servicios
- Gestiona transiciones de estado (idle → loading → success/error)
- Valida entrada del usuario antes de procesar
- Transforma datos de APIs a formato de visualización
- Coordina llamadas secuenciales (geocoding → weather)

**External APIs Layer**
- Encapsula comunicación HTTP con APIs externas
- Maneja errores de red y respuestas de API
- Transforma respuestas JSON a objetos de dominio
- Proporciona abstracción sobre detalles de implementación de APIs

## Components and Interfaces

### 1. User Interface Component

**Responsabilidad**: Renderizar la interfaz web y manejar interacciones del usuario

**Interface**:
```typescript
interface UserInterface {
  // Render methods
  renderInputForm(): void
  renderLoadingIndicator(): void
  renderWeatherData(data: WeatherDisplayData): void
  renderError(message: string): void
  
  // State management
  showLoading(): void
  hideLoading(): void
  disableSubmitButton(): void
  enableSubmitButton(): void
  clearInput(): void
  
  // Event handlers
  onSubmit(cityName: string): void
}
```

**Sub-components**:
- **InputForm**: Campo de texto y botón de envío
- **LoadingIndicator**: Spinner o indicador visual de carga
- **WeatherDisplay**: Sección que muestra temperatura, humedad, precipitación
- **ErrorDisplay**: Área para mostrar mensajes de error

### 2. Weather App Controller

**Responsabilidad**: Orquestar el flujo completo desde entrada de usuario hasta visualización de datos

**Interface**:
```typescript
interface WeatherAppController {
  // Main workflow
  handleCitySearch(cityName: string): Promise<void>
  
  // Private workflow methods (internal)
  private validateInput(cityName: string): ValidationResult
  private updateUIState(state: UIState): void
}

type UIState = 
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success', data: WeatherDisplayData }
  | { type: 'error', message: string }
```

**Dependencies**:
- GeocodingService
- WeatherService
- UserInterface

**Workflow**:
1. Recibe nombre de ciudad de UI
2. Valida entrada (no vacía, formato básico)
3. Actualiza UI a estado "loading"
4. Llama a GeocodingService con nombre de ciudad
5. Si geocoding exitoso, llama a WeatherService con coordenadas
6. Si weather data exitoso, transforma datos y actualiza UI a estado "success"
7. Si cualquier paso falla, actualiza UI a estado "error" con mensaje apropiado

### 3. Geocoding Service

**Responsabilidad**: Convertir nombres de ciudades en coordenadas geográficas usando Open-Meteo Geocoding API

**Interface**:
```typescript
interface GeocodingService {
  geocodeCity(cityName: string): Promise<GeocodingResult>
}

type GeocodingResult = 
  | { success: true, coordinates: Coordinates }
  | { success: false, error: GeocodingError }

interface Coordinates {
  latitude: number
  longitude: number
}

type GeocodingError = 
  | 'CITY_NOT_FOUND'
  | 'SERVICE_UNAVAILABLE'
  | 'NETWORK_ERROR'
```

**API Integration**:
- **Endpoint**: `https://geocoding-api.open-meteo.com/v1/search`
- **Parameters**: 
  - `name`: City name (required)
  - `count`: 1 (only need first result)
  - `language`: Configurable, default 'en'
  - `format`: 'json'
- **Response Handling**:
  - Success: Extract `latitude` and `longitude` from first result
  - Empty results array: Return CITY_NOT_FOUND error
  - HTTP error (4xx, 5xx): Return SERVICE_UNAVAILABLE error
  - Network error: Return NETWORK_ERROR error

### 4. Weather Service

**Responsabilidad**: Obtener datos meteorológicos actuales usando Open-Meteo Weather API

**Interface**:
```typescript
interface WeatherService {
  getCurrentWeather(coordinates: Coordinates): Promise<WeatherResult>
}

type WeatherResult = 
  | { success: true, data: WeatherData }
  | { success: false, error: WeatherError }

interface WeatherData {
  temperature: number      // Celsius
  humidity: number         // Percentage (0-100)
  precipitation: number    // Millimeters
  timestamp: Date         // When data was retrieved
}

type WeatherError = 
  | 'DATA_UNAVAILABLE'
  | 'SERVICE_UNAVAILABLE'
  | 'NETWORK_ERROR'
```

**API Integration**:
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Parameters**:
  - `latitude`: From geocoding result
  - `longitude`: From geocoding result
  - `current`: `temperature_2m,relative_humidity_2m,precipitation`
  - `temperature_unit`: 'celsius'
  - `timezone`: 'auto'
- **Response Structure**:
  ```json
  {
    "current": {
      "temperature_2m": 15.3,
      "relative_humidity_2m": 65,
      "precipitation": 0.0
    }
  }
  ```
- **Response Handling**:
  - Success: Extract values from `current` object
  - Missing data fields: Return DATA_UNAVAILABLE error
  - HTTP error (4xx, 5xx): Return SERVICE_UNAVAILABLE error
  - Network error: Return NETWORK_ERROR error

## Data Models

### Domain Models

```typescript
// Input model
interface CitySearchRequest {
  cityName: string
}

// Geocoding domain models
interface Coordinates {
  latitude: number   // Range: -90 to 90
  longitude: number  // Range: -180 to 180
}

// Weather domain models
interface WeatherData {
  temperature: number      // Celsius, typically -50 to 50
  humidity: number         // Percentage, 0 to 100
  precipitation: number    // Millimeters, >= 0
  timestamp: Date         // UTC timestamp
}

// Display model (transformed for UI)
interface WeatherDisplayData {
  cityName: string
  temperature: string       // Formatted: "15.3°C"
  humidity: string          // Formatted: "65%"
  precipitation: string     // Formatted: "0.0 mm"
}
```

### API Response Models

```typescript
// Open-Meteo Geocoding API Response
interface GeocodingApiResponse {
  results?: Array<{
    id: number
    name: string
    latitude: number
    longitude: number
    country: string
    admin1?: string
    // ... other fields not used
  }>
}

// Open-Meteo Weather API Response
interface WeatherApiResponse {
  latitude: number
  longitude: number
  current: {
    time: string                    // ISO 8601 timestamp
    temperature_2m: number
    relative_humidity_2m: number
    precipitation: number
  }
  // ... other fields not used
}
```

### Error Models

```typescript
interface ErrorResponse {
  type: ErrorType
  message: string           // User-friendly message
  technicalDetails?: string // Optional technical details for logging
}

type ErrorType = 
  | 'VALIDATION_ERROR'
  | 'CITY_NOT_FOUND'
  | 'SERVICE_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'
```

### State Models

```typescript
// UI State Machine
type UIState = 
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success', data: WeatherDisplayData }
  | { type: 'error', message: string }

// State Transitions
// idle -> loading: User submits city name
// loading -> success: Weather data retrieved successfully
// loading -> error: Any error occurs during processing
// success -> loading: User submits new city name
// error -> loading: User submits new city name
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

**Requirement 1: City Input**

1.1. THE User_Interface SHALL display an input field for City_Name
  Thoughts: This is testing that specific UI elements are present when the page loads. This is a one-time check of the initial render state.
  Classification: EXAMPLE
  Test Strategy: Single test verifying input field exists on page load

1.2. THE User_Interface SHALL display a submit button to request weather information
  Thoughts: Similar to 1.1, this is checking for the presence of a specific UI element on load.
  Classification: EXAMPLE
  Test Strategy: Single test verifying submit button exists on page load

1.3. WHEN the user submits an empty City_Name, THE Weather_App SHALL display an error message indicating that city name is required
  Thoughts: This is testing input validation behavior. We can test with various forms of "empty" - empty string, whitespace only, null, undefined.
  Classification: PROPERTY
  Test Strategy: Generate various empty/whitespace inputs, verify all are rejected with appropriate error

1.4. WHEN the user submits a City_Name, THE Weather_App SHALL initiate the geocoding process
  Thoughts: This tests that valid inputs trigger the geocoding workflow. We can test with various valid city names.
  Classification: PROPERTY
  Test Strategy: Generate random valid city names, verify geocoding service is called for each

**Requirement 2: Geocoding Service**

2.1. WHEN a City_Name is provided, THE Geocoding_Service SHALL call the Open-Meteo Geocoding API with the city name
  Thoughts: This is testing integration with external service. The behavior doesn't vary meaningfully with different city names - either the API is called or it isn't.
  Classification: INTEGRATION
  Test Strategy: Use 1-2 example city names, verify API is called with correct parameters

2.2. WHEN the Open-Meteo Geocoding API returns results, THE Geocoding_Service SHALL extract the latitude and longitude from the first result
  Thoughts: This tests data extraction logic. We can test with various API response structures to ensure correct parsing.
  Classification: PROPERTY
  Test Strategy: Generate various mock API responses with different coordinate values, verify correct extraction

2.3. IF the Open-Meteo Geocoding API returns no results, THEN THE Geocoding_Service SHALL return an error indicating the city was not found
  Thoughts: This is testing specific error case handling.
  Classification: EXAMPLE
  Test Strategy: Single test with empty results array, verify CITY_NOT_FOUND error

2.4. IF the Open-Meteo Geocoding API request fails, THEN THE Geocoding_Service SHALL return an error indicating the service is unavailable
  Thoughts: This tests error handling for various HTTP failure scenarios.
  Classification: PROPERTY
  Test Strategy: Generate various HTTP error codes (4xx, 5xx), verify SERVICE_UNAVAILABLE returned for all

**Requirement 3: Weather Data Retrieval**

3.1. WHEN valid Coordinates are provided, THE Weather_Service SHALL call the Open-Meteo Weather API with latitude and longitude parameters
  Thoughts: This is testing integration behavior. The API call mechanism doesn't vary meaningfully with different coordinates.
  Classification: INTEGRATION
  Test Strategy: Use 1-2 example coordinate pairs, verify API is called with correct parameters

3.2. THE Weather_Service SHALL request current temperature data from the Open-Meteo Weather API
  Thoughts: This is testing that the API request includes the correct parameter for temperature.
  Classification: EXAMPLE
  Test Strategy: Single test verifying temperature_2m is in the request parameters

3.3. THE Weather_Service SHALL request current humidity data from the Open-Meteo Weather API
  Thoughts: This is testing that the API request includes the correct parameter for humidity.
  Classification: EXAMPLE
  Test Strategy: Single test verifying relative_humidity_2m is in the request parameters

3.4. THE Weather_Service SHALL request current precipitation data from the Open-Meteo Weather API
  Thoughts: This is testing that the API request includes the correct parameter for precipitation.
  Classification: EXAMPLE
  Test Strategy: Single test verifying precipitation is in the request parameters

3.5. IF the Open-Meteo Weather API request fails, THEN THE Weather_Service SHALL return an error indicating weather data is unavailable
  Thoughts: This tests error handling for various HTTP failure scenarios.
  Classification: PROPERTY
  Test Strategy: Generate various HTTP error codes (4xx, 5xx), verify appropriate error returned for all

**Requirement 4: Temperature Display**

4.1. WHEN Weather_Data is successfully retrieved, THE User_Interface SHALL display the current temperature value
  Thoughts: This tests that temperature data appears in the rendered output across various temperature values.
  Classification: PROPERTY
  Test Strategy: Generate random temperature values, verify each appears in rendered output

4.2. THE User_Interface SHALL display the temperature with its unit of measurement (Celsius or Fahrenheit)
  Thoughts: This tests that unit labels are included in formatted output for any temperature.
  Classification: PROPERTY
  Test Strategy: Generate random temperatures, verify all rendered outputs include unit label

4.3. THE User_Interface SHALL display the temperature with at most one decimal place
  Thoughts: This tests number formatting rules across various temperature values.
  Classification: PROPERTY
  Test Strategy: Generate random temperatures with varying decimal places, verify all are formatted to max 1 decimal

**Requirement 5: Humidity Display**

5.1. WHEN Weather_Data is successfully retrieved, THE User_Interface SHALL display the current humidity value
  Thoughts: This tests that humidity data appears in the rendered output across various humidity values.
  Classification: PROPERTY
  Test Strategy: Generate random humidity values, verify each appears in rendered output

5.2. THE User_Interface SHALL display the humidity as a percentage
  Thoughts: This tests that the percentage symbol is included for any humidity value.
  Classification: PROPERTY
  Test Strategy: Generate random humidity values, verify all rendered outputs include % symbol

5.3. THE User_Interface SHALL display the humidity with no decimal places
  Thoughts: This tests number formatting rules across various humidity values.
  Classification: PROPERTY
  Test Strategy: Generate random humidity values with decimals, verify all are formatted to integers

**Requirement 6: Precipitation Display**

6.1. WHEN Weather_Data is successfully retrieved, THE User_Interface SHALL display the current precipitation value
  Thoughts: This tests that precipitation data appears in the rendered output across various precipitation values.
  Classification: PROPERTY
  Test Strategy: Generate random precipitation values, verify each appears in rendered output

6.2. THE User_Interface SHALL display the precipitation with its unit of measurement (mm)
  Thoughts: This tests that the mm unit is included for any precipitation value.
  Classification: PROPERTY
  Test Strategy: Generate random precipitation values, verify all rendered outputs include mm unit

6.3. THE User_Interface SHALL display the precipitation with at most one decimal place
  Thoughts: This tests number formatting rules across various precipitation values.
  Classification: PROPERTY
  Test Strategy: Generate random precipitation values with varying decimals, verify all formatted to max 1 decimal

**Requirement 7: Error Handling**

7.1. WHEN the Geocoding_Service returns a city not found error, THE User_Interface SHALL display a message indicating the city could not be found
  Thoughts: This is testing specific error mapping behavior.
  Classification: EXAMPLE
  Test Strategy: Single test with CITY_NOT_FOUND error, verify appropriate message displayed

7.2. WHEN the Geocoding_Service returns a service unavailable error, THE User_Interface SHALL display a message indicating the geocoding service is temporarily unavailable
  Thoughts: This is testing specific error mapping behavior.
  Classification: EXAMPLE
  Test Strategy: Single test with SERVICE_UNAVAILABLE error, verify appropriate message displayed

7.3. WHEN the Weather_Service returns an error, THE User_Interface SHALL display a message indicating weather data could not be retrieved
  Thoughts: This tests error message display across various weather service error types.
  Classification: PROPERTY
  Test Strategy: Generate various weather service error types, verify all display appropriate error message

7.4. WHEN any error occurs, THE User_Interface SHALL allow the user to enter a different city name
  Thoughts: This tests that the UI remains functional after errors - input should be enabled for any error type.
  Classification: PROPERTY
  Test Strategy: Generate various error types, verify input remains enabled and submit button is re-enabled for all

**Requirement 8: Loading State**

8.1. WHEN the user submits a City_Name, THE User_Interface SHALL display a loading indicator
  Thoughts: This tests UI state transition behavior for any valid city name input.
  Classification: PROPERTY
  Test Strategy: Generate random valid city names, verify loading indicator appears for each

8.2. WHEN Weather_Data is successfully retrieved, THE User_Interface SHALL hide the loading indicator
  Thoughts: This tests that loading indicator is hidden after success for any weather data.
  Classification: PROPERTY
  Test Strategy: Generate random weather data responses, verify loading indicator hidden for all

8.3. WHEN an error occurs, THE User_Interface SHALL hide the loading indicator
  Thoughts: This tests that loading indicator is hidden after any error type.
  Classification: PROPERTY
  Test Strategy: Generate various error types, verify loading indicator hidden for all

8.4. WHILE the loading indicator is visible, THE User_Interface SHALL disable the submit button
  Thoughts: This tests the relationship between loading state and button state - whenever loading is true, button should be disabled.
  Classification: PROPERTY
  Test Strategy: Generate various loading state scenarios, verify submit button is disabled whenever loading indicator is visible

**Requirement 9: City Name Display**

9.1. WHEN Weather_Data is successfully retrieved, THE User_Interface SHALL display the City_Name that was searched
  Thoughts: This tests that the searched city name appears in the success display for any city name.
  Classification: PROPERTY
  Test Strategy: Generate random city names with weather data, verify each city name appears in rendered output

9.2. THE User_Interface SHALL display the city name prominently above or near the weather data
  Thoughts: This is a visual layout requirement that cannot be tested programmatically without complex DOM position analysis.
  Classification: NOT TESTABLE
  Test Strategy: Manual visual inspection

### Prework Reflection

After reviewing all properties identified in the prework, I've identified several areas for consolidation:

**Formatting Properties (Can be combined)**:
- Properties 4.2, 4.3 (temperature formatting)
- Properties 5.2, 5.3 (humidity formatting)
- Properties 6.2, 6.3 (precipitation formatting)

These can be combined into a single comprehensive property about weather data formatting that checks all formatting rules together.

**Display Properties (Can be combined)**:
- Properties 4.1, 5.1, 6.1, 9.1 (displaying values in UI)

These can be combined into a single property that verifies all weather data components appear in the rendered output.

**Loading State Properties (Logically connected)**:
- Properties 8.1, 8.2, 8.3, 8.4

These describe a state machine and can be combined into properties about state transitions and invariants.

**After consolidation, the unique properties are:**
1. Empty input validation (1.3)
2. Valid input triggers geocoding (1.4)
3. Coordinate extraction from API responses (2.2)
4. HTTP error handling for geocoding (2.4)
5. HTTP error handling for weather service (3.5)
6. Weather data formatting (combines 4.2, 4.3, 5.2, 5.3, 6.2, 6.3)
7. Weather data display (combines 4.1, 5.1, 6.1, 9.1)
8. Error message display (7.3)
9. UI remains functional after errors (7.4)
10. Loading state transitions (combines 8.1, 8.2, 8.3)
11. Submit button disabled during loading (8.4)

### Property 1: Empty Input Validation

*For any* string composed entirely of whitespace characters (including empty string, spaces, tabs, newlines), submitting it as a city name SHALL result in a validation error and no geocoding service call

**Validates: Requirements 1.3**

### Property 2: Valid Input Triggers Geocoding

*For any* non-empty string containing at least one non-whitespace character, submitting it as a city name SHALL result in a call to the geocoding service with that city name

**Validates: Requirements 1.4**

### Property 3: Coordinate Extraction

*For any* geocoding API response containing a results array with at least one element, the geocoding service SHALL extract the latitude and longitude values from the first element, and both values SHALL be within valid ranges (latitude: -90 to 90, longitude: -180 to 180)

**Validates: Requirements 2.2**

### Property 4: Geocoding HTTP Error Handling

*For any* HTTP error response (status codes 4xx or 5xx) from the geocoding API, the geocoding service SHALL return a SERVICE_UNAVAILABLE error

**Validates: Requirements 2.4**

### Property 5: Weather Service HTTP Error Handling

*For any* HTTP error response (status codes 4xx or 5xx) from the weather API, the weather service SHALL return an appropriate error (SERVICE_UNAVAILABLE or DATA_UNAVAILABLE)

**Validates: Requirements 3.5**

### Property 6: Weather Data Formatting

*For any* valid weather data (temperature, humidity, precipitation), the formatted display data SHALL satisfy:
- Temperature: includes value and unit label (°C or °F) with at most 1 decimal place
- Humidity: includes value and percentage symbol (%) with no decimal places
- Precipitation: includes value and unit label (mm) with at most 1 decimal place

**Validates: Requirements 4.2, 4.3, 5.2, 5.3, 6.2, 6.3**

### Property 7: Weather Data Display Completeness

*For any* successfully retrieved weather data, the rendered UI output SHALL contain all of the following: the searched city name, the temperature value, the humidity value, and the precipitation value

**Validates: Requirements 4.1, 5.1, 6.1, 9.1**

### Property 8: Error Message Display

*For any* error returned by the weather service, the UI SHALL display an error message indicating that weather data could not be retrieved

**Validates: Requirements 7.3**

### Property 9: UI Functional After Errors

*For any* error state (geocoding error or weather service error), the UI SHALL enable the input field and submit button, allowing the user to submit a new search

**Validates: Requirements 7.4**

### Property 10: Loading State Transitions

*For any* city search request, the UI SHALL transition through states in the following order: idle → loading (indicator visible) → success/error (indicator hidden)

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 11: Submit Button Disabled During Loading

*For any* point in time when the loading indicator is visible, the submit button SHALL be disabled

**Validates: Requirements 8.4**

## Error Handling

### Error Propagation Strategy

La aplicación implementa un enfoque de error handling en capas, donde cada capa transforma errores técnicos en errores más apropiados para la capa superior:

```
External API Errors
      ↓
Service Layer Errors (typed errors)
      ↓
Controller Layer (error routing)
      ↓
UI Layer (user-friendly messages)
```

### Error Types and Handling

**1. Validation Errors**
- **Source**: Controller layer (input validation)
- **Handling**: 
  - No service calls are made
  - UI immediately shows error message
  - User can correct input and retry
- **User Message**: "El nombre de la ciudad es requerido"

**2. City Not Found Errors**
- **Source**: Geocoding service (empty results from API)
- **Handling**:
  - Return typed error to controller
  - Controller updates UI with user-friendly message
  - Weather service is not called
- **User Message**: "No se pudo encontrar la ciudad '{cityName}'. Por favor verifica el nombre."

**3. Service Unavailable Errors**
- **Source**: Network layer (HTTP errors, timeouts, network failures)
- **Handling**:
  - Catch HTTP errors (4xx, 5xx) and network exceptions
  - Transform to typed service error
  - Controller routes to appropriate UI message
- **User Messages**:
  - Geocoding: "El servicio de geocodificación no está disponible temporalmente. Por favor intenta más tarde."
  - Weather: "Los datos meteorológicos no están disponibles en este momento. Por favor intenta más tarde."

**4. Data Unavailable Errors**
- **Source**: Weather service (malformed API response, missing fields)
- **Handling**:
  - Validate response structure
  - Check for required fields (temperature, humidity, precipitation)
  - Return typed error if any field is missing
- **User Message**: "Los datos meteorológicos están incompletos. Por favor intenta nuevamente."

### Error Recovery

**User-Initiated Recovery**:
- Todos los estados de error mantienen el input form habilitado
- El usuario puede ingresar un nuevo nombre de ciudad en cualquier momento
- Submit button está habilitado después de mostrar error
- No hay límite de reintentos

**No Automatic Retry**:
- La aplicación no reintenta automáticamente llamadas fallidas
- Los usuarios deben reintentar manualmente si lo desean
- Esto mantiene el control en manos del usuario y evita carga innecesaria en las APIs

### Logging Strategy

**Console Logging** (for development):
```typescript
// Log levels
- Error: Failed API calls, unexpected exceptions
- Warn: Empty results, validation failures
- Info: Successful operations, state transitions
- Debug: Detailed flow information
```

**Logged Information**:
- Timestamp de cada operación
- Input del usuario (city name)
- Respuestas de API (success/failure)
- Error details técnicos (solo en consola, no mostrados al usuario)
- State transitions en controller

## Testing Strategy

### Dual Testing Approach

La estrategia de testing combina:
1. **Unit Tests**: Para verificar comportamientos específicos, casos edge, y manejo de errores
2. **Property-Based Tests**: Para verificar propiedades universales a través de múltiples inputs generados

### Property-Based Testing Configuration

**Library**: [fast-check](https://github.com/dubzzz/fast-check) para TypeScript/JavaScript

**Configuration**:
- Minimum 100 iterations por property test
- Cada test debe incluir un comentario referenciando la propiedad del diseño
- Tag format: `// Feature: weather-app, Property N: [property description]`

**Example**:
```typescript
import fc from 'fast-check'

// Feature: weather-app, Property 1: Empty Input Validation
test('empty inputs are rejected', () => {
  fc.assert(
    fc.property(
      fc.string().filter(s => s.trim() === ''), // Generator for whitespace strings
      (input) => {
        const result = validateInput(input)
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('VALIDATION_ERROR')
      }
    ),
    { numRuns: 100 }
  )
})
```

### Unit Testing Strategy

**Components to Unit Test**:

1. **Input Validation**
   - Empty string rejection
   - Whitespace-only string rejection
   - Valid string acceptance
   - Trim behavior

2. **Data Formatting**
   - Temperature formatting (various values, edge cases)
   - Humidity formatting (0, 50, 100, decimals)
   - Precipitation formatting (0, small values, large values)

3. **Error Mapping**
   - Each error type to user message mapping
   - Undefined/unexpected error handling

4. **Service Layer**
   - API response parsing (success cases)
   - Empty results handling
   - Malformed response handling
   - HTTP error mapping

5. **State Management**
   - State transition logic
   - Button enable/disable logic
   - Loading indicator show/hide logic

### Integration Testing Strategy

**Integration Tests** (not property-based):
- Mock external APIs with 1-2 representative examples
- Test full workflow: input → geocoding → weather → display
- Test error workflows: invalid city, API failures
- Verify UI updates correctly for each scenario

**What to Test**:
1. Successful flow with valid city name
2. City not found scenario
3. Geocoding service unavailable
4. Weather service unavailable
5. Network failure scenarios

**Example Integration Test**:
```typescript
test('successful weather retrieval flow', async () => {
  // Mock both APIs
  mockGeocodingAPI.mockResolvedValue({
    results: [{ latitude: 52.52, longitude: 13.41 }]
  })
  mockWeatherAPI.mockResolvedValue({
    current: {
      temperature_2m: 15.3,
      relative_humidity_2m: 65,
      precipitation: 0.0
    }
  })
  
  // Submit city
  await controller.handleCitySearch('Berlin')
  
  // Verify UI shows weather data
  expect(ui.getDisplayedData()).toEqual({
    cityName: 'Berlin',
    temperature: '15.3°C',
    humidity: '65%',
    precipitation: '0.0 mm'
  })
})
```

### Test Coverage Goals

- **Unit Test Coverage**: ≥ 90% de funciones de lógica de negocio
- **Property Test Coverage**: Todas las 11 propiedades implementadas
- **Integration Test Coverage**: Todos los flujos de usuario principales y de error

### Manual Testing

**UI/UX Verification** (cannot be automated):
- Visual layout and prominence of city name (Requirement 9.2)
- Loading indicator visibility and aesthetics
- Error message clarity and readability
- Overall user experience and responsiveness
- Cross-browser compatibility
- Mobile responsiveness

