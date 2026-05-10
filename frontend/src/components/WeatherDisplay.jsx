import React from 'react';

// WMO weather interpretation codes → label + emoji
export const WMO = {
  0:  { label: 'Clear Sky',             icon: '☀️' },
  1:  { label: 'Mainly Clear',          icon: '🌤️' },
  2:  { label: 'Partly Cloudy',         icon: '⛅' },
  3:  { label: 'Overcast',              icon: '☁️' },
  45: { label: 'Foggy',                 icon: '🌫️' },
  48: { label: 'Icy Fog',               icon: '🌫️' },
  51: { label: 'Light Drizzle',         icon: '🌦️' },
  53: { label: 'Drizzle',               icon: '🌦️' },
  55: { label: 'Heavy Drizzle',         icon: '🌧️' },
  61: { label: 'Light Rain',            icon: '🌧️' },
  63: { label: 'Rain',                  icon: '🌧️' },
  65: { label: 'Heavy Rain',            icon: '🌧️' },
  71: { label: 'Light Snow',            icon: '❄️' },
  73: { label: 'Snow',                  icon: '❄️' },
  75: { label: 'Heavy Snow',            icon: '❄️' },
  77: { label: 'Snow Grains',           icon: '🌨️' },
  80: { label: 'Light Rain Showers',    icon: '🌦️' },
  81: { label: 'Rain Showers',          icon: '🌦️' },
  82: { label: 'Heavy Rain Showers',    icon: '🌧️' },
  85: { label: 'Snow Showers',          icon: '🌨️' },
  86: { label: 'Heavy Snow Showers',    icon: '🌨️' },
  95: { label: 'Thunderstorm',          icon: '⛈️' },
  96: { label: 'Thunderstorm + Hail',   icon: '⛈️' },
  99: { label: 'Heavy Thunderstorm',    icon: '⛈️' },
};

export function weatherInfo(code) {
  return WMO[code] || { label: 'Unknown', icon: '🌡️' };
}

export default function WeatherDisplay({ weatherData }) {
  if (!weatherData?.weather_data?.daily) return null;

  const { location, date_from, date_to, weather_data } = weatherData;
  const daily = weather_data.daily;
  if (!daily.time?.length) return null;

  const i    = 0; // first day
  const info = weatherInfo(daily.weathercode[i]);

  return (
    <section className="weather-display">
      <div className="current-card">
        <div className="current-top">
          <div>
            <h2 className="current-location">📍 {location}</h2>
            <p className="current-range">{date_from} — {date_to}</p>
          </div>
          <div className="current-icon" title={info.label}>{info.icon}</div>
        </div>

        <p className="current-condition">{info.label}</p>

        <div className="current-temps">
          <span className="temp-max">↑ {Math.round(daily.temperature_2m_max[i])}°C</span>
          <span className="temp-min">↓ {Math.round(daily.temperature_2m_min[i])}°C</span>
        </div>

        <div className="current-meta">
          <span>💧 {daily.precipitation_sum[i]} mm</span>
          <span>💨 {daily.windspeed_10m_max[i]} km/h</span>
          <span>📅 {daily.time[i]}</span>
        </div>
      </div>
    </section>
  );
}
