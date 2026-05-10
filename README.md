# 🌤️ Weather App — Full Stack Assessment

**Built by Hazem Hassan**

---

## About Product Manager Accelerator

> **Product Manager Accelerator** is the world's largest community for product managers. We help aspiring and experienced PMs thrive in the AI era through training, education, and job opportunities. Join 20,000+ product professionals building the future.

---

## Project Overview

A **complete full-stack weather application** demonstrating modern web development practices across frontend and backend. Built in a single monorepo with:

- **Frontend:** React 18 with responsive design, interactive maps, and video integration
- **Backend:** Node.js + Express REST API with MySQL persistence
- **Database:** MySQL with CRUD operations and export functionality
- **External APIs:** Open-Meteo (weather), Nominatim (geocoding), YouTube (video search), OpenStreetMap (maps)
- **Export:** JSON, CSV, PDF, XML, Markdown formats

### Key Features

#### 🔍 Search & Discovery
- Search any location globally (city, zip code, landmark)
- Auto-detect user's current location via browser Geolocation API
- Fuzzy matching fallback (if exact match fails, search first word)
- Real-time error messages

#### 🌡️ Weather Intelligence
- Current weather with WMO condition codes → emoji icons
- 7-day forecast in interactive card layout
- Temperature, precipitation, wind speed metrics
- Supports both historical (via archive API) and forecast data

#### 🗺️ Interactive Maps
- Leaflet.js integration with OpenStreetMap tiles
- Pin search location on map
- Auto-recentre on location change

#### 🎬 Content Integration
- YouTube videos for searched locations
- 6-video grid with lazy loading
- Play badge overlay

#### 📊 Data Management
- Full CRUD UI: Create searches, Edit/Delete rows
- Saved search history table
- **5 export formats:** JSON, CSV, PDF, XML, Markdown

#### 📱 Responsive Design
- Desktop (1200px+), Tablet (600-900px), Mobile (<600px)
- Flexbox/Grid-based layout
- Touch-friendly buttons and inputs
- Modern gradient header

---

## Tech Stack

| Layer       | Technology                |
|-------------|---------------------------|
| **Frontend** | React 18, Leaflet.js, CSS3, Axios |
| **Backend**  | Node.js, Express 4, MySQL2 |
| **Database** | MySQL 8 (`weather_searches` table) |
| **Weather**  | Open-Meteo API (no key) |
| **Geocoding** | Nominatim + OpenStreetMap (no key) |
| **Maps**    | Leaflet + OSM tiles (no key) |
| **Videos**  | YouTube Data API v3 |
| **Export**  | json2csv, pdfkit, xmlbuilder2 |

---

## Project Structure

```
weather-app/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── connection.js      MySQL pool config
│   │   │   └── schema.sql         Database DDL
│   │   ├── routes/
│   │   │   ├── weather.js         CRUD endpoints + geocoding
│   │   │   ├── export.js          JSON/CSV/PDF/XML/Markdown export
│   │   │   ├── youtube.js         YouTube search proxy
│   │   │   └── map.js             Nominatim location lookup
│   │   └── server.js              Express app entry
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html             Meta tags, viewport
│   └── src/
│       ├── components/
│       │   ├── SearchBar.jsx       Location + date input, edit mode
│       │   ├── WeatherDisplay.jsx  Current weather card + WMO map
│       │   ├── Forecast.jsx        7-day forecast grid
│       │   ├── MapView.jsx         Leaflet map integration
│       │   ├── YouTubeSection.jsx  Video grid with lazy loading
│       │   ├── WeatherTable.jsx    CRUD table (Edit/Delete)
│       │   └── ExportButtons.jsx   5 export format buttons
│       ├── App.jsx                 Main state + handlers
│       ├── index.js                React 18 root
│       └── index.css               Responsive styles (480px/768px breakpoints)
│
├── README.md
└── requirements.txt
```

---

## How to Run

### Prerequisites
- Node.js installed
- MySQL installed (or XAMPP)
- YouTube Data API v3 key

### Database Setup
1. Create a database called `weather_app` in MySQL
2. Run the schema: import `backend/src/db/schema.sql` into your database

### Backend Setup
1. cd backend
2. npm install
3. Copy .env.example to .env and fill in your values
4. npm run dev — runs on http://localhost:5000

### Frontend Setup
1. cd frontend
2. npm install
3. npm start — runs on http://localhost:3000

---
## API Endpoints

### Weather CRUD
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/weather` | Create: geocode location, fetch weather from Open-Meteo, save to MySQL |
| GET | `/api/weather` | Read: list all saved searches (paginated DESC by created_at) |
| PUT | `/api/weather/:id` | Update: re-geocode location if changed, re-fetch weather, update record |
| DELETE | `/api/weather/:id` | Delete: remove saved search |

### Export
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/export?format=json` | Export all records as JSON |
| GET | `/api/export?format=csv` | Export all records as CSV |
| GET | `/api/export?format=pdf` | Export all records as formatted PDF |
| GET | `/api/export?format=xml` | Export all records as XML |
| GET | `/api/export?format=markdown` | Export all records as Markdown table |

### External Lookups
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/youtube?location=` | Search YouTube for videos about location |
| GET | `/api/map?location=` | Return lat/lng for location (Nominatim) |
| GET | `/api/health` | Server health check |

### POST /api/weather — Request Body

```json
{
  "location":  "Cairo, Egypt",
  "date_from": "2025-05-10",
  "date_to":   "2025-05-17"
}
```

**Validation:**
- `location` must not be empty
- `date_from` must be before `date_to`
- Date range must be ≤ 14 days
- Location must exist (uses Nominatim; fuzzy fallback to first word)

**Response:**
```json
{
  "id": 1,
  "location": "Cairo, Governorate of Cairo, Egypt",
  "latitude": 30.05,
  "longitude": 31.25,
  "date_from": "2025-05-10",
  "date_to": "2025-05-17",
  "weather_data": { "daily": { ... } }
}
```

---

## Environment Variables (.env)

```bash
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=weather_app
YOUTUBE_API_KEY=AIzaSyAGKje2YRpQPEZ28QTEfDcsOzy0Rw0HvY4
```

---

## Error Handling

The app handles all failure modes with clear user-facing messages:

| Scenario | Message |
|----------|---------|
| Empty search | "Please enter a location." |
| Location not found | "Location not found. Please try a different search." |
| Invalid date range | "Please enter a valid date range (max 14 days)." |
| API failure | "Unable to fetch weather data. Please try again." |
| Database error | "Unable to update/delete record. Please try again." |

---

## License & Attribution

**Built by Hazem Hassan** for Assessment Internship 2.

Data sources:
- **Open-Meteo:** https://open-meteo.com (weather, no key required)
- **Nominatim:** https://nominatim.openstreetmap.org (geocoding, no key required)
- **OpenStreetMap:** https://www.openstreetmap.org (map tiles, no key required)
- **YouTube Data API v3:** https://developers.google.com/youtube/v3 (videos, key required)

---

