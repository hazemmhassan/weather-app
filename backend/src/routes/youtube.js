const express = require('express');
const axios   = require('axios');

const router = express.Router();

// ── GET /api/youtube?location=<city> ─────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const { location } = req.query;

    if (!location || !location.trim())
      return res.status(400).json({ error: 'Please provide a location.' });

    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY)
      return res.status(500).json({ error: 'YouTube API key not configured.' });

    const { data } = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part:       'snippet',
        q:          `${location} weather travel`,
        key:        YOUTUBE_API_KEY,
        maxResults: 6,
        type:       'video',
        safeSearch: 'moderate',
      },
      timeout: 8000,
    });

    const videos = (data.items || []).map(item => ({
      id:          item.id.videoId,
      title:       item.snippet.title,
      thumbnail:   item.snippet.thumbnails.medium.url,
      channel:     item.snippet.channelTitle,
      description: item.snippet.description,
      published:   item.snippet.publishedAt,
    }));

    res.json(videos);
  } catch (err) {
    console.error('GET /api/youtube:', err.message);
    res.status(500).json({ error: 'Unable to fetch YouTube videos. Please try again.' });
  }
});

module.exports = router;
