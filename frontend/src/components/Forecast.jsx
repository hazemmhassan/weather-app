import React from 'react';
import { weatherInfo } from './WeatherDisplay';

function shortDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
  });
}

export default function Forecast({ weatherData }) {
  if (!weatherData?.weather_data?.daily) return null;

  const daily = weatherData.weather_data.daily;
  if (!daily.time?.length) return null;

  const days = daily.time.slice(0, 7); // up to 7 days (5-day spec + extras)

  return (
    <section className="forecast-section">
      <h2>📆 Forecast</h2>
      <div className="forecast-grid">
        {days.map((date, i) => {
          const info = weatherInfo(daily.weathercode[i]);
          return (
            <div key={date} className={`forecast-card${i === 0 ? ' forecast-card--today' : ''}`}>
              <div className="fc-date">{i === 0 ? 'Today' : shortDate(date)}</div>
              <div className="fc-icon" title={info.label}>{info.icon}</div>
              <div className="fc-label">{info.label}</div>
              <div className="fc-temps">
                <span className="temp-max">↑ {Math.round(daily.temperature_2m_max[i])}°</span>
                <span className="temp-min">↓ {Math.round(daily.temperature_2m_min[i])}°</span>
              </div>
              <div className="fc-meta">
                <small>💧 {daily.precipitation_sum[i]}mm</small>
                <small>💨 {daily.windspeed_10m_max[i]}</small>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
