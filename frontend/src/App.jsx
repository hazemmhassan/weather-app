import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SearchBar      from './components/SearchBar';
import WeatherDisplay from './components/WeatherDisplay';
import Forecast       from './components/Forecast';
import MapView        from './components/MapView';
import YouTubeSection from './components/YouTubeSection';
import WeatherTable   from './components/WeatherTable';
import ExportButtons  from './components/ExportButtons';
import './index.css';

const API = '/api';

export default function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [allSearches,    setAllSearches]    = useState([]);
  const [mapCoords,      setMapCoords]      = useState(null);
  const [youtubeVideos,  setYoutubeVideos]  = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [editingRecord,  setEditingRecord]  = useState(null);

  // ── load saved searches ───────────────────────────────────────────────────

  const loadSearches = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/weather`);
      setAllSearches(data);
    } catch {
      // silent — searches section is supplementary
    }
  }, []);

  // ── auto-detect user location on mount ───────────────────────────────────

  useEffect(() => {
    loadSearches();

    if (!('geolocation' in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { data } = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: { lat: coords.latitude, lon: coords.longitude, format: 'json' },
            headers: { 'User-Agent': 'WeatherApp/1.0' },
          });
          const name =
            data.address?.city  ||
            data.address?.town  ||
            data.address?.county ||
            data.display_name;

          setMapCoords({
            latitude:     coords.latitude,
            longitude:    coords.longitude,
            display_name: name,
          });
        } catch {
          // ignore reverse-geocode failure
        }
      },
      () => {} // user denied — silent
    );
  }, [loadSearches]);

  // ── fetch YouTube videos ──────────────────────────────────────────────────

  const fetchVideos = async (location) => {
    try {
      const { data } = await axios.get(`${API}/youtube`, {
        params: { location },
      });
      setYoutubeVideos(data);
    } catch {
      setYoutubeVideos([]);
    }
  };

  // ── search / create ───────────────────────────────────────────────────────

  const handleSearch = async (location, dateFrom, dateTo) => {
    setLoading(true);
    setError('');
    setCurrentWeather(null);
    setYoutubeVideos([]);

    try {
      const { data } = await axios.post(`${API}/weather`, {
        location,
        date_from: dateFrom,
        date_to:   dateTo,
      });

      setCurrentWeather(data);
      setMapCoords({
        latitude:     data.latitude,
        longitude:    data.longitude,
        display_name: data.location,
      });

      fetchVideos(location);
      loadSearches();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── update ────────────────────────────────────────────────────────────────

  const handleUpdate = async (id, location, dateFrom, dateTo) => {
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.put(`${API}/weather/${id}`, {
        location,
        date_from: dateFrom,
        date_to:   dateTo,
      });

      setCurrentWeather(data);
      setMapCoords({
        latitude:     data.latitude,
        longitude:    data.longitude,
        display_name: data.location,
      });

      fetchVideos(location);
      setEditingRecord(null);
      loadSearches();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update record. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this weather record?')) return;

    try {
      await axios.delete(`${API}/weather/${id}`);
      loadSearches();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete record. Please try again.');
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="app">

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-inner">
          <h1 className="header-title">
            <span className="header-icon">🌤</span> Weather App
          </h1>
          <p className="header-byline">Built by <strong>Hazem Hassan</strong></p>
          <p className="header-pma">
            Product Manager Accelerator is designed to support PM professionals through every stage of their careers — from students looking for entry-level jobs to Directors taking on leadership roles. Our community are ambitious and committed, developing PM and leadership skills through structured programs, mentorship, and a global network of product professionals.
          </p>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="app-main">

        <SearchBar
          onSearch={handleSearch}
          onUpdate={handleUpdate}
          onCancelEdit={() => setEditingRecord(null)}
          editingRecord={editingRecord}
          loading={loading}
        />

        {error && (
          <div className="alert alert-error" role="alert">
            ⚠️ {error}
            <button className="alert-close" onClick={() => setError('')}>✕</button>
          </div>
        )}

        {loading && (
          <div className="loading-banner">
            <span className="spinner" /> Fetching weather data…
          </div>
        )}

        {currentWeather && !loading && (
          <>
            <WeatherDisplay weatherData={currentWeather} />
            <Forecast       weatherData={currentWeather} />
          </>
        )}

        {mapCoords && <MapView coords={mapCoords} />}

        {youtubeVideos.length > 0 && <YouTubeSection videos={youtubeVideos} />}

        {/* ── CRUD section ── */}
        <section className="crud-section">
          <div className="crud-header">
            <h2>Saved Weather Searches</h2>
            <ExportButtons />
          </div>
          <WeatherTable
            searches={allSearches}
            onEdit={setEditingRecord}
            onDelete={handleDelete}
          />
        </section>

      </main>

      <footer className="app-footer">
        <p>Built by <strong>Hazem Hassan</strong> · Powered by Open-Meteo, Nominatim &amp; OpenStreetMap</p>
      </footer>
    </div>
  );
}
