// UI State types for the Weather App

import { WeatherDisplayData } from './models';

export type UIState = 
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'success', data: WeatherDisplayData }
  | { type: 'error', message: string };
