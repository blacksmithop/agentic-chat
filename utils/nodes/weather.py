import asyncio
from open_meteo import OpenMeteo
from open_meteo.models import HourlyParameters
from typing import TypedDict
from langgraph.graph.ui import push_ui_message
from langchain_core.messages import AIMessage
from uuid import uuid4
from utils import schema


class WeatherOutput(TypedDict):
    temperature: str
    wind_speed: str
    wind_direction: str
    weather_code: str

    def __repr__(self):
        return f"Temperature: {self.temperature} | Wind Speed: {self.wind_speed} | Wind Direction {self.wind_direction} | Weather Code: {self.weather_code}"


async def get_weather_from_coordinates(latitude: float, longitude: float):
    """Use Open-Meteo API client to get weather."""
    async with OpenMeteo() as open_meteo:
        forecast = await open_meteo.forecast(
            latitude=latitude,
            longitude=longitude,
            current_weather=True,
            hourly=[
                HourlyParameters.APPARENT_TEMPERATURE,
                HourlyParameters.WIND_SPEED_10M,
                HourlyParameters.WEATHER_CODE
            ],
        )
        
        print(f"{forecast=}")
        current_weather = forecast.current_weather
        weather = WeatherOutput(
            temperature=current_weather.temperature,
            wind_speed=current_weather.wind_speed,
            wind_direction=current_weather.wind_direction,
            weather_code=current_weather.weather_code,
        )

        return weather


def get_weather(state: schema.State):

    latitude, longitude = 9.9816, 76.2999
    weather = asyncio.run(get_weather_from_coordinates(latitude=latitude, longitude=longitude))

    message = AIMessage(
        id=str(uuid4()),
        content=f"Here's the weather for {latitude} N, {longitude} E",
    )

    # Emit UI elements associated with the message
    push_ui_message("weather", weather, message=message)
    return {"messages": [message]}
