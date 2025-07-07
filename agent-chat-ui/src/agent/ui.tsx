import wmoCodeData from './wmo_code.json';
import { WeatherCondition, WeatherCodeData, WmoCodeJson } from '../types/weather';

const WeatherComponent = (props: { 
  temperature: string;
  wind_speed: string;
  wind_direction: string;
  weather_code: string;
}) => {
  // Helper function to get weather data with type safety
  function getWeatherData(code: string): { description: string; icon: string } {
    const codeData = (wmoCodeData as WmoCodeJson)[code] || wmoCodeData['0']; // Type assertion
    const isDay = true; // Simplified to day for this example; could use time logic
    const condition = codeData[isDay ? 'day' : 'night'];
    return {
      description: condition.description,
      icon: condition.image,
    };
  }

  const { description, icon } = getWeatherData(props.weather_code);

  return (
    <div className="max-w-sm w-full bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-gray-200 transform transition-all hover:scale-105 hover:shadow-3xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-sky-400 p-4 text-white text-center">
        <h2 className="text-2xl font-bold">Weather Update</h2>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Weather Icon and Temperature */}
        <div className="flex items-center justify-center mb-6">
          <img src={icon} alt={description} className="w-24 h-24 object-contain" />
          <div className="ml-4 text-center">
            <p className="text-5xl font-extrabold text-yellow-300">{props.temperature}°C</p>
            <p className="text-gray-200">{description}</p>
          </div>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-4 text-white">
          <div>
            <p className="text-sm font-medium text-gray-300">Wind</p>
            <p className="text-lg">{props.wind_speed} m/s {props.wind_direction}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300">Weather Code</p>
            <p className="text-lg">{props.weather_code}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 bg-opacity-50 p-4 text-center text-gray-300 text-sm">
        Live weather data powered by Open Meteo
      </div>
    </div>
  );
};

// Export for use
export default {
  weather: WeatherComponent,
};