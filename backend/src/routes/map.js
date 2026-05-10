const express = require('express');
const axios   = require('axios');

const router = express.Router();

// ── GET /api/map?location=<query> ─────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const { location } = req.query;

    if (!location || !location.trim())
      return res.status(400).json({ error: 'Please provide a location.' });

    const { data } = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: location.trim(), format: 'json', limit: 1 },
      headers: { 'User-Agent': 'WeatherApp/1.0 (hazemhassan830@gmail.com)' },
      timeout: 8000,
    });

    if (!data || data.length === 0)
      return res.status(404).json({ error: 'Location not found. Please try a different search.' });

    res.json({
      latitude:     parseFloat(data[0].lat),
      longitude:    parseFloat(data[0].lon),
      display_name: data[0].display_name,
    });
  } catch (err) {
    console.error('GET /api/map:', err.message);
    res.status(500).json({ error: 'Unable to fetch map data. Please try again.' });
  }
});

module.exports = router;
