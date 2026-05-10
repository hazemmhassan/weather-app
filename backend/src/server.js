const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/weather', require('./routes/weather'));
app.use('/api/export',  require('./routes/export'));
app.use('/api/youtube', require('./routes/youtube'));
app.use('/api/map',     require('./routes/map'));

app.get('/api/health', (_req, res) =>
  res.json({ status: 'OK', message: 'Weather API is running' })
);

// 404 handler
app.use((_req, res) =>
  res.status(404).json({ error: 'Endpoint not found' })
);

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
