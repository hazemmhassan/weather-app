import React, { useState, useEffect } from 'react';

const today   = () => new Date().toISOString().split('T')[0];
const weekOut = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
};

export default function SearchBar({ onSearch, onUpdate, onCancelEdit, editingRecord, loading }) {
  const [location, setLocation] = useState('');
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo,   setDateTo]   = useState(weekOut());

  // Pre-fill when editing
  useEffect(() => {
    if (editingRecord) {
      setLocation(editingRecord.location || '');
      setDateFrom(editingRecord.date_from || today());
      setDateTo(editingRecord.date_to     || weekOut());
    } else {
      setLocation('');
      setDateFrom(today());
      setDateTo(weekOut());
    }
  }, [editingRecord]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRecord) {
      onUpdate(editingRecord.id, location, dateFrom, dateTo);
    } else {
      onSearch(location, dateFrom, dateTo);
    }
  };

  return (
    <section className="search-section">
      <form className="search-form" onSubmit={handleSubmit}>

        <div className="form-group form-group--location">
          <label htmlFor="location-input">Location</label>
          <input
            id="location-input"
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="City, zip code, landmark, or GPS coordinates…"
            autoComplete="off"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date-from">From</label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="date-to">To</label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spinner" /> Loading…</> : editingRecord ? '✏️ Update' : '🔍 Search'}
          </button>
          {editingRecord && (
            <button type="button" className="btn btn-secondary" onClick={onCancelEdit}>
              Cancel
            </button>
          )}
        </div>

      </form>
    </section>
  );
}
