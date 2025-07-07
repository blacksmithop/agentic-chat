export interface WeatherCondition {
  description: string;
  image: string;
}

export interface WeatherCodeData {
  day: WeatherCondition;
  night: WeatherCondition;
}

export interface WmoCodeJson {
  [key: string]: WeatherCodeData | undefined;
}