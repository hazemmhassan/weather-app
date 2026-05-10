const express = require('express');
const axios   = require('axios');
const db      = require('../db/connection');

const router = express.Router();

// ── helpers ──────────────────────────────────────────────────────────────────

async function geocodeLocation(location) {
  const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: { q: location, format: 'json', limit: 1 },
    headers: { 'User-Agent': 'WeatherApp/1.0 (hazemhassan830@gmail.com)' },
    timeout: 8000,
  });
  if (data && data.length > 0) {
    return {
      lat:          parseFloat(data[0].lat),
      lon:          parseFloat(data[0].lon),
      display_name: data[0].display_name,
    };
  }

  // Fuzzy fallback: retry with first word only
  const firstWord = location.trim().split(/\s+/)[0];
  if (firstWord && firstWord !== location) {
    const { data: fallbackData } = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: firstWord, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'WeatherApp/1.0 (hazemhassan830@gmail.com)' },
      timeout: 8000,
    });
    if (fallbackData && fallbackData.length > 0) {
      return {
        lat:          parseFloat(fallbackData[0].lat),
        lon:          parseFloat(fallbackData[0].lon),
        display_name: fallbackData[0].display_name,
      };
    }
  }

  return null;
}

async function fetchWeather(lat, lon, dateFrom, dateTo) {
  const today    = new Date().toISOString().split('T')[0];
  const baseUrl  = dateFrom < today
    ? 'https://archive-api.open-meteo.com/v1/archive'
    : 'https://api.open-meteo.com/v1/forecast';

  const params = {
    latitude:  lat,
    longitude: lon,
    daily:     'temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode',
    timezone:  'auto',
    start_date: dateFrom,
    end_date:   dateTo,
  };

  try {
    const { data } = await axios.get(baseUrl, { params, timeout: 10000 });
    return data;
  } catch {
    // fallback to forecast API (handles near-past / near-future)
    const { data } = await axios.get('https://api.open-meteo.com/v1/forecast', { params, timeout: 10000 });
    return data;
  }
}

function validateDateRange(dateFrom, dateTo) {
  const from = new Date(dateFrom);
  const to   = new Date(dateTo);

  if (isNaN(from) || isNaN(to))
    return { valid: false, error: 'Invalid date format.' };
  if (from >= to)
    return { valid: false, error: 'Please enter a valid date range (max 14 days).' };

  const diffDays = Math.ceil((to - from) / 86_400_000);
  if (diffDays > 14)
    return { valid: false, error: 'Please enter a valid date range (max 14 days).' };

  return { valid: true };
}

// ── POST /api/weather ─────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  try {
    const { location, date_from, date_to } = req.body;

    if (!location || !location.trim())
      return res.status(400).json({ error: 'Please enter a location.' });

    if (!date_from || !date_to)
      return res.status(400).json({ error: 'Please provide date_from and date_to.' });

    const dateCheck = validateDateRange(date_from, date_to);
    if (!dateCheck.valid)
      return res.status(400).json({ error: dateCheck.error });

    const geo = await geocodeLocation(location.trim());
    if (!geo)
      return res.status(404).json({ error: 'Location not found. Please try a different search.' });

    const weatherData = await fetchWeather(geo.lat, geo.lon, date_from, date_to);

    const [result] = await db.execute(
      `INSERT INTO weather_searches
         (location, latitude, longitude, date_from, date_to, weather_data)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [geo.display_name, geo.lat, geo.lon, date_from, date_to, JSON.stringify(weatherData)]
    );

    res.status(201).json({
      id:           result.insertId,
      location:     geo.display_name,
      latitude:     geo.lat,
      longitude:    geo.lon,
      date_from,
      date_to,
      weather_data: weatherData,
    });
  } catch (err) {
    console.error('POST /api/weather:', err.message);
    res.status(500).json({ error: 'Unable to fetch weather data. Please try again.' });
  }
});

// ── GET /api/weather ──────────────────────────────────────────────────────────

router.get('/', async (_req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM weather_searches ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/weather:', err.message);
    res.status(500).json({ error: 'Unable to fetch weather data. Please try again.' });
  }
});

// ── PUT /api/weather/:id ──────────────────────────────────────────────────────

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { location, date_from, date_to } = req.body;

    const [existing] = await db.execute(
      'SELECT * FROM weather_searches WHERE id = ?', [id]
    );
    if (existing.length === 0)
      return res.status(404).json({ error: 'Record not found.' });

    const rec        = existing[0];
    const newFrom    = date_from || rec.date_from;
    const newTo      = date_to   || rec.date_to;

    const dateCheck = validateDateRange(newFrom, newTo);
    if (!dateCheck.valid)
      return res.status(400).json({ error: dateCheck.error });

    let lat         = parseFloat(rec.latitude);
    let lon         = parseFloat(rec.longitude);
    let displayName = rec.location;

    if (location && location.trim() && location.trim() !== rec.location) {
      const geo = await geocodeLocation(location.trim());
      if (!geo)
        return res.status(404).json({ error: 'Location not found. Please try a different search.' });
      lat         = geo.lat;
      lon         = geo.lon;
      displayName = geo.display_name;
    }

    const weatherData = await fetchWeather(lat, lon, newFrom, newTo);

    await db.execute(
      `UPDATE weather_searches
         SET location = ?, latitude = ?, longitude = ?,
             date_from = ?, date_to = ?, weather_data = ?
       WHERE id = ?`,
      [displayName, lat, lon, newFrom, newTo, JSON.stringify(weatherData), id]
    );

    res.json({
      id:           parseInt(id, 10),
      location:     displayName,
      latitude:     lat,
      longitude:    lon,
      date_from:    newFrom,
      date_to:      newTo,
      weather_data: weatherData,
    });
  } catch (err) {
    console.error('PUT /api/weather/:id:', err.message);
    res.status(500).json({ error: 'Unable to update weather data. Please try again.' });
  }
});

// ── DELETE /api/weather/:id ───────────────────────────────────────────────────

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.execute(
      'SELECT id FROM weather_searches WHERE id = ?', [id]
    );
    if (existing.length === 0)
      return res.status(404).json({ error: 'Record not found.' });

    await db.execute('DELETE FROM weather_searches WHERE id = ?', [id]);
    res.json({ message: 'Record deleted successfully.' });
  } catch (err) {
    console.error('DELETE /api/weather/:id:', err.message);
    res.status(500).json({ error: 'Unable to delete record. Please try again.' });
  }
});

module.exports = router;
